const router = require('express').Router();
const userRouter = require('./users');

router.use('/', userRouter);

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
