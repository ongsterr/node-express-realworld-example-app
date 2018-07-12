const fs = require('fs'),
      http = require('http'),
      path = require('path'),
      methods = require('methods'),
      express = require('express'),
      bodyParser = require('body-parser'),
      session = require('express-session'),
      cors = require('cors'),
      passport = require('passport'),
      errorhandler = require('errorhandler'),
      mongoose = require('mongoose');

const morgan = require('morgan');
const logger = require('./logger');

const isProduction = process.env.NODE_ENV === 'production';

// Create global app object
const app = express();

// Normal express config defaults
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use(require('method-override')());
app.use(express.static(__dirname + '/public'));

app.use(session({ secret: 'conduit', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));

const passportConfig = require('./config/passport');
const userModel = require('./models/User');
const articleModel = require('./models/Article');
const commentModel = require('./models/Comment');

// logger
app.use(morgan('combined', {
  skip: (req, res) => {
    return res.statusCode < 400
  },
  stream: process.stderr
}));

app.use(morgan('combined', {
  skip: (req, res) => {
    return res.statusCode >= 400
  },
  stream: process.stdout
}))

app.use(logger);

// Routes
const router = require('./routes')
app.use('/', router);

if (!isProduction) {
  app.use(errorhandler());
}

// Connect to db first before starting server
if(isProduction){
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect('mongodb://localhost/conduit')
    .then(() => console.log('Mongodb connection established :)'))
    .catch(err => console.error(`Mongodb failure: ${err.message}`));
  mongoose.set('debug', true);
}

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function(err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({'errors': {
      message: err.message,
      error: err
    }});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({'errors': {
    message: err.message,
    error: {}
  }});
});

// finally, let's start our server...
const server = app.listen( process.env.PORT || 3000, function() {
  console.log('Listening on port ' + server.address().port);
});
