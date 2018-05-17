const Base = require('./base');
require('colors');

class Request extends Base {

  constructor(...args) {
    super(...args);

    this.indices.writes = true;
    this._write_indices = [];

    this._parse_request();
  }

  _parse_request() {
    if (typeof this.request.body !== 'string') {
      console.error('');
      console.error(`[IndexRequest][_parse_request] Request body is not a string.`.red.bold);
      console.error('');
      return;
    }

    let body;
    try {
      body = JSON.parse(this.request.body);
    } catch (e) {
      console.error('');
      console.error(`[IndexRequest][_parse_request] Could not parse request body`.red.bold);
      console.error('Error message:');
      console.error(e.message);
      console.error('');
      return;
    }

    if (body.dest && body.dest.index) {
      this._write_indices.push(body.dest.index);
    }
  }

  getWriteIndices() {
    return this._write_indices;
  }

}

module.exports = Request;