var WebpackDevServer = require("webpack-dev-server");
var webpack = require("webpack");

var webpackConfig = require('./webpack.config');
var devServerConfig = require('./webpack-dev-server.config');


var compiler = webpack(webpackConfig);
var server = new WebpackDevServer(compiler, devServerConfig);


var protocol = 'http';
var port = 5000;
var host = '0.0.0.0';

server.listen(port, host, function(){
  console.log('Walking the dawg on: ' + protocol + '://' + host + ':' + port);
});
