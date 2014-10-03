
***Not ready for public use***
Proceed at your own risk.

#### Installation
1. `wget https://s3.amazonaws.com/peter.johnson/quattroshapes-simplified.tar.gz`
2. `git clone git@github.com:pelias/quattroshapes-pipeline.git && cd quattroshapes-pipeline`;
3. `npm install`;
4. follow [these instructions](https://github.com/pelias/config#local-config) to define the quattroshapes datapath in your local config.
5. list available imports: `node example/runme.js`;
6. import a layer `node example/runme.js admin0`;
7. repeat for other polygon layers
