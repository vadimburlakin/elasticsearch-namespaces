require('should');

const Endpoint = require('../../endpoints/base.js');

describe('endpoints/base', () => {
  describe('constructRegexForPath', () => {
    const testCases = [
      {path: '/{index}/{type}/{id}/_create', capture: null, expect: `/^\\/[^\\/]+\\/[^\\/]+\\/[^\\/]+\\/_create$/`},
      {path: '/{index}/{type}/{id}/_create', capture: 'type', expect: `/^\\/[^\\/]+\\/([^\\/]+)\\/[^\\/]+\\/_create$/`}
    ];
    testCases.forEach(test => {
      it(`returns '${test.expect}' when path is '${test.path}' and capture is '${test.capture}'`, () => {
        const endpoint = new Endpoint({
          url: {
            paths: ["/{index}/{type}/{id}/_create"]
          }
        }, {
          path: "/my-index/my-type/some-id/_create"
        });
        endpoint.constructRegexForPath(test.path, test.capture).toString().should.equal(test.expect);
      });
    });
  });
  describe('getMatchingPaths', () => {
    it('extracts paths correctly', () => {
      const endpoint = new Endpoint({
        url: {
          paths: ["/{index}/{type}/{id}/_create","/{index}/some-type/{id}/_create","/{index}/_create"]
        }
      }, {
        path: "/my-index/some-type/some-id/_create"
      });
      endpoint.getMatchingPaths().should.deepEqual(["/{index}/{type}/{id}/_create","/{index}/some-type/{id}/_create"]);
    });
    it('returns empty array when none matches', () => {
      const endpoint = new Endpoint({
        url: {
          paths: ["/{index}/{type}/{id}/_create","/{index}/some-type/{id}/_create","/{index}/_create"]
        }
      }, {
        path: "/non-existing-path"
      });
      endpoint.getMatchingPaths().should.deepEqual([]);
    });
  });
  describe('getPathPart', () => {
    it('return null when part does not exist', () => {
      const endpoint = new Endpoint({
        url: {
          paths: ["/{index}/{type}/{id}/_create","/{index}/some-type/{id}/_create","/{index}/_create"]
        }
      }, {
        path: "/my-index/some-type/some-id/_create"
      });
      should.equal(endpoint.getPathPart('template'), null);
    });
    it('return matching part value (#1)', () => {
      const endpoint = new Endpoint({
        url: {
          paths: ["/{index}/{type}/{id}/_create","/{index}/some-type/{id}/_create","/{index}/_create"]
        }
      }, {
        path: "/my-index/some-type/some-id/_create"
      });
      endpoint.getPathPart('index').should.equal('my-index');
    });
    it('return matching part value (#2)', () => {
      const endpoint = new Endpoint({
        url: {
          paths: ["/{index}/{type}/{id}/_create","/{index}/some-type/{id}/_create","/{index}/_create"]
        }
      }, {
        path: "/my-index/some-type/some-id/_create"
      });
      endpoint.getPathPart('id').should.equal('some-id');
    });
    it('return matching part value (#3)', () => {
      const endpoint = new Endpoint({
        url: {
          paths: ["/{index}/{type}/{id}/_create","/{index}/some-type/{id}/_create","/{index}/_create"]
        }
      }, {
        path: "/my-index/some-type/some-id/_create"
      });
      endpoint.getPathPart('type').should.equal('some-type');
    });
  });
});