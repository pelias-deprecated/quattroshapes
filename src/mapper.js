
var greedy = require('greedy-stream'),
  through = require('through2'),
    // centroid = require('./centroid');
  centroid = require('./centroid-child');

function generateMapper( props, type ){

  var i = 0;
  var generateId = function( data ){
    return [
      ++i+'',
      data.properties.qs_level || '~',
      data.properties.qs_iso_cc || '~',
      data.properties.qs_adm0_a3 || '~',
      data.properties[ props.name ] || '~'
    ].map( function( each ){
      return each.toLowerCase().replace( /[^a-z0-9]/g, '_' );
    }).join(':');
  };

  var total = 0;
  var mapper = function( data, enc, next ){
    total++;

    try {

      var id = generateId( data );

      var record = {
        id: id,
        type: type, // required to generate the unique id (suggester payload)
        name: {
          default: data.properties[ props.name ]
        },
        admin0: data.properties[ props.admin0 ],
        admin1: data.properties[ props.admin1 ],
        admin2: data.properties[ props.admin2 ],
        gn_id:  data.properties[ props.gn ],
        woe_id: data.properties[ props.woe ],
        boundaries: data.geometry
      };

      // add alternate name if available
      if( data.properties[ props.name + '_alt' ] ){
        record.name.alt = data.properties[ props.name + '_alt' ];
      }

      // compute centroid
      centroid( data.geometry, function( err, center ){

        if( err || !center ){
          console.error( 'center', err, center );
          console.error( err || 'invalid centroid' );
          return next();
        }

        // set record center_point
        record.center_point = center || {};

        // push downstream
        this.push( record );
        next();

      }.bind(this));


    } catch( e ) {
      console.error( e );
      next();
    }
  };

  var stream = greedy.obj( mapper );
  return stream;
}

module.exports = generateMapper;
