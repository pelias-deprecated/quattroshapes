#!/bin/bash

cd /var/www/mapzen/pelias-geonames;
/var/www/mapzen/pelias-geonames/bin/pelias-geonames -i all;

cd /var/www/pelias/quattroshapes-pipeline;
node example/runme.js admin0;
node example/runme.js admin1;
node example/runme.js admin2;
node example/runme.js local_admin;
node example/runme.js locality;
node example/runme.js neighborhood;