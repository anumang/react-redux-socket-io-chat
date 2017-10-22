var webpack = require('webpack');
var path = require('path');
var loaders = require('./webpack.loaders');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var WebpackCleanupPlugin = require('webpack-cleanup-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

loaders.push({
  test: /\.(sass|scss)$/,
  loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader?sourceMap&localIdentName=[local]___[hash:base64:5]!sass-loader?outputStyle=expanded' }),
  exclude: ['node_modules']
});

loaders.push({
  test: /font-awesome\.config\.js/,
  use: [
    { loader: 'style-loader' },
    { loader: 'font-awesome-loader' },
  ],
})

module.exports = {
  entry: [
    './src/index.js'
  ],
  output: {
    publicPath: '/',
    path: path.join(__dirname, 'public'),
    filename: '[chunkhash].js'
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    loaders
  },
  plugins: [
    new WebpackCleanupPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    /*new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        screw_ie8: true,
        drop_console: true,
        drop_debugger: true
      }
    }),*/
    new webpack.optimize.OccurrenceOrderPlugin(),
    new ExtractTextPlugin({
      filename: 'style.css',
      allChunks: true
    }),
    new HtmlWebpackPlugin({
      favicon: 'src/images/favicon.ico',
      template: './src/index.html',
      files: {
        css: ['style.css'],
        js: ['bundle.js'],
      }
    })
  ]
};
