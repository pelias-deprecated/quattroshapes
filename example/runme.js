
var fs = require('fs'),
    shapefile = require('shapefile-stream'),
    suggester = require('pelias-suggester-pipeline'),
    settings = require('pelias-config').generate(),
    mapper = require('../src/mapper'),
    propStream = require('prop-stream'),
    schema = require('pelias-schema'),
    through = require('through2'),
    dbclient = require('dbclient')({ batchSize: 1 });

// use datapath setting from your config file
var basepath = settings.imports.quattroshapes.datapath;

// testing
// basepath = '/media/hdd/osm/quattroshapes/simplified';

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
      woe:    'qs_woe_id'
    },
    index:    'pelias',
    type:     'local_admin'
  },
  {
    path: basepath + '/qs_localities.shp',
    props: {
      name:   ['qs_loc'],
      admin0: 'qs_adm0',
      admin1: 'qs_a1',
      admin2: 'qs_a2',
      gn:     'gs_gn_id',
      woe:    'qs_woe_id'
    },
    index:    'pelias',
    type:     'locality'
  },
  {
    path: basepath + '/qs_neighborhoods.shp',
    props: {
      name:   ['name'],
      admin0: 'name_adm0',
      admin1: 'name_adm1',
      admin2: 'name_adm2',
      gn:     'gn_id',
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

    // remove any props not in the schema mapping
    var allowedProperties = Object.keys( schema.mappings[ shp.type ].properties ).concat( [ 'id', 'type' ] );

    shapefile.createReadStream( shp.path, { encoding: 'UTF-8' } )
      .pipe( mapper( shp.props, shp.type ) )
      .pipe( suggester.pipeline )
      .pipe( propStream.whitelist( allowedProperties ) )
      .pipe( through.obj( function( item, enc, next ){
        var id = item.id;
        delete item.id;
        this.push({
          _index: 'pelias',
          _type: shp.type,
          _id: id,
          data: item
        });
        next();
      }))
      .pipe( dbclient );
  }
});

if( !found ){
  console.error( 'please select an import...' );
  console.error( imports.map( function( i ){
    return i.type;
  }).join(', '));
  process.exit(1);
}
