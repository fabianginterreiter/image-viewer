app.filter("getImageName", function() {
  return function(image) {
    if (image.title) {
      return image.title;
    } else {
   	  return image.name;   
    }
  };
});