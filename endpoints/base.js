const escapeStringRegexp = require('escape-string-regexp');

class Request {

  constructor(spec, request) {
    this.spec = spec;
    this.request = request;

    this.indices = {
      reads: false,
      writes: false
    };

    this.templates = {
      reads: false,
      writes: false
    };

    this.pipelines = {
      reads: false,
      writes: false
    };

    this._path_parts = {};
    this._matching_paths = null;
  }

  getReadIndices() {
    return [];
  }

  getWriteIndices() {
    return [];
  }

  getReadPipelines() {
    return [];
  }

  getWritePipelines() {
    return [];
  }

  getReadTemplates() {
    return [];
  }

  getWriteTemplates() {
    return [];
  }

  constructRegexForPath(path, capturePart = null) {
    let regexString = '^' + escapeStringRegexp(path) + '$';
    regexString = regexString.replace(/\\\{[^\}]+\\\}/g, function(match) {
      if (capturePart != null && match == `\\{${ capturePart }\\}`) {
        return '([^/]+)';
      } else {
        return '[^/]+';
      }
    });
    return new RegExp(regexString);
  }

  getMatchingPaths() {
    if (this._matching_paths == null) {
      this._matching_paths = [];
      for (let path of this.spec.url.paths) {
        const regex = this.constructRegexForPath(path);
        if (regex.test(this.request.path)) {
          this._matching_paths.push(path);
        }
      }
    }

    return this._matching_paths;
  }

  getPathPart(part) {
    if (this._path_parts[part] === undefined) {
      let paths = this.getMatchingPaths();

      let pathWithPart = null;
      for (let path of paths) {
        if (path.indexOf(`{${ part }}`) >= 0) {
          pathWithPart = path;
          break;
        }
      }

      this._path_parts[part] = null;

      if (pathWithPart != null) {
        const regex = this.constructRegexForPath(pathWithPart, part);
        const matches = this.request.path.match(regex);
        if (matches.length > 1) {
          this._path_parts[part] = matches[1];
        }
      }
    }

    return this._path_parts[part];
  }

}

module.exports = Request;