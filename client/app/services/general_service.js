app.factory('ImageViewerService', function($modalStack, $timeout) {
  return {
    open : function() {
      $timeout(function() {
        $modalStack.dismissAll();
      }, 25);
    }
  };
});