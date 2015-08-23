app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/directories/', {
        templateUrl: 'templates/directories/index.html',
        controller: 'BrowseCtrl'
      }).
      when('/directories/:id', {
        templateUrl: 'templates/directories/index.html',
        controller: 'BrowseCtrl'
      }).
      when('/directories/:id/details', {
        templateUrl: 'templates/directories/details.html',
        controller: 'DirectoryDetailsCtrl'
      }).
      when('/directories/:id/persons/:personId', {
        templateUrl: 'templates/directories/index.html',
        controller: 'BrowseCtrl'
      }).
      when('/directories/:id/tags/:tagId', {
        templateUrl: 'templates/directories/index.html',
        controller: 'BrowseCtrl'
      }).
      when('/directories/:id/galleries/:galleryId', {
        templateUrl: 'templates/directories/index.html',
        controller: 'BrowseCtrl'
      }).
      when('/config', {
        templateUrl: 'templates/config.html',
        controller: 'ConfigCtrl'
      }).
      when('/images/:id', {
        templateUrl: 'templates/images/show.html',
        controller: 'ImageCtrl'
      }).
      when('/tags', {
        templateUrl: 'templates/tags/index.html',
        controller: 'TagsCtrl'
      }).
      when('/tags/:id', {
        templateUrl: 'templates/tags/show.html',
        controller: 'TagCtrl'
      }).
      when('/tags/:id/persons/:personId', {
        templateUrl: 'templates/tags/show.html',
        controller: 'TagCtrl'
      }).
      when('/tags/:id/directories/:directoryId', {
        templateUrl: 'templates/tags/show.html',
        controller: 'TagCtrl'
      }).
      when('/tags/:id/tags/:tagId', {
        templateUrl: 'templates/tags/show.html',
        controller: 'TagCtrl'
      }).
      when('/tags/:id/galleries/:galleryId', {
        templateUrl: 'templates/tags/show.html',
        controller: 'TagCtrl'
      }).
      when('/tags/:id/details', {
        templateUrl: 'templates/tags/details.html',
        controller: 'TagDetailsCtrl'
      }).
      when('/galleries', {
        templateUrl: 'templates/galleries/galleries.html',
        controller: 'GalleriesCtrl'
      }).
      when('/galleries/:id', {
        templateUrl: 'templates/galleries/gallery.html',
        controller: 'GalleryCtrl'
      }).
      when('/galleries/:id/persons/:personId', {
        templateUrl: 'templates/galleries/gallery.html',
        controller: 'GalleryCtrl'
      }).
      when('/galleries/:id/tags/:tagId', {
        templateUrl: 'templates/galleries/gallery.html',
        controller: 'GalleryCtrl'
      }).
      when('/galleries/:id/galleries/:galleryId', {
        templateUrl: 'templates/galleries/gallery.html',
        controller: 'GalleryCtrl'
      }).
      when('/galleries/:id/directories/:directoryId', {
        templateUrl: 'templates/galleries/gallery.html',
        controller: 'GalleryCtrl'
      }).
      when('/galleries/:id/details', {
        templateUrl: 'templates/galleries/details.html',
        controller: 'GalleryDetailsCtrl'
      }).
      when('/galleries/:gallery_id/image/:id', {
        templateUrl: 'templates/galleries/gallery_viewer.html',
        controller: 'GalleryViewerCtrl'
      }).
      when('/persons', {
        templateUrl: 'templates/persons/index.html',
        controller: 'PersonsCtrl'
      }).
      when('/persons/:id', {
        templateUrl: 'templates/persons/show.html',
        controller: 'PersonCtrl'
      }).
      when('/persons/:id/details', {
        templateUrl: 'templates/persons/details.html',
        controller: 'PersonCtrl'
      }).
      when('/persons/:id/persons/:personId', {
        templateUrl: 'templates/persons/show.html',
        controller: 'PersonCtrl'
      }).
      when('/persons/:id/tags/:tagId', {
        templateUrl: 'templates/persons/show.html',
        controller: 'PersonCtrl'
      }).
      when('/persons/:id/image/:imageId', {
        templateUrl: 'templates/persons/image.html',
        controller: 'SetPersonImageCtrl'
      }).
      when('/persons/:id/directories/:directoryId', {
        templateUrl: 'templates/persons/show.html',
        controller: 'PersonCtrl'
      }).
      when('/persons/:id/galleries/:galleryId', {
        templateUrl: 'templates/persons/show.html',
        controller: 'PersonCtrl'
      }).
      when('/search', {
        templateUrl: 'templates/search/index.html',
        controller: 'SearchCtrl'
      }).
      when('/search/result', {
        templateUrl: 'templates/search/result.html',
        controller: 'SearchResultCtrl'
      }).
      when('/maps', {
        templateUrl: 'templates/maps/index.html',
        controller: 'MapsCtrl'
      }).
      when('/', {
        templateUrl: 'templates/home/index.html',
        controller: 'HomeCtrl'
      }).
      when('/random', {
        templateUrl: 'templates/random/index.html',
        controller: 'RandomCtrl'
      }).
      when('/trash', {
        templateUrl: 'templates/trash/index.html',
        controller: 'TrashCtrl'
      }).
      when('/favorites', {
        templateUrl: 'templates/favorites/index.html',
        controller: 'FavoritesCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);