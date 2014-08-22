
***Not ready for public use***
Proceed at your own risk.

#### Installation
1. `wget https://s3.amazonaws.com/peter.johnson/quattroshapes-simplified.tar.gz`
2. `git clone git@github.com:pelias/quattroshapes-pipeline.git && cd quattroshapes-pipeline`;
3. `npm install`;
4. edit `example/runme.js` and change the path to point to your the directory from the download above.
5. on the command line run: `which node` and edit `src/centroid-child.js:7` to match your binary location.
6. list available imports: `node example/runme.js`;
7. import a layer `node example/runme.js admin0`;
8. repeat for other polygon layers
