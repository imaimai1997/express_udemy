const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { mySQLClient, sql } = require("../database/client.js");
const PRIVILEGE = {
  NORMAL: "normal",
};
var initialize, authenticate, authorize;

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  "local-strategy",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      var results, user;
      try {
        // Get user info
        results = await mySQLClient.executeQuery(
          await sql("SELECT_USER_BY_EMAIL"),
          [username]
        );
        if (results.length !== 1) {
          return done(
            null,
            false,
            req.flash("message", "ユーザー名 または パスワードが間違っています")
          );
        }
        user = {
          id: results[0].id,
          name: results[0].name,
          email: results[0].email,
          permissions: [PRIVILEGE.NORMAL],
        };
        // Compare password
        if (!(await bcrypt.compare(password, results[0].password))) {
          return done(
            null,
            false,
            req.flash("message", "ユーザー名またはパスワードが間違っています")
          );
        }
      } catch (err) {
        return done(err);
      }

      // Session regenerate
      req.session.regenerate((err) => {
        if (err) {
          done(err);
        } else {
          done(null, user);
        }
      });
    }
  )
);
initialize = function () {
  return [
    passport.initialize(),
    passport.session(),
    function (req, res, next) {
      if (req.user) {
        res.locals.user = req.user;
      }
      next();
    },
  ];
};

authenticate = function () {
  return passport.authenticate("local-strategy", {
    successRedirect: "/account",
    failureRedirect: "/account/login",
  });
};

authorize = function (privilege) {
  return function (req, res, next) {
    if (
      req.isAuthenticated() &&
      (req.user.permissions || []).indexOf(privilege) >= 0
    ) {
      next();
    } else {
      res.redirect("/account/login");
    }
  };
};
module.exports = {
  initialize,
  authenticate,
  authorize,
  PRIVILEGE,
};
