#### Installation
1. `wget http://http://quattroshapes.mapzen.com/quattroshapes-simplified.tar.gz`
2. `git clone git@github.com:pelias/quattroshapes.git && cd quattroshapes`;
3. `npm install`;
4. follow [these instructions](https://github.com/pelias/config#local-config) to define the quattroshapes datapath in your local config.
5. list available imports: `node example/runme.js`;
6. import a layer `node example/runme.js admin0`;
7. repeat for other polygon layers

#### alpha3 filter

You can optionally restrict the import to a specific country (alpha3)

ref: http://en.wikipedia.org/wiki/ISO_3166-1_alpha-3

```bash
$> node example/runme.js local_admin GBR
```
