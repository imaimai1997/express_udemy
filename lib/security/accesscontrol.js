const {
  ACCOUNT_LOCK_WINDOW,
  ACCOUNT_LOCK_THERESHOLD,
  ACCOUNT_LOCK_TIME,
  MAX_LOGIN_HISTORY,
} = require("../../config/application.config.js").security;
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { mySQLClient, sql } = require("../database/client.js");
const PRIVILEGE = {
  NORMAL: "normal",
};
const LOGIN_STATUS = {
  SUCCESS: 0,
  FAILURE: 1,
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
      var now = new Date();
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
        // Delete login log
        await mySQLClient.executeQuery(await sql("DELETE_LOGIN_HISTORY"), [
          user.id,
          user.id,
          MAX_LOGIN_HISTORY - 1,
        ]);

        // Compare password
        if (!(await bcrypt.compare(password, results[0].password))) {
          // Insert failure login log
          await mySQLClient.executeQuery(await sql("INSERT_LOGIN_HISTORY"), [
            user.id,
            now,
            LOGIN_STATUS.FAILURE,
          ]);

          return done(
            null,
            false,
            req.flash("message", "ユーザー名またはパスワードが間違っています")
          );
        }
        // Insert success login log
        await mySQLClient.executeQuery(await sql("INSERT_LOGIN_HISTORY"), [
          user.id,
          now,
          LOGIN_STATUS.SUCCESS,
        ]);
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
