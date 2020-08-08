const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.myLimit = options.limit || 0;
    this.curLimit = 0;
  }

  _transform(chunk, encoding, callback) {
    let stringSize = parseInt (unescape(encodeURIComponent( chunk.toString ('utf8') ).length));
    
    this.curLimit += stringSize;

    if ( this.curLimit > this.myLimit ) {
      callback (new LimitExceededError ( ));
      return;
    }
        
    callback (null, chunk);

  }
}

module.exports = LimitSizeStream;