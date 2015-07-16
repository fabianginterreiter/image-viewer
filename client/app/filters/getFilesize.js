app.filter("getFilesize", function(){
  return function(size){
    if (size > 100000) {
      return Math.round(size / 100000) / 10 + ' MB';
    } else {
      return Math.round(size/100) / 10 + ' KB';
    }
  };
});