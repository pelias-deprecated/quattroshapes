
var extent = require('geojson-extent'),
    geolib = require('geolib');

module.exports = function( geometry ){

  var bounds = extent( geometry );

  var center = geolib.getCenter([
    [ bounds[0], bounds[1] ],
    [ bounds[2], bounds[3] ]
  ]);

  return ( center.latitude !== undefined && center.longitude !== undefined ) ?
    { lat: center.latitude, lon: center.longitude } :
    null;
};
