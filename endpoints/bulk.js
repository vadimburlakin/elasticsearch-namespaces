const Base = require('./base');
require('colors');

class Request extends Base {

  constructor(...args) {
    super(...args);

    this.indices.writes = true;
    this.pipelines.reads = true;

    this._nd_body = [];
    this._write_indices = [];
    this._read_pipelines = [];

    this._parse_request();
  }

  _parse_request() {
    if (typeof this.request.body !== 'string') {
      console.error('');
      console.error(`[BulkRequest][_parse_request] Request body is not a string.`.red.bold);
      console.error('');
      return;
    }

    const ndBody = [];
    const lines = this.request.body.split(/\n/);

    for (var i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.length === 0) continue;

      try {
        let parsed = JSON.parse(line);
        ndBody.push(parsed);
      } catch (e) {
        console.error('');
        console.error(`[BulkRequest][_parse_request] Could not parse line:`.red.bold);
        console.error(line);
        console.error('');
        console.error('Error message:');
        console.error(e.message);
        console.error('');
        return;
      }
    }

    this._nd_body = ndBody;

    for (let i = 0 ; i < this._nd_body.length ; i += 2) {
      const action = this._nd_body[i];
      if (action.index != null) {
        if (action.index._index != null) this._write_indices.push(action.index._index);
        if (action.index.pipeline != null) this._read_pipelines.push(action.index.pipeline);
      } else if (action.update != null) {
        if (action.update._index != null) this._write_indices.push(action.update._index);
      } else if (action.delete != null) {
        if (action.delete._index != null) this._write_indices.push(action.delete._index);
      }
    }
  }

  getWriteIndices() {
    return this._write_indices;
  }

  getReadPipelines() {
    return this._read_pipelines;
  }

}

module.exports = Request;