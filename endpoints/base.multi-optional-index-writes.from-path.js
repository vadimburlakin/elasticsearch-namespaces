const Base = require('./base.multi-index-writes.from-path.js');
require('colors');

class Request extends Base {

  getWriteIndices() {
    if (this.getPathPart('index') === null) {
      return ['_all'];
    } else {
      return super.getWriteIndices();
    }
  }

}

module.exports = Request;