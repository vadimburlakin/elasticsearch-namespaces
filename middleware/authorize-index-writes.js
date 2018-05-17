const debug = require('debug')('elasticsearch-namespaces:authorize-index-writes');

/**
 * Authorizes index write operation for the user set in req.user object.
 */
exports = module.exports = function(req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
  };

  if (!req.user) {
    // no user -> deny
    debug('no user, request denied');
    return unauthorized(res);
  }

  // no endpoint -> allow by default
  let authorized = !req.endpoint;

  try {
    if (req.endpoint && req.endpoint.indices.writes) {
      const indices = req.endpoint.getWriteIndices();
      authorized = req.user.canWriteIndices(indices);
      debug(`getWriteIndices() returned ${JSON.stringify(indices)}`);
      debug(`authorized=${authorized}`);
    } else {
      debug('endpoint unknown or does not write indices, using default "authorized" flag');
    }
  } catch (e) {
    console.error(`[AuthenticateIndexWrites] Error:`);
    console.error(e.message);
    console.error(e.stack);
    // error -> deny
    return unauthorized(res);
  }

  if (authorized) {
    return next();
  } else {
    return unauthorized(res);
  };
};