var Stream = require('stream').Stream;
var util = require('util');

exports.BufferedNetstringStream = BufferedNetstringStream;

function BufferedNetstringStream(eid) {
  this.readable = true;
  this.writable = true;
  this.length = null;
  this.buffer = null;
  this.offset = 0;
  this.eventId = eid;
}

util.inherits(BufferedNetstringStream, Stream);

BufferedNetstringStream.prototype.write = function(data) {
  var __this = this;
  if (this.length == null) {
    var dataArray = data.toString('utf-8').split("\r\n");
    dataArray.forEach(function(value) {
      if (value.indexOf("Content-type") > -1 ||
          value.indexOf("X-Timestamp") > -1) {
      } else if (value.indexOf("Content-Length") > -1 ) {
        __this.length = parseInt(value.split(":")[1]);
      }
    });
  } else {
    var offset = 0;
    if (this.buffer == null) {
      this.buffer = new Buffer(this.length);
    }
    var size = Math.min(data.length - offset, this.length - this.offset)
    data.copy(this.buffer, this.offset, offset, offset + size);
    offset += size, this.offset += size;
    if (this.length == this.offset) {
      this.emit('data', this.eventId, this.buffer); 
      this.buffer = null;
      this.length = null;
      this.offset = 0;
    }
  }
}

BufferedNetstringStream.prototype.end = function() {
  if (this.length != null || this.buffer != null) {
    this.emit('error', Error('unexpected end of stream'));
    return this.destroy();
  }
  this.emit('end');
}

BufferedNetstringStream.prototype.destroy = function() {
  this.emit('close');
}
