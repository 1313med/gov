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

