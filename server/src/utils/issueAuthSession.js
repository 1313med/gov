const generateToken = require("./generateToken");
const {
  getUserRoles,
  getPrimaryRole,
} = require("./userRoles");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function issueAuthSession(user, res) {
  const token = generateToken(user);
  res.cookie("token", token, COOKIE_OPTIONS);

  const roles = getUserRoles(user);
  const primaryRole = getPrimaryRole(user);

  return {
    _id: user._id,
    name: user.name,
    role: primaryRole,
    roles,
    token,
    staffForOwnerId: user.staffForOwnerId || null,
    staffPermissions: user.staffPermissions || null,
  };
}

module.exports = { issueAuthSession, COOKIE_OPTIONS };
