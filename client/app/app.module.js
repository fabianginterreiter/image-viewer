String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var app = angular.module('imageApp', ['ngRoute', 'ui.bootstrap', 'angularSpinner', 'ngTagsInput', 'autocomplete', 'ngLoad', 'angular-table']);

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

app.filter('getDate', function() {
  return function(text) {
    var date = new Date(text);
    return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
  };
});

app.filter('formatDate', function() {
  return function(date) {
    return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
  }
});

app.filter("getFilesize", function(){
  return function(size){
    if (size > 100000) {
      return Math.round(size / 100000) / 10 + ' MB';
    } else {
      return Math.round(size/100) / 10 + ' KB';
    }
  };
});

app.filter("getImageName", function() {
  return function(image) {
    if (image.name === image.title) {
      return image.name;
    } else {
      return image.title + ' <small>(' + image.name + ')<small>';
    }
  };
});


