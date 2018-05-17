const httpProxy = require('http-proxy');
const forwarder = httpProxy.createProxyServer();
const debug = require('debug')('elasticsearch-namespaces:forward-to-upstream');

/**
 * Forwards request to the upstream (Elasticsearch).
 */
exports = module.exports = function(upstream) {
  debug(`init with upstream ${JSON.stringify(upstream)}`);
  return function(req, res, next) {
    forwarder.web(req, res, {target: upstream.target});
  };
};