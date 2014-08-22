
var extent = require('geojson-extent'),
    geolib = require('geolib');

module.exports = function( geometry, cb ){

  var bounds = extent( geometry );

  var center = geolib.getCenter([
    [ bounds[0], bounds[1] ],
    [ bounds[2], bounds[3] ]
  ]);

  if( center.latitude && center.longitude ){
    var centroid = { lat: center.latitude, lon: center.longitude };

    return cb( null, centroid );
  }

  return cb( null, null );
};