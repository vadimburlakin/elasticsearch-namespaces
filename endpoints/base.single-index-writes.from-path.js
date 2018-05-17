const Base = require('./base');
require('colors');

class Request extends Base {

  constructor(...args) {
    super(...args);

    this.indices.writes = true;
    this._write_indices = null;
  }

  getWriteIndices() {
    if (this._write_indices === null) {
      this._write_indices = [];

      const indexPart = this.getPathPart('index');

      if (indexPart != null) {
        this._write_indices.push(indexPart);
      }
    }

    return this._write_indices;
  }

}

module.exports = Request;