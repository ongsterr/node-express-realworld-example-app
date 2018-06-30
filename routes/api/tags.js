const router = require('express').Router();
const mongoose = require('mongoose');
const Article = mongoose.model('Article');

router.get('/', (req, res, next) => {
  Article.find().distinct('tagList').then(tags => {
    return res.json({tags});
  })
  .catch(next);
});



module.exports = router;