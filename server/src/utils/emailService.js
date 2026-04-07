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
