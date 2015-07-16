app.factory('DownloadService', function() {
  return {
    images : function(images, width) {
      var ids = [];

      images.forEach(function(image) {
        ids.push(image.id);
      });

      window.location = '/api/download/images/' + ids.join('+') + (width ? '?width=' + width : '');
    },

    gallery : function(gallery, width) {
      window.location = '/api/download/gallery/' + gallery.id + '?name=' + gallery.name + '.zip' + (width ? '&width=' + width : '');
    }
  };
});