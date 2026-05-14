const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const send = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === "your_email@gmail.com") {
    // Email not configured – log and skip silently
    console.log(`[EMAIL SKIPPED] To: ${to} | Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "Goovoiture <noreply@goovoiture.com>",
    to,
    subject,
    html,
  });
};

// ── Templates ──────────────────────────────────────────────────────────────

exports.sendWelcome = (user) =>
  send({
    to: user.email,
    subject: "Welcome to Goovoiture!",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#141412">Welcome, ${user.name}!</h2>
        <p>Your account has been created successfully.</p>
        <p>Start browsing cars at <a href="${process.env.CLIENT_URL}">${process.env.CLIENT_URL}</a></p>
      </div>`,
  });

exports.sendBookingConfirmed = (booking, rental, customer) =>
  send({
    to: customer.email,
    subject: `Booking Confirmed – ${rental.title}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#0c9966">Booking Confirmed ✓</h2>
        <p>Hi ${customer.name}, your booking for <strong>${rental.title}</strong> has been confirmed.</p>
        <p><strong>Dates:</strong> ${new Date(booking.startDate).toDateString()} → ${new Date(booking.endDate).toDateString()}</p>
        <p><strong>Total:</strong> ${booking.totalAmount ? booking.totalAmount.toLocaleString() + " MAD" : "—"}</p>
        <p>View your bookings at <a href="${process.env.CLIENT_URL}/my-bookings">${process.env.CLIENT_URL}/my-bookings</a></p>
      </div>`,
  });

exports.sendBookingRejected = (booking, rental, customer) =>
  send({
    to: customer.email,
    subject: `Booking Rejected – ${rental.title}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#c93030">Booking Rejected</h2>
        <p>Hi ${customer.name}, unfortunately your booking request for <strong>${rental.title}</strong> was not accepted.</p>
        <p>You can browse other available cars at <a href="${process.env.CLIENT_URL}/rentals">${process.env.CLIENT_URL}/rentals</a></p>
      </div>`,
  });

exports.sendBookingRequest = (booking, rental, owner) =>
  send({
    to: owner.email,
    subject: `New Booking Request – ${rental.title}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#3d3af5">New Booking Request</h2>
        <p>Hi ${owner.name}, you have a new booking request for <strong>${rental.title}</strong>.</p>
        <p><strong>Dates:</strong> ${new Date(booking.startDate).toDateString()} → ${new Date(booking.endDate).toDateString()}</p>
        <p>Manage it at <a href="${process.env.CLIENT_URL}/owner-bookings">${process.env.CLIENT_URL}/owner-bookings</a></p>
      </div>`,
  });

exports.sendCustomerRentalFeedbackInvite = (booking, rental, customer) =>
  send({
    to: customer.email,
    subject: `How was your rental? – ${rental?.title || "Your trip"}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#3d3af5">Share your feedback</h2>
        <p>Hi ${customer.name}, your rental period for <strong>${rental?.title || "your booking"}</strong> has ended.</p>
        <p>We’d love a short review of the car and your experience — it helps other renters and your host.</p>
        <p style="text-align:center;margin:28px 0">
          <a href="${process.env.CLIENT_URL}/my-bookings" style="background:#7c6bff;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
            Leave feedback
          </a>
        </p>
        <p style="color:#888;font-size:13px">Dates: ${new Date(booking.startDate).toDateString()} → ${new Date(booking.endDate).toDateString()}</p>
      </div>`,
  });

/** Owner: customer’s post-trip feedback was published on the rental listing (public reviews). */
exports.sendOwnerListingReviewPosted = (owner, rental, customer, { overall, listingPath }) => {
  const base = (process.env.CLIENT_URL || "").replace(/\/$/, "");
  const url = `${base}${listingPath}`;
  const summary =
    overall === "good"
      ? "They left a positive review (shown on your listing’s Reviews section)."
      : "They left a review that needs attention (shown on your listing’s Reviews section).";
  return send({
    to: owner.email,
    subject: `New review on your rental — ${rental?.title || "Your listing"}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#3d3af5">New customer review</h2>
        <p>Hi ${owner.name}, <strong>${customer?.name || "A customer"}</strong> shared feedback after their trip for <strong>${rental?.title || "your listing"}</strong>.</p>
        <p>${summary}</p>
        <p style="text-align:center;margin:28px 0">
          <a href="${url}" style="background:#7c6bff;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
            View listing &amp; reviews
          </a>
        </p>
        <p style="color:#888;font-size:13px">You were also notified in the app. Trip details remain in your owner bookings.</p>
      </div>`,
  });
};

exports.sendBookingSubmitted = (booking, rental, customer) =>
  send({
    to: customer.email,
    subject: `Booking Request Sent – ${rental.title}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#3d3af5">Booking Request Sent</h2>
        <p>Hi ${customer.name}, your booking request for <strong>${rental.title}</strong> was submitted successfully.</p>
        <p><strong>Status:</strong> Pending owner approval</p>
        <p><strong>Dates:</strong> ${new Date(booking.startDate).toDateString()} → ${new Date(booking.endDate).toDateString()}</p>
        <p><strong>Total:</strong> ${booking.totalAmount ? booking.totalAmount.toLocaleString() + " MAD" : "—"}</p>
        <p>You will receive another email once the owner confirms or rejects the request.</p>
      </div>`,
  });

