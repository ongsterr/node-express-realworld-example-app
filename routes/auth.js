const jwt = require('express-jwt');
const secret = require('../config').secret;
const {Bearer} = require('permit');

const permit = new Bearer();

function getTokenFromHeader(req, res) {
  const token = permit.check(req);
  if (!token) {
    return null;
  };
  return token;
}

const auth = {
  required: jwt({
    secret,
    userProperty: 'payload',
    getToken: getTokenFromHeader,
  }),
  optional: jwt({
    secret,
    userProperty: 'payload',
    credentialsRequired: false,
    getToken: getTokenFromHeader,
  })
};

module.exports = auth;