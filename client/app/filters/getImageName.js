app.filter("getImageName", function() {
  return function(image) {
  	if (!image) {
  		return 'Unknown';
  	}
    if (image.title) {
      return image.title;
    } else {
   	  return image.name;   
    }
  };
});