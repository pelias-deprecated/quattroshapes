
var Backend = require('geopipes-elasticsearch-backend');

module.exports = function( index, type ){

  var esclient = require('pelias-esclient')({ throttle: 20 });
  esclient.livestats();

  return new Backend( esclient, index, type );
};