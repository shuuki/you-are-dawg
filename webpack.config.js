module.exports = {
    context: process.cwd() + '/src/',
    entry: { null: "./index.jsx" },
    output: {
        path: '/',
        filename: "main.bundle.js"
    },
    resolveLoader: {
        root: process.cwd() + '/node_modules'
    },
    module: {
        loaders: [
            { test: /\.jsx$/, loader: "babel", exclude: "/(node_modules|bower_components)/" }
        ]
    }
};