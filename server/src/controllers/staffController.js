const crypto = require("crypto");
const User = require("../models/User");
const StaffInvite = require("../models/StaffInvite");
const { sendStaffInvite } = require("../utils/emailService");

// ── POST /api/staff/invite ─────────────────────────────────────────────────────
exports.inviteStaff = async (req, res, next) => {
  try {
    const { email, name, permissions } = req.body;
    if (!email || !name) return res.status(400).json({ message: "email and name are required" });

    const normalizedEmail = email.trim().toLowerCase();
    const perms = permissions || {};

    // ── Fast path: user already has a Goovoiture account → add directly ──────
    const existingUser = await User.findOne({ email: normalizedEmail, deletedAt: null });
    if (existingUser) {
      if (String(existingUser._id) === String(req.user._id)) {
        return res.status(400).json({ message: "You cannot add yourself as staff" });
      }
      if (existingUser.staffForOwnerId && String(existingUser.staffForOwnerId) !== String(req.user._id)) {
        return res.status(409).json({ message: "This user is already staff for another agency" });
      }
      existingUser.staffForOwnerId  = req.user._id;
      existingUser.staffPermissions = { manageBookings: true, manageMessages: true, viewAnalytics: false, managePricing: false, ...perms };
      existingUser.isEmailVerified  = true; // allow immediate login without verify step
      await existingUser.save();
      // Revoke any lingering pending invites for this email
      await StaffInvite.updateMany({ ownerId: req.user._id, email: normalizedEmail, status: "pending" }, { status: "revoked" });
      return res.status(201).json({ message: "Staff member added directly", direct: true });
    }

    // ── Slow path: no account yet → send email invite ─────────────────────────
    await StaffInvite.updateMany(
      { ownerId: req.user._id, email: normalizedEmail, status: "pending" },
      { status: "revoked" }
    );

    const token     = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await StaffInvite.create({
      ownerId: req.user._id,
      email:   normalizedEmail,
      name,
      permissions: perms,
      token,
      expiresAt,
    });

    const acceptUrl = `${process.env.CLIENT_URL}/staff/accept?token=${token}`;
    await sendStaffInvite({ to: normalizedEmail, staffName: name, ownerName: req.user.name, acceptUrl, expiresAt }).catch(() => {});

    res.status(201).json({
      message: "Staff invite sent by email",
      direct: false,
      invite: { _id: invite._id, email: normalizedEmail, name, expiresAt, status: invite.status },
    });
  } catch (err) { next(err); }
};

// ── POST /api/staff/accept ─────────────────────────────────────────────────────
exports.acceptInvite = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "token is required" });

    const invite = await StaffInvite.findOne({ token, status: "pending" }).select("+token");
    if (!invite) return res.status(404).json({ message: "Invalid or expired invite" });
    if (invite.expiresAt < new Date()) {
      invite.status = "revoked";
      await invite.save();
      return res.status(410).json({ message: "Invite has expired" });
    }

    req.user.staffForOwnerId  = invite.ownerId;
    req.user.staffPermissions = invite.permissions;
    await req.user.save();

    invite.status           = "accepted";
    invite.acceptedByUserId = req.user._id;
    await invite.save();

    res.json({ message: "You are now a staff member for this rental agency" });
  } catch (err) { next(err); }
};

// ── GET /api/staff/my-team ─────────────────────────────────────────────────────
exports.getMyStaff = async (req, res, next) => {
  try {
    const staff = await User.find({ staffForOwnerId: req.user._id, deletedAt: null })
      .select("name email avatar staffPermissions createdAt")
      .lean();

    const pending = await StaffInvite.find({ ownerId: req.user._id, status: "pending" })
      .select("email name permissions expiresAt createdAt")
      .lean();

    res.json({ staff, pendingInvites: pending });
  } catch (err) { next(err); }
};

// ── DELETE /api/staff/invite/:inviteId ────────────────────────────────────────
exports.cancelInvite = async (req, res, next) => {
  try {
    const invite = await StaffInvite.findOne({
      _id: req.params.inviteId,
      ownerId: req.user._id,
      status: "pending",
    });
    if (!invite) return res.status(404).json({ message: "Pending invite not found" });

    invite.status = "revoked";
    await invite.save();
    res.json({ message: "Invite cancelled" });
  } catch (err) { next(err); }
};

// ── DELETE /api/staff/:userId ──────────────────────────────────────────────────
exports.removeStaff = async (req, res, next) => {
  try {
    const staffMember = await User.findOne({
      _id: req.params.userId,
      staffForOwnerId: req.user._id,
      deletedAt: null,
    });
    if (!staffMember) return res.status(404).json({ message: "Staff member not found" });

    staffMember.staffForOwnerId  = null;
    staffMember.staffPermissions = {};
    await staffMember.save();
    res.json({ message: "Staff member removed" });
  } catch (err) { next(err); }
};

// ── PUT /api/staff/:userId/permissions ────────────────────────────────────────
exports.updateStaffPermissions = async (req, res, next) => {
  try {
    const { permissions } = req.body;
    const staffMember = await User.findOne({
      _id: req.params.userId,
      staffForOwnerId: req.user._id,
      deletedAt: null,
    });
    if (!staffMember) return res.status(404).json({ message: "Staff member not found" });

    staffMember.staffPermissions = { ...staffMember.staffPermissions, ...permissions };
    await staffMember.save();
    res.json({ message: "Permissions updated", staffPermissions: staffMember.staffPermissions });
  } catch (err) { next(err); }
};
