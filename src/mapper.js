
var greedy = require('greedy-stream'),
  through = require('through2'),
  trimmer = require('trimmer'),
  admin1AbbreviationMap = require('../meta/us_states.json'),
    // centroid = require('./centroid');
  centroid = require('./centroid-child');

function capitalize( str ) {
  if( 'string' !== typeof str ){ return ''; }

  // some quattroshapes have a leading '*'
  str = trimmer( str, '*' );

  return str.toLowerCase()
            .replace( /(?:^|\s)\S/g, function(a){
              return a.toUpperCase();
            })
            .trim();
}

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

      // -- names
      var name = data.properties[ props.name[0] ] || data.properties[ props.name[1] ];
      var names = ( name || '' ).split('#');

      // add alternate name if available
      if( data.properties[ props.name[0] + '_alt' ] ){
        names.push( data.properties[ props.name[0] + '_alt' ] );
      }

      // de-dupe names
      names = names.filter( function( i, pos ) {
        return names.indexOf( i ) == pos;
      });

      var record = {
        id: id,
        _meta: {
          type: type, // required to generate the unique id (suggester payload)
        },
        name: {},
        alpha3: ( data.properties[ props.alpha3 ] || '' ).toUpperCase() || undefined,
        admin0: capitalize( data.properties[ props.admin0 ] ) || undefined,
        admin1: capitalize( data.properties[ props.admin1 ] ) || undefined,
        admin2: capitalize( data.properties[ props.admin2 ] ) || undefined,
        gn_id:  parseInt( data.properties[ props.gn ], 10 ), // some ids are comma seperated
        woe_id: parseInt( data.properties[ props.woe ], 10 ), // as per "5860714,5860715"
        boundaries: data.geometry
      };

      // extract names and alt names
      names.forEach( function( name, o ){
        if( !o ){ // first name
          record.name.default = capitalize( name );
        } else {
          record.name[ 'alt' + o ] = capitalize( name );
        }
      });

      // admin1 abbreviations (cirrently only USA state shortcodes)
      if( 'admin1' === type && 'USA' === record.alpha3 ){
        var nameProp = data.properties[ props.name[0] ];
        var abbr = admin1AbbreviationMap[ nameProp ];
        if( abbr ){
          record.admin1_abbr = abbr;
        }
      }

      // compute centroid
      centroid( data.geometry, function( err, center ){

        if( err || !center ){
          console.error( 'center', err, center );
          console.error( err || 'invalid centroid' );

          // pass invalid center downstream to trigger
          // error count at esclient
          center = null;
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

  var stream = through.obj( mapper );
  return stream;
}

module.exports = generateMapper;
