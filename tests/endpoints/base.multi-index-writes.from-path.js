require('should');

const Endpoint = require('../../endpoints/base.multi-index-writes.from-path.js');

describe('endpoints/base.multi-index-writes.from-path', () => {
  it('returns index name from path when it is present', () => {
    const endpoint = new Endpoint({
      url: {
        paths: ["/{index}/{type}/{id}"]
      }
    }, {
      path: "/my-index,my-other-index/my-type/some-id"
    });
    endpoint.getWriteIndices().should.deepEqual(['my-index','my-other-index']);
  });
  it('returns empty array when there is no index in path', () => {
    const endpoint = new Endpoint({
      url: {
        paths: ["/a/b/c"]
      }
    }, {
      path: "/a/b/c"
    });
    endpoint.getWriteIndices().should.deepEqual([]);
  });
});