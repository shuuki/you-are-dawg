module.exports = {
    context: process.cwd() + '/src/',
    entry: { null: "./index.jsx" },
    devtool: 'cheap-source-map',
    output: {
        path: '/',
        filename: "main.bundle.js"
    },
    resolveLoader: {
        root: process.cwd() + '/node_modules'
    },
    module: {
        loaders: [
            { test: /\.jsx$/, loader: "babel", exclude: "/(node_modules|bower_components)/" },
            { test: /\.less$/, loader: "style!css!autoprefixer!less", exclude: "/(node_modules|bower_components)/" }
        ]
    }
};