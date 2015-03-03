
var extent = require('geojson-extent'),
    geolib = require('geolib');

module.exports = function( geometry ){

  var bounds = extent( geometry );

  var center = geolib.getCenter([
    [ bounds[0], bounds[1] ],
    [ bounds[2], bounds[3] ]
  ]);

  if( center.latitude !== undefined && center.longitude !== undefined ){
    var centroid = { lat: center.latitude, lon: center.longitude };
    return centroid;
  }
};
