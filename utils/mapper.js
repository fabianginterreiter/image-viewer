function map(g) {
  return {
    id : g.id,
    name : g.name,
    size : g.size,
    orientation : g.orientation,
    width : g.width,
    height : g.height
  }
}

exports.createResult = function(result, callback) {
  var s = [];

  result.forEach(function(k) {
    s.push(map(k));
  });

  return s;
}

