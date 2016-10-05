var webpack = require('webpack');


module.exports = {  
    entry: {
        app: ['./index.js']
    },
    externals: {
    'react': 'react',
    'rxjs': 'rxjs'
    },
    output: {
        library: 'oneflow',
        libraryTarget: 'umd',
        path: './build',
        filename: 'bundle.js'
    },
    module: {
      loaders: [
        { 
          test: /\.js$/, 
          exclude: /node_modules/, 
          loader: "babel", 
          query: {
            presets:['react','es2015', 'stage-2']
          }
          },
      ]
    }
};
