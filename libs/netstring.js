var Stream = require('stream').Stream;
var util = require('util');

exports.BufferedNetstringStream = BufferedNetstringStream;

function BufferedNetstringStream(eid) {
  this.readable = true;
  this.writable = true;
  this.length = null;
  this.buffer = null;
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
    this.buffer = new Buffer(this.length);
    data.copy(this.buffer, 0, 0, this.length);
    this.emit('data', this.eventId, this.buffer);

    this.buffer = null;
    this.length = null;
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
