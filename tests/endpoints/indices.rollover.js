require('should');

const Endpoint = require('../../endpoints/indices.rollover.js');

describe('endpoints/indices.rollover', () => {
  it('returns index name from path when it is present', () => {
    const endpoint = new Endpoint({
      url: {
        paths: ["/{alias}/_rollover", "/{alias}/_rollover/{new_index}"]
      }
    }, {
      path: "/my-alias/_rollover/new-index-name"
    });
    endpoint.getWriteIndices().should.deepEqual(['new-index-name']);
  });
  it('returns empty array when there is no index in path', () => {
    const endpoint = new Endpoint({
      url: {
        paths: ["/{alias}/_rollover", "/{alias}/_rollover/{new_index}"]
      }
    }, {
      path: "/my-alias/_rollover"
    });
    endpoint.getWriteIndices().should.deepEqual([]);
  });
});