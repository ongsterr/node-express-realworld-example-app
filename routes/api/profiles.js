const router = require('express').Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const auth = require('../auth');

// Technically, should use user_id instead of username
router.param('username', (req, res, next, username) => {
  User.findOne({ username })
    .then( user => {
      if (!user) {
        return res.sendStatus(404);
      };

      req.profile = user;
      return next();
    })
    .catch(next);
})

router.get('/:username', auth.optional, (req, res, next) => {
  if (req.payload) {
    User.findById(req.payload.id)
      .then( user => {
        if (!user) {
          return res.json({
            profile: req.profile.toProfileJSONFor(false)
          });
        };

        return res.json({
          profile: req.profile.toProfileJSONFor(user)
        });
      })
  } else {
    return res.json({
      profile: req.profile.toProfileJSONFor(false)
    });
  };
});

module.exports = router;