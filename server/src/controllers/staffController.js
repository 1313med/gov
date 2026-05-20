const crypto = require("crypto");
const User = require("../models/User");
const StaffInvite = require("../models/StaffInvite");

// ── POST /api/staff/invite ─────────────────────────────────────────────────────
exports.inviteStaff = async (req, res, next) => {
  try {
    const { phone, name, permissions } = req.body;
    if (!phone || !name) return res.status(400).json({ message: "phone and name are required" });

    // Check the invited user is not already staff for someone else
    const existingUser = await User.findOne({ phone, deletedAt: null });
    if (existingUser?.staffForOwnerId) {
      return res.status(409).json({ message: "This user is already a staff member for another agency" });
    }

    const token     = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await StaffInvite.create({
      ownerId: req.user._id,
      phone,
      name,
      permissions: permissions || {},
      token,
      expiresAt,
    });

    // TODO: send WhatsApp invite link with token
    res.status(201).json({
      message: "Staff invite created",
      invite: { _id: invite._id, phone, name, expiresAt, status: invite.status },
      // In production, the token is sent via WhatsApp — not exposed in API response
    });
  } catch (err) { next(err); }
};

// ── POST /api/staff/accept ─────────────────────────────────────────────────────
exports.acceptInvite = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "token is required" });

    const invite = await StaffInvite.findOne({ token, status: "pending" }).select("+token");
    if (!invite)             return res.status(404).json({ message: "Invalid or expired invite" });
    if (invite.expiresAt < new Date()) {
      invite.status = "revoked";
      await invite.save();
      return res.status(410).json({ message: "Invite has expired" });
    }

    // Link the accepting user as staff for the owner
    req.user.staffForOwnerId   = invite.ownerId;
    req.user.staffPermissions  = invite.permissions;
    await req.user.save();

    invite.status            = "accepted";
    invite.acceptedByUserId  = req.user._id;
    await invite.save();

    res.json({ message: "You are now a staff member for this rental agency" });
  } catch (err) { next(err); }
};

// ── GET /api/staff/my-team ─────────────────────────────────────────────────────
exports.getMyStaff = async (req, res, next) => {
  try {
    const staff = await User.find({ staffForOwnerId: req.user._id, deletedAt: null })
      .select("name phone avatar staffPermissions createdAt")
      .lean();

    const pending = await StaffInvite.find({ ownerId: req.user._id, status: "pending" })
      .select("phone name permissions expiresAt createdAt")
      .lean();

    res.json({ staff, pendingInvites: pending });
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
