const path = require('path');

module.exports = {
  entry: 'app.js',
  output: {
    publicPath: '/',
    path: path.resolve(__dirname),
    filename: 'bundled.js',
  },
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    port: 3333,
    static: {
      directory: path.join(__dirname, 'app'),
    },
    hot: true,
    liveReload: false,
    historyApiFallback: { index: 'index.html' },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', { targets: { node: '12' } }]],
          },
        },
      },
    ],
  },
};
