//  webpack.common.js
const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'dist'),
        // publicPath: "dist/"
    },
    devServer: {
        contentBase: './public'
    },

    module: {
        rules: [{
            test: /.vue$/,
            use: 'vue-loader',
        }, {
            test: /.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        }, {
            test: /.js$/,
            exclude: /node_modules/,
            use: 'eslint-loader',
            enforce: 'pre'
        }, {
            test: /.css$/,
            use: ['style-loader', 'css-loader']
        }, {
            test: /.less$/,
            use: ['style-loader', 'css-loader', 'less-loader']
        }, {
            test: /.png$/,
            use: {
                loader: 'url-loader',
                options: {
                    limit: 10 * 1024
                }
            }
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "webpack plugin test",
            template: './public/index.html',

        }),
        new VueLoaderPlugin(),
    ]
}