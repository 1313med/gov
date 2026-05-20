const CreditCheck = require("../models/CreditCheck");
const Notification = require("../models/Notification");
const { emitNotification } = require("../utils/socketManager");

const notify = async (userId, message, type) => {
  const n = await Notification.create({ user: userId, message, type });
  emitNotification(userId.toString(), n);
};

// ── POST /api/credit-check ────────────────────────────────────────────────────
exports.requestCreditCheck = async (req, res, next) => {
  try {
    const { listingId, immatriculation, ownerCin, brand, model, year } = req.body;

    if (!immatriculation && !ownerCin) {
      return res.status(400).json({ message: "At least one of immatriculation or ownerCin is required" });
    }

    const check = await CreditCheck.create({
      requesterId:     req.user._id,
      listingId:       listingId || null,
      immatriculation: immatriculation || "",
      ownerCin:        ownerCin        || "",
      brand:           brand           || "",
      model:           model           || "",
      year:            year            || null,
      status:          "pending",
      feePaid:         0,
    });

    res.status(201).json({
      message: "Credit check request submitted. You will be notified within 48 hours.",
      checkId: check._id,
      status:  check.status,
    });
  } catch (err) { next(err); }
};

// ── GET /api/credit-check/my ──────────────────────────────────────────────────
exports.getMyCreditChecks = async (req, res, next) => {
  try {
    const checks = await CreditCheck.find({ requesterId: req.user._id })
      .populate("listingId", "title brand model year price")
      .sort({ createdAt: -1 })
      .lean();
    res.json(checks);
  } catch (err) { next(err); }
};

// ── GET /api/credit-check/:id ─────────────────────────────────────────────────
exports.getCreditCheckById = async (req, res, next) => {
  try {
    const check = await CreditCheck.findOne({ _id: req.params.id, requesterId: req.user._id })
      .populate("listingId", "title brand model year price")
      .lean();
    if (!check) return res.status(404).json({ message: "Credit check not found" });
    res.json(check);
  } catch (err) { next(err); }
};

// ── PUT /api/credit-check/:id (ADMIN) ────────────────────────────────────────
exports.adminUpdateCreditCheck = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    const validStatuses = ["pending", "clear", "flagged", "unverifiable"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const check = await CreditCheck.findById(req.params.id);
    if (!check) return res.status(404).json({ message: "Credit check not found" });

    check.status      = status;
    check.adminNote   = adminNote || "";
    check.reviewedAt  = new Date();
    check.reviewedBy  = req.user._id;
    await check.save();

    const statusMessages = {
      clear:        "Bonne nouvelle ! Votre vérification de crédit est revenue SANS charge bancaire. La vente peut se faire sereinement.",
      flagged:      "ATTENTION : Notre vérification indique que ce véhicule a une charge bancaire active (crédit en cours). Nous vous déconseillons d'acheter sans résolution préalable.",
      unverifiable: "Nous n'avons pas pu vérifier le statut de crédit de ce véhicule avec les informations fournies. Essayez avec plus de détails.",
    };

    await notify(
      check.requesterId,
      statusMessages[status] || `Votre vérification de crédit (réf. ${check._id.toString().slice(-6)}) a été mise à jour.`,
      status === "flagged" ? "vehicle_issue" : "approved"
    );

    res.json(check);
  } catch (err) { next(err); }
};

// ── GET /api/credit-check/listing/:listingId ──────────────────────────────────
// Public: get the latest completed check result for a listing (for badge on listing card)
exports.getListingCreditStatus = async (req, res, next) => {
  try {
    const check = await CreditCheck.findOne({
      listingId: req.params.listingId,
      status: { $in: ["clear", "flagged"] },
    })
      .sort({ reviewedAt: -1 })
      .select("status reviewedAt")
      .lean();

    res.json({ check: check || null });
  } catch (err) { next(err); }
};
