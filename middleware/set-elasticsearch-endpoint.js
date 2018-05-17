const debug = require('debug')('elasticsearch-namespaces:set-es-endpoint');
const ApiSpec = require('../es-api-spec');

/**
 * Sets Elasticsearch endpoint of the current request.
 */
exports = module.exports = function(req, res, next) {
  try {
    let spec = ApiSpec.findApiEndpointFromRequest(req);

    if (!spec) {
      debug(`could not find spec for req: ${req.method} ${req.path}`);
      return next();
    }

    let Endpoint;
    try {
      Endpoint = require(`../endpoints/${spec}`);
      req.endpoint = new Endpoint(ApiSpec.SPECS[spec], req);
      debug(`endpoint set to: ${req.endpoint.spec.documentation}`);
      return next();
    } catch (e) {
      // no logic for this endpoint
      return next();
    }
  } catch (e) {
    console.error(`[SetElasticsearchEndpoint] Error determining endpoint name:`);
    console.error(e.message);
    console.error(e.stack);
    return next();
  }
};