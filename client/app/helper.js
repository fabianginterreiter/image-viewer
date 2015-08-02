

var addEventToDocument = function(scope, event, handler) {
  var $doc = angular.element(document);

  $doc.on(event, handler);
  scope.$on('$destroy',function(){
    $doc.off(event, handler);
  });
}