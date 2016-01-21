app.filter('getDate', function() {
  return function(text) {
    var date = new Date(text);
    return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
  };
});
