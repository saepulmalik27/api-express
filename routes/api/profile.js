const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

/**
 * @route api.profile
 * @desc get current users profile
 * @access private
 */
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (!profile) {
          errors.noprofile = "there is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch((err) => res.status(404).json(err));
  }
);

/**
 * @route api/profile/
 * @desc create and update user profile
 * @access private
 */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    const profilefields = {};
    if (req.body.handle) {
      profilefields.handle = req.body.handle;
    }
    if (req.body.company) {
      profilefields.company = req.body.company;
    }
    if (req.body.website) {
      profilefields.website = req.body.website;
    }
    if (req.body.location) {
      profilefields.location = req.body.location;
    }
    if (req.body.status) {
      profilefields.status = req.body.status;
    }
    if (req.body.bio) {
      profilefields.bio = req.body.bio;
    }
    if (req.body.githubusername) {
      profilefields.githubusername = req.body.githubusername;
    }
    if (req.body.date) {
      profilefields.date = req.body.date;
    }

    // skill
    if (typeof req.body.skills !== undefined) {
      profilefields.skills = req.body.skills.split(",");
    }

    // social
    profilefields.social = {};
    if (req.body.youtube) {
      profilefields.social.youtube = req.body.youtube;
    }
    if (req.body.twitter) {
      profilefields.social.twitter = req.body.twitter;
    }
    if (req.body.facebook) {
      profilefields.social.facebook = req.body.facebook;
    }
    if (req.body.linkedin) {
      profilefields.social.linkedin = req.body.linkedin;
    }
    if (req.body.instagram) {
      profilefields.social.instagram = req.body.instagram;
    }

    Profile.findOne({ user: req.user.id }).then((profile) => {
      if (profile) {
        // update
        profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profilefields },
          {new : true}
        ).then(profile => res.json(profile));
      }else{
        // create
        // check if handle exists
        Profile.findOne({handle : profilefields.handle}).then(profile => {
          if (profile) {
            errors.handle = "that handle already exists"
          }
          //save profile
          new Profile(profilefields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

module.exports = router;
