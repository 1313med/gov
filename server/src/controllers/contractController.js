const Booking = require("../models/Booking");
const RentalListing = require("../models/RentalListing");
const User = require("../models/User");

// ── GET /api/contracts/:bookingId ─────────────────────────────────────────────
// Returns structured contract data; the client generates the PDF with jsPDF
exports.getContractData = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.bookingId, deletedAt: null })
      .populate("rentalId")
      .populate("customerId", "name phone email nationalId driverLicense city")
      .lean();

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Allow access to owner or customer
    const rental = booking.rentalId;
    const isCustomer = booking.customerId._id.toString() === req.user._id.toString();
    const isOwner    = rental.rentalOwnerId.toString()   === req.user._id.toString();
    if (!isCustomer && !isOwner) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const owner = await User.findById(rental.rentalOwnerId)
      .select("name phone email city nationalId")
      .lean();

    const customer   = booking.customerId;
    const days       = Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / 86400000);
    const extrasRows = (booking.selectedExtras || []).map((e) => ({
      label: e.label,
      pricePerDay: e.pricePerDay,
      total: e.pricePerDay * days,
    }));

    const cancelPolicies = {
      flexible: "Annulation gratuite jusqu'à 24h avant la prise en charge.",
      moderate: "Remboursement à 50% si annulé 48h à l'avance.",
      strict:   "Aucun remboursement dans les 72h avant la prise en charge.",
    };

    res.json({
      contractDate: new Date().toISOString(),
      bookingRef:   booking._id.toString().slice(-8).toUpperCase(),
      owner: {
        name:      owner.name,
        phone:     owner.phone,
        email:     owner.email || "",
        city:      owner.city  || "",
        cinNumber: owner.nationalId?.number || "—",
      },
      customer: {
        name:          customer.name,
        phone:         customer.phone,
        email:         customer.email || "",
        city:          customer.city  || "",
        cinNumber:     customer.nationalId?.number    || "—",
        permisNumber:  customer.driverLicense?.number || "—",
        permisExpiry:  customer.driverLicense?.expiryDate || null,
      },
      vehicle: {
        brand:      rental.brand,
        model:      rental.model,
        year:       rental.year,
        color:      rental.color || "—",
        fuel:       rental.fuel  || "—",
        mileage:    rental.mileage || "—",
      },
      rental: {
        startDate:     booking.startDate,
        endDate:       booking.endDate,
        days,
        pricePerDay:   rental.pricePerDay,
        baseTotal:     rental.pricePerDay * days,
        extrasRows,
        extrasTotal:   booking.extrasTotal || 0,
        appliedOffer:  booking.appliedOfferTitle || null,
        totalAmount:   booking.totalAmount,
        fuelPolicy:    rental.fuelPolicy || "Plein → Plein",
        cancelPolicy:  cancelPolicies[rental.cancelPolicy] || cancelPolicies.flexible,
        airportDelivery: rental.airportDeliveryOffered
          ? `Livraison aéroport incluse (${rental.airportDeliveryFeeMad} MAD)`
          : null,
      },
      isPaid: booking.isPaid,
    });
  } catch (err) { next(err); }
};
