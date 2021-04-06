const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");


/**
 * @route GET api/profile
 * @desc get current users profile
 * @access private
 */
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
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
 * @route POST api/profile
 * @desc create and update user profile
 * @access private
 */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const profilefields = {};
    profilefields.user = req.user.id;
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

        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profilefields },
          { new: true, useFindAndModify: false }
        )
          .then((profile) => res.json(profile))
          .catch((err) => res.status(404).json(err));
      } else {
        // create
        // check if handle exists
        Profile.findOne({ handle: profilefields.handle }).then((profile) => {
          if (profile) {
            errors.handle = "that handle already exists";
            return res.status(404).json(errors);
          }
          //save profile
          new Profile(profilefields)
            .save()
            .then((profile) => res.json(profile));
        });
      }
    });
  }
);

/**
 * @route GET api/profile/handle/:handle
 * @desc get Profile by handle
 * @access public
 */
router.get("/handle/:handle", (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then((profile) => {
      if (!profile) {
        errors.noprofile = "there is no profile for this user";
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch((err) => res.status(404).json(err));
});

/**
 * @route GET api/profile/user/:user_id
 * @desc get Profile by user
 * @access public
 */
router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then((profile) => {
      if (!profile) {
        errors.noprofile = "there is no profile for this user";
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch((err) => res.status(404).json(err));
});

/**
 * @route GET api/profile/all
 * @desc get All Profile
 * @access public
 */
router.get("/all", (req, res) => {
  const errors = {};
  Profile.find()
    .populate("user", ["name", "avatar"])
    .then((profiles) => {
      if (!profiles) {
        errors.noprofiles = "there are no profiles";
        return res.status(404).json(errors);
      }
      res.json(profiles);
    })
    .catch((err) => res.status(404).json(err));
});

/**
 * @route POST api/profile/experience
 * @desc Add  Profile Experience
 * @access private
 */

router.post(
  "/experience", passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const {errors, isValid} = validateExperienceInput(req.body);

    if (!isValid){
      return res.status(404).json(errors)
    }

    Profile.findOne({ user: req.user.id })
    .then((profile) => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      };
      profile.experience.unshift(newExp);
      profile.save().then((profile) => res.json(profile));
    });
  }
);


/**
 * @route POST api/profile/education
 * @desc Add education
 * @access private
 */

 router.post(
  "/education", passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const {errors, isValid} = validateEducationInput(req.body);

    if (!isValid){
      return res.status(404).json(errors)
    }

    Profile.findOne({ user: req.user.id })
    .then((profile) => {
      const newEdu = {
        degree: req.body.degree,
        school: req.body.school,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      };
      profile.education.unshift(newEdu);
      profile.save().then((profile) => res.json(profile));
    });
  }
);


/**
 * @route DELETE api/profile/experience/:exp_id
 * @desc delete experience from profile
 * @access private
 */

 router.delete(
  "/experience/:exp_id", passport.authenticate("jwt", { session: false }),
  (req, res) => {
  
    Profile.findOne({ user: req.user.id })
    .then((profile) => {
      // Get remove index
      const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id);

      // Splice out of array
      profile.experience.splice(removeIndex, 1);

      profile.save().then(profile => res.json(profile))
    })
    .catch(err => res.status(404).json(err));
  }
);

/**
 * @route DELETE api/profile/education/:edu_id
 * @desc delete education from profile
 * @access private
 */

 router.delete(
  "/education/:edu_id", passport.authenticate("jwt", { session: false }),
  (req, res) => {
  
    Profile.findOne({ user: req.user.id })
    .then((profile) => {
      // Get remove index
      const removeIndex = profile.education
      .map(item => item.id)
      .indexOf(req.params.exp_id);

      // Splice out of array
      profile.education.splice(removeIndex, 1);

      profile.save().then(profile => res.json(profile))
    })
    .catch(err => res.status(404).json(err));
  }
);

/**
 * @route DELETE api/profile
 * @desc delete profile
 * @access private
 */
router.delete('/',
passport.authenticate('jwt', {session : false}), (req, res) => {
  Profile.findOneAndRemove({user : req.user.id}).then(()=> {
    User.findOneAndRemove({_id : req.user.id}).then(()=> res.json({success : true}))
  })
});


module.exports = router;
