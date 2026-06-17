const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const User = require("../models/User");

passport.use(
  new LocalStrategy(
    {
      usernameField: "identifier",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, _identifier, password, done) => {
      try {
        const identifier = String(
          req.body?.identifier || req.body?.phone || ""
        ).trim();

        if (!identifier || !password) {
          return done(null, false, {
            status: 400,
            message: "identifier and password are required",
          });
        }

        const user = await User.findOne({
          deletedAt: null,
          $or: [{ phone: identifier }, { email: identifier.toLowerCase() }],
        });

        if (!user) {
          return done(null, false, {
            status: 401,
            message: "Invalid credentials",
          });
        }

        if (user.isBanned) {
          return done(null, false, {
            status: 403,
            message:
              "Your account has been suspended. Please contact support.",
          });
        }

        const ok = await user.matchPassword(password);
        if (!ok) {
          return done(null, false, {
            status: 401,
            message: "Invalid credentials",
          });
        }

        if (user.email && !user.isEmailVerified) {
          return done(null, false, {
            status: 403,
            message: "Please verify your email before logging in.",
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

module.exports = passport;
