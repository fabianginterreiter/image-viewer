var fs = require('fs');
// parser.js
var Transform = require('stream').Transform;


Buffer.prototype.getByte = function (offset) {
  return this[offset];
};

Buffer.prototype.getSignedByte = function (offset) {
  return (this[offset] > 127) ? this[offset] - 256 : this[offset];
};

Buffer.prototype.getShort = function (offset, bigEndian) {
  var shortVal = (bigEndian) ? (this[offset] << 8) + this[offset + 1] : (this[offset + 1] << 8) + this[offset];
  return (shortVal < 0) ? shortVal + 65536 : shortVal;
};

Buffer.prototype.getSignedShort = function (offset, bigEndian) {
  var shortVal = (bigEndian) ? (this[offset] << 8) + this[offset + 1] : (this[offset + 1] << 8) + this[offset];
  return (shortVal > 32767) ? shortVal - 65536 : shortVal;
};

Buffer.prototype.getLong = function (offset, bigEndian) {
  var longVal = (bigEndian) ? (((((this[offset] << 8) + this[offset + 1]) << 8) + this[offset + 2]) << 8) + this[offset + 3] : (((((this[offset + 3] << 8) + this[offset + 2]) << 8) + this[offset + 1]) << 8) + this[offset];
  return (longVal < 0) ? longVal + 4294967296 : longVal;
};

Buffer.prototype.getSignedLong = function (offset, bigEndian) {
  var longVal = (bigEndian) ? (((((this[offset] << 8) + this[offset + 1]) << 8) + this[offset + 2]) << 8) + this[offset + 3] : (((((this[offset + 3] << 8) + this[offset + 2]) << 8) + this[offset + 1]) << 8) + this[offset];
  return (longVal > 2147483647) ? longVal - 4294967296 : longVal;
};

Buffer.prototype.getString = function (offset, length) {
  var string = [];
  for (var i = offset; i < offset + length; i++) {
    string.push(String.fromCharCode(this[i]));
  }
  return string.join('');
};

var parser = new Transform();
parser._transform = function(data, encoding, done) {
  this.push(data);

  console.log(data);

  console.log(data.length);

  var offset = 0;
  if (data[offset++] == 0xFF && data[offset++] == 0xD8) {
  	console.log("JPG Datei!");

  	while (offset < data.length) {
      console.log(offset);
  		if (data[offset++] != 0xFF) {
        console.log("ende 1");
        return;
      }

      if (data[offset++] == 0xE1) {
        console.log(data.constructor);
        console.log(data.getShort(offset, true));

        var tiffOffset = offset + 2 + 6;
        // data.toString('utf8', start, tiffOffset) != 'Exif\0\0'

        console.log(data.toString('utf8', offset + 2, offset + 8));




        //var exifData = self.extractExifData(data, offset + 2, data.getShort(offset, true) - 2);
        //callback(false, exifData);
        console.log("ende 2");
        return;
      } else {
        offset += data.getShort(offset, true);
      }
  	}
  }
  
  done();
};

stream = fs.createReadStream('/Users/fabian/Desktop/Bilder/JGA/IMG_4162.JPG');

stream.on('error', function(err) {
  console.log("Directory??");
});

stream.pipe(parser);