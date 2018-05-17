require('should');

const Endpoint = require('../../endpoints/bulk.js');

describe('endpoints/bulk', () => {

  it('sets read/write flags correctly', () => {
    let endpoint = new Endpoint({}, {
      body: `{ "index" : { "_index" : "test", "_type" : "type1", "_id" : "1" } }\n` +
            `{ "field1" : "value1" }\n`
    });
    endpoint.indices.writes.should.equal(true);
    endpoint.indices.reads.should.equal(false);
    endpoint.templates.writes.should.equal(false);
    endpoint.templates.reads.should.equal(false);
    endpoint.pipelines.writes.should.equal(false);
    endpoint.pipelines.reads.should.equal(true);
  });

  it('handles a case when request body is null', () => {
    let endpoint = new Endpoint({}, {
      body: null
    });
    endpoint.getWriteIndices().should.deepEqual([]);
  });

  it('handles a case when request body is object', () => {
    let endpoint = new Endpoint({}, {
      body: {some: 'value'}
    });
    endpoint.getWriteIndices().should.deepEqual([]);
  });

  it('parses indexing index names correctly', () => {
    let endpoint = new Endpoint({}, {
      body: `{ "index" : { "_index" : "test1", "_type" : "type1", "_id" : "1" } }\n` +
            `{ "field1" : "value1" }\n` +
            `{ "index" : { "_index" : "test2", "_type" : "type1", "_id" : "1" } }\n` +
            `{ "field1" : "value1" }\n`
    });
    endpoint.getWriteIndices().should.deepEqual(['test1', 'test2']);
  });

  it('parses update index names correctly', () => {
    let endpoint = new Endpoint({}, {
      body: `{ "update" : { "_index" : "test1", "_type" : "type1", "_id" : "1" } }\n` +
            `{ "field1" : "value1" }\n` +
            `{ "update" : { "_index" : "test2", "_type" : "type1", "_id" : "1" } }\n` +
            `{ "field1" : "value1" }\n`
    });
    endpoint.getWriteIndices().should.deepEqual(['test1', 'test2']);
  });

  it('parses delete index names correctly', () => {
    let endpoint = new Endpoint({}, {
      body: `{ "delete" : { "_index" : "test1", "_type" : "type1", "_id" : "1" } }\n` +
            `{ "field1" : "value1" }\n` +
            `{ "delete" : { "_index" : "test2", "_type" : "type1", "_id" : "1" } }\n` +
            `{ "field1" : "value1" }\n`
    });
    endpoint.getWriteIndices().should.deepEqual(['test1', 'test2']);
  });

  it('parses pipelines correctly', () => {
    let endpoint = new Endpoint({}, {
      body: `{ "index" : { "_index" : "test1", "_type" : "type1", "_id" : "1", "pipeline" : "test-pipeline-1" } }\n` +
            `{ "field1" : "value1" }\n` +
            `{ "index" : { "_index" : "test2", "_type" : "type1", "_id" : "1", "pipeline" : "test-pipeline-2" } }\n` +
            `{ "field1" : "value1" }\n`
    });
    endpoint.getReadPipelines().should.deepEqual(['test-pipeline-1', 'test-pipeline-2']);
  });

});