var ffi = require('ffi');
var path = require('path');

var lib = ffi.Library(path.join(__dirname, 'target/release/libfibonacci.dylib'), {  
  fibonacci: ['int', ['int']]
});

var num = lib.fibonacci(20);  

console.log(num);