var WebpackDevServer = require("webpack-dev-server");
var webpack = require("webpack");

var webpackConfig = require('./webpack.config');
var devServerConfig = require('./webpack-dev-server.config');


var compiler = webpack(webpackConfig);
var server = new WebpackDevServer(compiler, devServerConfig);


var protocol = 'http';
var port = 8080;
var host = 'localhost';

server.listen(port, host, function(){
  console.log('Server running on: ' + protocol + '://' + host + ':' + port);
});

// {
//   host: '0.0.0.0',
//   // webpack-dev-server options
//   contentBase: process.cwd() + "/src",
//   // or: contentBase: "http://localhost/",

//   hot: true,
//   // Enable special support for Hot Module Replacement
//   // Page is no longer updated, but a "webpackHotUpdate" message is send to the content
//   // Use "webpack/hot/dev-server" as additional module in your entry point
//   // Note: this does _not_ add the `HotModuleReplacementPlugin` like the CLI option does. 

//   // Set this as true if you want to access dev server from arbitrary url.
//   // This is handy if you are using a html5 router.
//   historyApiFallback: false,

//   // Set this if you want webpack-dev-server to delegate a single path to an arbitrary server.
//   // Use "*" to proxy all paths to the specified server.
//   // This is useful if you want to get rid of 'http://localhost:8080/' in script[src],
//   // and has many other use cases (see https://github.com/webpack/webpack-dev-server/pull/127 ).
//   // proxy: {
//   //   "*": "http://localhost:9090"
//   // },

//   // webpack-dev-middleware options
//   quiet: false,
//   noInfo: false,
//   lazy: true,
//   filename: "main.bundle.js",
//   watchOptions: {
//     aggregateTimeout: 300,
//     poll: 1000
//   },
//   publicPath: "/",
//   outputPath: '/',
//   stats: { colors: true },
// });

// var protocol = 'http';
// var port = 8080;
// var host = 'localhost';

// server.listen(port, host, function(){
//   console.log('Server running on: ' + protocol + '://' + host + ':' + port);
// });

// // server.close();

