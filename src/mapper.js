
var greedy = require('greedy-stream'),
  through = require('through2'),
  trimmer = require('trimmer');

function capitalize( str ) {
  if( 'string' !== typeof str ){ return ''; }

  // some quattroshapes have a leading '*'
  str = trimmer( str, '*' );

  return str.toLowerCase()
            .replace( /(?:^|\s|-)\S/g, function(a){
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
          type: type, // required to generate the unique id
        },
        name: {},
        source: 'quattroshapes',
        alpha3: ( data.properties[ props.alpha3 ] || '' ).toUpperCase() || undefined,
        admin0: capitalize( data.properties[ props.admin0 ] ) || undefined,
        admin1: capitalize( data.properties[ props.admin1 ] ) || undefined,
        admin2: capitalize( data.properties[ props.admin2 ] ) || undefined,
        gn_id:  parseInt( data.properties[ props.gn ], 10 ), // some ids are comma seperated
        woe_id: parseInt( data.properties[ props.woe ], 10 ), // as per "5860714,5860715"
        popularity: data.properties[ props.popularity ]
        // boundaries: data.geometry
      };

      // extract names and alt names
      names.forEach( function( name, o ){
        if( !o ){ // first name
          record.name.default = capitalize( name );
        } else {
          record.name[ 'alt' + o ] = capitalize( name );
        }
      });

      record.center_point = {
        lat: data.properties.lat,
        lon: data.properties.lon
      };
      this.push( record );

    } catch( e ) {
      console.error( e );
    }
    next();
  };

  var stream = through.obj( mapper );
  return stream;
}

module.exports = generateMapper;
module.exports.capitalize = capitalize;
