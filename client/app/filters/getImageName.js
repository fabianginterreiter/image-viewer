app.filter("getImageName", function() {
  return function(image) {
    if (image.name === image.title) {
      return image.name;
    } else {
      return image.title + ' <small>(' + image.name + ')<small>';
    }
  };
});