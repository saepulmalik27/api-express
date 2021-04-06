const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const Post = require("../../models/Post");

/**
 * @route GET api/posts
 * @desc get all post
 * @access private
 */
router.get("/", (req, res) => res.json({ msg: "user work" }));

/**
 * @route POST api/posts
 * @desc post all post
 * @access private
 */
router.post("/", passport.authenticate("jwt", { session: false }), 
(req, res) => {
    
}
);

module.exports = router;
