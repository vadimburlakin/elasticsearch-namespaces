const debug = require('debug')('elasticsearch-namespaces:authenticate-user');
const UserManager = require('../user-manager');
const basicAuth = require('basic-auth');

/**
 * Authenticated the user using HTTP Basic Authentication, and sets req.user object.
 */
exports = module.exports = function(req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
  };

  const httpUser = basicAuth(req);

  if (!httpUser) {
    return unauthorized(res);
  };

  debug(`httpUser user:${httpUser.name} pwd:${httpUser.pass}`);

  let user;
  let authenticated = false;

  try {
    user = UserManager.getUser(httpUser.name);
    if (user) {
      authenticated = user.authenticate(httpUser.pass);
      debug(`manager returned a user, authenticated=${authenticated}`);
    } else {
      debug(`user not found in config`);
    }
  } catch (e) {
    console.error(`[AuthenticateUser] Error:`);
    console.error(e.message);
    console.error(e.stack);
    return unauthorized(res);
  }

  if (authenticated) {
    req.user = user;
    return next();
  } else {
    return unauthorized(res);
  };
};