exports.sendListingApproved = (listing, user) =>
  send({
    to: user.email,
    subject: `Your listing "${listing.title}" is now live!`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#0c9966">Listing Approved ✓</h2>
        <p>Hi ${user.name}, your listing <strong>${listing.title}</strong> has been approved and is now visible to buyers.</p>
        <p>View your listings at <a href="${process.env.CLIENT_URL}">${process.env.CLIENT_URL}</a></p>
      </div>`,
  });

exports.sendListingRejected = (listing, user) =>
  send({
    to: user.email,
    subject: `Your listing "${listing.title}" was not approved`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#c93030">Listing Rejected</h2>
        <p>Hi ${user.name}, your listing <strong>${listing.title}</strong> did not meet our guidelines and was rejected.</p>
        <p>You can edit and resubmit it from your dashboard.</p>
      </div>`,
  });

exports.sendPasswordReset = (user, resetUrl) =>
  send({
    to: user.email,
    subject: "Reset your Goovoiture password",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#141412">Password Reset Request</h2>
        <p>Hi ${user.name}, you requested to reset your password.</p>
        <p>Click the button below within <strong>1 hour</strong> to set a new password:</p>
        <p style="text-align:center;margin:28px 0">
          <a href="${resetUrl}" style="background:#7c6bff;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
            Reset Password
          </a>
        </p>
        <p style="color:#888;font-size:13px">If you did not request this, you can safely ignore this email — your password will not change.</p>
        <p style="color:#aaa;font-size:12px;word-break:break-all">Or copy this link: ${resetUrl}</p>
      </div>`,
  });

exports.sendEmailVerification = (user, verifyUrl) =>
  send({
    to: user.email,
    subject: "Verify your Goovoiture email address",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#141412">Verify Your Email</h2>
        <p>Hi ${user.name}, please verify your email address to unlock all features.</p>
        <p>The link expires in <strong>24 hours</strong>.</p>
        <p style="text-align:center;margin:28px 0">
          <a href="${verifyUrl}" style="background:#0c9966;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
            Verify Email
          </a>
        </p>
        <p style="color:#aaa;font-size:12px;word-break:break-all">Or copy this link: ${verifyUrl}</p>
      </div>`,
  });

exports.sendNewMessage = (sender, recipient, preview) =>
  send({
    to: recipient.email,
    subject: `New message from ${sender.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#3d3af5">New Message</h2>
        <p>Hi ${recipient.name}, <strong>${sender.name}</strong> sent you a message:</p>
        <blockquote style="border-left:3px solid #ddd;padding-left:12px;color:#555">${preview}</blockquote>
        <p><a href="${process.env.CLIENT_URL}/messages">View conversation →</a></p>
      </div>`,
  });

exports.sendCarExpiryReminder = (user, alerts) => {
  const rows = alerts
    .map(
      (a) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">${a.label}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;color:${a.daysLeft <= 7 ? "#c93030" : "#d97706"};font-weight:700">
        ${a.daysLeft <= 0 ? "Expiré" : `${a.daysLeft} jour(s)`}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">${a.expiryDate}</td>
    </tr>`,
    )
    .join("");

  return send({
    to: user.email,
    subject: `Rappel Mon Garage — ${alerts.length} échéance(s) à renouveler`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#141412">Rappel Mon Garage 🚗</h2>
        <p>Bonjour ${user.name}, votre véhicule <strong>${alerts[0]?.carName || ""}</strong> a des échéances qui approchent.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <thead>
            <tr style="background:#f8f8f8">
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#888;text-transform:uppercase">Document / Service</th>
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#888;text-transform:uppercase">Délai</th>
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#888;text-transform:uppercase">Date d'expiration</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="text-align:center;margin:24px 0">
          <a href="${process.env.CLIENT_URL}" style="background:#7c6bff;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
            Ouvrir Mon Garage
          </a>
        </p>
      </div>`,
  });
};

exports.sendMaintenanceReminder = (owner, records) => {
  const rows = records.map((r) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">${r.rentalId?.title || "—"}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">${r.type}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">${r.nextServiceDate ? new Date(r.nextServiceDate).toLocaleDateString() : "—"}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">${r.nextServiceMileage ? r.nextServiceMileage.toLocaleString() + " km" : "—"}</td>
    </tr>
  `).join("");

  return send({
    to: owner.email,
    subject: `Maintenance reminder — ${records.length} service(s) due soon`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#141412">Maintenance Due Soon</h2>
        <p>Hi ${owner.name}, you have <strong>${records.length}</strong> scheduled maintenance service(s) coming up within the next 7 days.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <thead>
            <tr style="background:#f8f8f8">
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#888;text-transform:uppercase">Car</th>
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#888;text-transform:uppercase">Type</th>
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#888;text-transform:uppercase">Due Date</th>
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#888;text-transform:uppercase">Mileage</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p>Block your calendar to avoid booking conflicts during the service period.</p>
        <p style="text-align:center;margin:24px 0">
          <a href="${process.env.CLIENT_URL}/owner/maintenance" style="background:#7c6bff;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
            View Maintenance Log
          </a>
        </p>
      </div>`,
  });
};

