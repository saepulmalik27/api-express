const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const gravatar = require("gravatar");
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/key.js");
const passport = require("passport");
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');


/**
 * @route GET api/users/register
 * @desc get register user
 * @access private
 */
router.post("/register", (req, res) => {
  const {errors, isValid} = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200",
        r: "pg",
        d: "mm",
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password,
      });

      bycrypt.genSalt(10, (err, salt) => {
        bycrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          console.log(newUser, "1");
          newUser
            .save()
            .then((user) => {
              console.log(user, "2");
              return res.json(user);
            })
            .catch((err) => console.log(err));
        });
      });
    }
  });
});


/**
 * @route GET api/users/login
 * @desc get login user
 * @access private
 */

router.post("/login", (req, res) => {
  // res.json(req.body);
  const {errors, isValid} = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { email, password } = req.body;

  User.findOne({ email: email }).then((user) => {
    if (!user) {
      errors.email ="User not found"
      return res.status(404).json(errors);
    }

    bycrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        // res.json({ msg: "Success" });

        // User Matched
        const payload = { id: user.id, name: user.name, avatar: user.avatar };

        // sign token
        console.log(keys.secretOrkey);
        jwt.sign(
          payload,
          keys.secretOrkey,
          { expiresIn: 3600 },
          (err, token) => {
            if (token) {
              res.json({
                success: true,
                token: "Bearer " + token,
              });
            } else {
              
              res.status(400).json({ error: "token undefined" });
            }
          }
        );
      } else {
        errors.password = "password incorrect";
        return res.status(400).json(errors);
      }
    });
  });
});

/**
 * @route GET api/users
 * @desc get users
 * @access private
 */
router.get('/',passport.authenticate('jwt', {session : false}), (req, res) => {
  const errors = {};
  User.find().then(
    users => {
      if (!users) {
        errors.nousers = "there no users yet";
        return res.status(404).json(errors)
      }
      res.json(users)
    }
  ).catch(err => res.status(404).json(err))
})

/**
 * @route GET api/users/current
 * @desc get current user
 * @access private
 */
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { id, name, email } = req.user;
    res.json({ id, name, email });
  }
);

module.exports = router;
