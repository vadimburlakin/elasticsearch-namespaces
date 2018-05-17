require('should');

const Endpoint = require('../../endpoints/indices.shrink.js');

describe('endpoints/indices.shrink', () => {
  it('returns target index name from path', () => {
    const endpoint = new Endpoint({
      url: {
        paths: ["/{index}/_shrink/{target}"]
      }
    }, {
      path: "/my-index/_shrink/my-new-index"
    });
    endpoint.getWriteIndices().should.deepEqual(['my-new-index']);
  });
});