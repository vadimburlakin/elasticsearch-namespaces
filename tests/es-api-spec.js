require('should');

const ElasticsearchApiSpec = require('../es-api-spec.js');

describe('ElasticsearchApiSpec', () => {
  describe('requestMatchesApiEndpoint', () => {
    it('returns false and emits error when spec is not found', () => {
      ElasticsearchApiSpec.SPECS['test'] = null;
      ElasticsearchApiSpec.requestMatchesApiEndpoint({}, 'test').should.equal(false);
    });
    it('returns false when URL matches, but method does not match', () => {
      ElasticsearchApiSpec.SPECS['test'] = {
        methods: ["GET"],
        url: {
          paths: ["/"]
        }
      };
      ElasticsearchApiSpec.requestMatchesApiEndpoint({
        method: "POST"
      }, 'test').should.equal(false);
    });
    it('returns false when method matches, but URL does not match', () => {
      ElasticsearchApiSpec.SPECS['test'] = {
        methods: ["GET"],
        url: {
          paths: ["/"]
        }
      };
      ElasticsearchApiSpec.requestMatchesApiEndpoint({
        method: "GET",
        path: "/test"
      }, 'test').should.equal(false);
    });
    it('returns true when both method and URL match (#1)', () => {
      ElasticsearchApiSpec.SPECS['test'] = {
        methods: ["GET","POST"],
        url: {
          paths: ["/","/test"]
        }
      };
      ElasticsearchApiSpec.requestMatchesApiEndpoint({
        method: "GET",
        path: "/"
      }, 'test').should.equal(true);
    });
    it('returns true when both method and URL match (#2)', () => {
      ElasticsearchApiSpec.SPECS['test'] = {
        methods: ["GET","POST"],
        url: {
          paths: ["/","/test"]
        }
      };
      ElasticsearchApiSpec.requestMatchesApiEndpoint({
        method: "POST",
        path: "/test"
      }, 'test').should.equal(true);
    });
    it('returns true when both method and URL match (#3)', () => {
      ElasticsearchApiSpec.SPECS['test'] = {
        methods: ["GET","POST"],
        url: {
          paths: ["/","/test/{index}"]
        }
      };
      ElasticsearchApiSpec.requestMatchesApiEndpoint({
        method: "POST",
        path: "/test/my-index"
      }, 'test').should.equal(true);
    });
    it('returns true when both method and URL match (#4)', () => {
      ElasticsearchApiSpec.SPECS['test'] = {
        methods: ["GET","POST"],
        url: {
          paths: ["/","/foo/{index}/bar"]
        }
      };
      ElasticsearchApiSpec.requestMatchesApiEndpoint({
        method: "POST",
        path: "/foo/my-index/bar"
      }, 'test').should.equal(true);
    });
    it('returns false when part matches, but path does not match', () => {
      ElasticsearchApiSpec.SPECS['test'] = {
        methods: ["GET","POST"],
        url: {
          paths: ["/","/foo/{index}/bar"]
        }
      };
      ElasticsearchApiSpec.requestMatchesApiEndpoint({
        method: "POST",
        path: "/foo/my-index/baz"
      }, 'test').should.equal(false);
    });
  });
});