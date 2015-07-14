
var fs = require('fs'),
    shapefile = require('shapefile-stream'),
    settings = require('pelias-config').generate(),
    mapper = require('../src/mapper'),
    propStream = require('prop-stream'),
    schema = require('pelias-schema'),
    through = require('through2'),
    dbclient = require('pelias-dbclient')(),
    peliasAdminLookup = require( 'pelias-admin-lookup' );

// use datapath setting from your config file
var basepath = settings.imports.quattroshapes.datapath;

var imports = [
  {
    path: basepath + '/qs_adm0.shp',
    props: {
      alpha3: 'qs_adm0_a3',
      name:   ['qs_a0','qs_adm0'],
      admin0: 'qs_adm0',
      admin1: 'qs_a1',
      admin2: 'qs_a2',
      gn:     'gs_gn_id',
      popularity: 'popularity',
      woe:    'qs_woe_id'
    },
    index:    'pelias',
    type:     'admin0'
  },
  {
    path: basepath + '/qs_adm1.shp',
    props: {
      alpha3: 'qs_adm0_a3',
      name:   ['qs_a1'],
      admin0: 'qs_adm0',
      admin1: 'qs_a1',
      admin2: 'qs_a2',
      gn:     'gs_gn_id',
      popularity: 'popularity',
      woe:    'qs_woe_id'
    },
    index:    'pelias',
    type:     'admin1'
  },
  {
    path: basepath + '/qs_adm2.shp',
    props: {
      alpha3: 'qs_adm0_a3',
      name:   ['qs_a2'],
      admin0: 'qs_adm0',
      admin1: 'qs_a1',
      admin2: 'qs_a2',
      gn:     'gs_gn_id',
      popularity: 'popularity',
      woe:    'qs_woe_id'
    },
    index:    'pelias',
    type:     'admin2'
  },
  {
    path: basepath + '/qs_localadmin.shp',
    props: {
      alpha3: 'qs_adm0_a3',
      name:   ['qs_la'],
      admin0: 'qs_adm0',
      admin1: 'qs_a1',
      admin2: 'qs_a2',
      gn:     'gs_gn_id',
      popularity: 'popularity',
      woe:    'qs_woe_id'
    },
    index:    'pelias',
    type:     'local_admin'
  },
  {
    path: basepath + '/qs_localities.shp',
    props: {
      alpha3: 'qs_adm0_a3',
      name:   ['qs_loc'],
      admin0: 'qs_adm0',
      admin1: 'qs_a1',
      admin2: 'qs_a2',
      gn:     'gs_gn_id',
      popularity: 'popularity',
      woe:    'qs_woe_id'
    },
    index:    'pelias',
    type:     'locality'
  },
  {
    path: basepath + '/qs_neighborhoods.shp',
    props: {
      alpha3: 'qs_adm0_a3',
      name:   ['name'],
      admin0: 'name_adm0',
      admin1: 'name_adm1',
      admin2: 'name_adm2',
      gn:     'gn_id',
      popularity: 'photo_sum',
      woe:    'woe_lau'
    },
    index:    'pelias',
    type:     'neighborhood'
  }
];

var found = false;
imports.forEach( function( shp ){

  if( shp.type === process.argv[2] ){
    console.error( 'running imports for: %s', shp.type );
    found = true;

    if( !fs.existsSync( shp.path ) ){
      console.error( 'failed to load %s', shp.path );
      console.error( 'please check your paths and try again' );
      process.exit(1);
    }

    var filterAlpha3 = ( process.argv[3] || '' ).toUpperCase();
    if( filterAlpha3 && filterAlpha3.length !== 3 ){
      console.error( 'invalid alpha3 filter, should be 3 characters' );
      process.exit(1);
    }

    // remove any props not in the schema mapping
    var allowedProperties = Object.keys( schema.mappings._default_.properties ).concat( [ 'id', 'type' ] );
    var allAdminValues = [ 'alpha3', 'admin0', 'admin1_abbr', 'admin1', 'admin2' ];
    var adminValuesPerLayer = {
      admin0: [ 'alpha3' ],
      admin1: [ 'alpha3', 'admin0', 'admin1_abbr' ],
      admin2: [ 'alpha3', 'admin0', 'admin1_abbr', 'admin1' ],
      local_admin: allAdminValues,
      locality: allAdminValues,
      neighborhood: allAdminValues
    };

    var dataPipeline = shapefile.createReadStream( shp.path, { encoding: 'UTF-8' } )
      .pipe( through.obj( function( item, enc, next ){
        // alpha3 filtering
        if( filterAlpha3.length !== 3 || filterAlpha3 === item.properties.qs_adm0_a3 ){
          this.push( item );
        }
        next();
      }))
      .pipe( mapper( shp.props, shp.type ) );

    var elasticsearchPipeline = propStream.whitelist( allowedProperties );
    elasticsearchPipeline
      .pipe( through.obj( function( item, enc, next ){
        var id = item.id;
        delete item.id;
        item.phrase = item.name;
        this.push({
          _index: 'pelias',
          _type: shp.type,
          _id: id,
          data: item
        });
        next();
      }))
      .pipe( dbclient );

    if( settings.imports.quattroshapes.adminLookup ){
      peliasAdminLookup.lookup( function ( adminLookup ){
        var adminValuesToSet = adminValuesPerLayer[ shp.type ];
        var adminLookupStream = through.obj(
          function write( data, _, next ){
            var downstream = this;
            adminLookup.search( data.center_point, function ( adminValues ){
              adminValuesToSet.forEach( function ( prop ){
                data[ prop ] = adminValues[ prop ];
              });
              downstream.push( data );
              next();
            });
          },
          function end( done ){
            adminLookup.end();
            done();
          }
        );

        dataPipeline.pipe( adminLookupStream ).pipe( elasticsearchPipeline );
      });
    }
    else {
      dataPipeline.pipe( elasticsearchPipeline );
    }
  }
});

if( !found ){
  console.error( 'please select an import...' );
  console.error( imports.map( function( i ){
    return i.type;
  }).join(', '));
  process.exit(1);
}
