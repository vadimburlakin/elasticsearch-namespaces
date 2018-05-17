const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ExpressRequest = require('express/lib/request');
const escapeStringRegexp = require('escape-string-regexp');
require('colors');

const ElasticsearchApiSpec = {};

/**
 * Elasticsearch API specs cache
 * @type {Object}
 */
ElasticsearchApiSpec.SPECS = {};

/**
 * List of API endpoints
 * @type {Array}
 */
ElasticsearchApiSpec.ENDPOINT_LIST = [];

/**
 * Access rate for each endpoint
 * @type {Object}
 */
ElasticsearchApiSpec.ENDPOINT_ACCESS_RATE = {};

/**
 * Load Elasticsearch API specs from a given path.
 *
 * @param  {String} _path Path to API specs.
 */
ElasticsearchApiSpec.loadSpecs = function(_path) {
  fs.readdirSync(_path).forEach(file => {
    if (file == '_common.json') return;

    if (/\.json$/.test(file)) {
      const specRaw = fs.readFileSync(path.join(_path, file));

      var specParsed;
      try {
        specParsed = JSON.parse(specRaw);
      } catch (e) {
        console.error('');
        console.error(`Could not load spec file: ${ file }:`.red.bold);
        console.error(e.message);
        console.error('');
        process.exit(1);
      }
    }

    if (Object.keys(specParsed).length > 1) {
        console.error('');
        console.error(`File ${ file } contains more than one spec!`.bold.red);
        console.error('');
        process.exit(1);
    }

    const specName = Object.keys(specParsed)[0];
    const specDefinition = specParsed[specName];

    try {
      // Must have HTTP method and a list of endpoints at minimum:
      assert(specDefinition.methods != null, `Was expecting spec definition to have 'methods' key.`);
      assert(specDefinition.methods instanceof Array, `Was expecting 'methods' key to be an array.`);
      assert(specDefinition.url != null, `Was expecting spec definition to have 'url' key.`);
      assert(typeof specDefinition.url == 'object', `Was expecting 'url' key to be an object.`);
      assert(specDefinition.url.paths != null, `Was expecting 'url' object to have 'paths' key.`);
      assert(specDefinition.url.paths instanceof Array, `Was expecting 'paths' key of 'url' object to be an array.`);
    } catch (e) {
      console.error('');
      console.error(`Format of spec file ${ file } is incorrect:`.bold.red);
      console.error(e.message);
      console.error('');
      process.exit(1);
    }

    // this endpoint has access to index or not?
    if ((specDefinition.url.parts != null && specDefinition.url.parts.index != null) ||
        (specDefinition.url.params != null && specDefinition.url.params.index != null) ||
        (specDefinition.body != null && specDefinition.body.serialize == 'bulk')
    ) {
      specDefinition.usesIndex = true;
    } else {
      specDefinition.usesIndex = false;
    }

    ElasticsearchApiSpec.SPECS[specName] = specDefinition;
    ElasticsearchApiSpec.ENDPOINT_ACCESS_RATE[specName] = 0;
    ElasticsearchApiSpec.ENDPOINT_LIST.push(specName);
  });
};

/**
 * Check that a given Express request matches a given
 * Elasticsearch API *endpoint* (not specification!).
 *
 * @param  {Object} request Express request
 * @param  {String} api     Elasticsearch API name
 * @return {Boolean}        true/false
 */
ElasticsearchApiSpec.requestMatchesApiEndpoint = function(request, api) {
  const spec = ElasticsearchApiSpec.SPECS[api];

  if (spec == null) {
    console.warn(`[requestMatchesApi] Could not find spec for API '${ api }'.`);
    return false;
  }

  // Check method. If method doesn't match, no need to check more.
  if (spec.methods.indexOf(request.method) === -1) {
    return false;
  }

  // Check if any of ES endpoint matches with request path:
  for (let path of spec.url.paths) {
    let regexString = '^' + escapeStringRegexp(path) + '$';

    // Convert ES path parts (like: {index}) to [^/]:
    regexString = regexString.replace(/\\\{[^\}]+\\\}/g, '[^/]+');

    const regex = new RegExp(regexString);

    if (regex.test(request.path)) {
      return true;
    }
  }

  return false;
}

/**
 * Finds Elasticsearch API endpoint name from Express request.
 *
 * @param  {Object} request Express request
 * @return {String|null}    API endpoint name, or `null` if endpoint can not be determined
 */
ElasticsearchApiSpec.findApiEndpointFromRequest = function(request) {
  for (let spec of ElasticsearchApiSpec.ENDPOINT_LIST) {
    if (ElasticsearchApiSpec.requestMatchesApiEndpoint(request, spec)) {
      ElasticsearchApiSpec.ENDPOINT_ACCESS_RATE[spec]++;
      return spec;
    }
  }

  return null;
}

/**
 * Checks if request path matches a certain query.
 *
 * @param  {Request} request Express request
 * @param  {String|RegExp} path    Query
 * @return {Boolean}         true/false
 */
ElasticsearchApiSpec.requestMatchesPath = function(request, path) {
  if (path instanceof RegExp) {
    return path.test(request.path);
  } else {
    return request.path.indexOf(path) === 0;
  }
}

/**
 * Sorts endpoints by their access rate.
 */
if (process.env.NODE_ENV !== 'test') {
  setInterval(function sortEndpointsByAccessRate() {
    ElasticsearchApiSpec.ENDPOINT_LIST.sort(function(a, b) {
      return ElasticsearchApiSpec.ENDPOINT_ACCESS_RATE[b] - ElasticsearchApiSpec.ENDPOINT_ACCESS_RATE[a];
    });
  }, 60000);
}

/**
 * Reset endpoint access rates.
 */
if (process.env.NODE_ENV !== 'test') {
  setInterval(function resetEndpointAccessRates() {
    ElasticsearchApiSpec.ENDPOINT_LIST.forEach(endpoint => {
      ElasticsearchApiSpec.ENDPOINT_ACCESS_RATE[endpoint] = 0;
    });
  }, 43200000); // 12h
}

exports = module.exports = ElasticsearchApiSpec;