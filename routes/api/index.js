const router = require('express').Router();
const userRouter = require('./users');
const profileRouter = require('./profiles');
const articleRouter = require('./articles');

router.use('/', userRouter);
router.use('/profiles', profileRouter);
router.use('/articles', articleRouter);

router.use((err, req, res, next) => {
  console.log(err);
  if (err.name == 'ValidationError') {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce((errors, key) => {
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }
})

module.exports = router;
