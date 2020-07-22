const common = require('./webpack.common')
const {
    merge
} = require('webpack-merge')

const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin')

module.exports = merge(common, {
    mode: 'development',
    devtool: 'cheap-module-eval-source-map',
    plugins: [
        new CleanWebpackPlugin(),
    ]
})