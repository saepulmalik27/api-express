const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const Post = require("../../models/Post");
const validatePostInput = require("../../validation/post");
const Profile = require("../../models/Profile");

/**
 * @route GET api/posts
 * @desc get all post
 * @access public
 */
router.get("/", (req, res) => {
  const errors = {};
  Post.find()
    .sort({ date: -1 })
    .then((posts) => {
      if (!posts) {
        errors.noposts = "there no post yet";
        return res.status(404).json(errors);
      }
      res.json(posts);
    })
    .catch((err) => res.status(404).json(err));
});

/**
 * @route GET api/posts/:id
 * @desc get post by id
 * @access public
 */
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then((posts) => res.json(posts))
    .catch((err) => res.status(404).json(err));
});

/**
 * @route POST api/posts
 * @desc post all post
 * @access private
 */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id,
    });

    newPost.save().then((post) => res.json(post));
  }
);

/**
 * @route DELETE api/posts/:id
 * @desc delete post by id
 * @access private
 */
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findOne({ user: req.user.id })
      .then((profile) => {
        Post.findById(req.params.id).then((post) => {
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: "User not authorized" });
          }
          post.remove().then(() => res.json({ success: true }));
        });
      })
      .catch((err) => res.status(404).json(err));
  }
);

/**
 * @route POST api/posts/like/:id
 * @desc  like post by id
 * @access private
 */
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findOne({ user: req.user.id })
      .then((profile) => {
        Post.findById(req.params.id).then((post) => {
          // check if user already like
          if (
            post.likes.filter((like) => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(404)
              .json({ alreadyLiked: "you already liked this post" });
          }

          post.likes.unshift({ user: req.user.id });
          post.save().then((post) => res.json(post));
        });
      })
      .catch((err) => res.status(404).json(err));
  }
);

/**
 * @route POST api/posts/unlike/:id
 * @desc  unlike post by id
 * @access private
 */
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findOne({ user: req.user.id })
      .then((profile) => {
        Post.findById(req.params.id).then((post) => {
          // check if user already like
          if (
            post.likes.filter((like) => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(404)
              .json({ notliked: "you haven't liked this post" });
          }
          //   get removeindex
          const removeIndex = post.likes
            .map((item) => item.user.toString())
            .indexOf(req.user.id);
          // splice data
          post.likes.splice(removeIndex, 1);
          // save
          post.save().then((post) => res.json(post));
        });
      })
      .catch((err) => res.status(404).json(err));
  }
);

/**
 * @route POST api/posts/comment/:id
 * @desc  add comment post by id
 * @access private
 */
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
      .then((post) => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id,
        };

        // Add to comments array
        post.comments.unshift(newComment);

        post.save().then((post) => res.json(post));
      })
      .catch((err) => res.status(404).json(err));
  }
);

/**
 * @route POST api/posts/comment/:id/:comment_id
 * @desc  remove comment post by id
 * @access private
 */
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then((post) => {
        if (
          post.comments.filter(
            (comment) => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexists: "comment does not exist" });
        }
        //   get removeindex
        const removeIndex = post.comments
          .map((item) => item.user.toString())
          .indexOf(req.user.id);
        // splice data
        post.comments.splice(removeIndex, 1);
        // save
        post.save().then((post) => res.json(post));
      })
      .catch((err) => res.status(404).json(err));
  }
);

module.exports = router;
