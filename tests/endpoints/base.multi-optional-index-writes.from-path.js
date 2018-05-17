require('should');

const Endpoint = require('../../endpoints/base.multi-optional-index-writes.from-path.js');

describe('endpoints/indices.flush', () => {
  it('returns index names from path when called as /{index}/_flush', () => {
    const endpoint = new Endpoint({
      url: {
        paths: ["/_flush", "/{index}/_flush"]
      }
    }, {
      path: "/my-index,my-other-index/_flush"
    });
    endpoint.getWriteIndices().should.deepEqual(['my-index','my-other-index']);
  });
  it('returns [_all] when called as /_flush', () => {
    const endpoint = new Endpoint({
      url: {
        paths: ["/_flush", "/{index}/_flush"]
      }
    }, {
      path: "/_flush"
    });
    endpoint.getWriteIndices().should.deepEqual(['_all']);
  });
});