const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const gravatar = require("gravatar");
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/key.js");
const passport = require("../../")

router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
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

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email: email }).then((user) => {
    if (!user) {
      return res.status(404).json({ email: "User not found" });
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
                        success : true,
                        token : 'Bearer ' + token
                    })    
                }else{
                    res.status(400).json({error : 'token undefined'});
                }
                
            });
      } else {
        return res.status(400).json({ password: "password incorrect" });
      }
    });
  });
});

module.exports = router;
