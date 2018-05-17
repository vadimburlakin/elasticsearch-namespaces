require('should');

const Endpoint = require('../../endpoints/reindex.js');

describe('endpoints/reindex', () => {

  it('gets affected index name from `body.dest.index` if available', () => {
    let endpoint = new Endpoint({
      url: {
        paths: ["/_reindex"]
      }
    }, {
      body: `{"source": {"index": "twitter"},"dest": {"index": "new_twitter"}}`
    });
    endpoint.getWriteIndices().should.deepEqual(['new_twitter']);
  });

  it('handles a case when body cannot be parsed', () => {
    let endpoint = new Endpoint({
      url: {
        paths: ["/_reindex"]
      }
    }, {
      body: `can't parse that`
    });
    endpoint.getWriteIndices().should.deepEqual([]);
  });

  it('handles a case when dest index not available', () => {
    let endpoint = new Endpoint({
      url: {
        paths: ["/_reindex"]
      }
    }, {
      body: `{"source": {"index": "twitter"},"dest": {}}`
    });
    endpoint.getWriteIndices().should.deepEqual([]);
  });

});