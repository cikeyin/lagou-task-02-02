######  1、Webpack 的构建流程主要有哪些环节?如果可以请尽可能详尽的描述Webpack打包的整个过程。
 （1） 初始化参数
 解析Webpack配置参数，合并shell传入的配置参数和webpack.config.js文件配置的参数，形成最后的配置结果。
 （2）开始编译
 根据上一步得到的参数初始化 compiler 对象， 注册所有配置的插件，插件监听Webpack构建生命周期的事件节点。
 （3）确定入口
 从配置文件（webpack.config.js）中指定的 entry 入口，开始解析文件构建AST语法树，找到相关依赖，并进行递归找到所有的依赖项。
 （4）编译模块
 递归中根据文件类型和loader配置，调用配置中的loader对相应类型文件进行转换。
 （5）完成模块编译并输出
 递归完后，得到每个文件结果，包含每个模块以及他们之间依赖关系，根据entry配置生成代码块chunk。最后Webpack会将所有的chunk转换成文件输出Output。
 
######  2、Loader 和Plugin有哪些不同?请描述一下开发 Loader和Plugin的思路。
（1）Loader 是加载器，用来加载资源文件，负责资源文件从输入到输出的转换。处理一个文件可以使用多个loader，loader的执行顺序和配置中的顺序是相反的，即最后一个loader最先执行，第一个loader最后执行。第一个执行的loader接收源文件内容作为参数，其它loader接收前一个执行的loader的返回值作为参数，最后执行的loader会返回此模块的JavaScript源码。
（2）Plugin是webpack的插件，负责增强自动化的能力，Plugin通过钩子机制实现，会监听webpack的生命周期事件，通过webpack提供的API改变输出结果。

**实现方式**
（1）Loader就是一个模块，接收文件内容，对内容进行操作后返回js代码。
```javascript
module.exports = source => {
    return  'console.log("hello")'
}
```
（2）Plugin是一个函数或者一个包含apply方法的对象，通过在生命周期的钩子中挂载函数来实现，使用时通过构建实例来使用。
```javascript
class MyPlugin {
  // compiler对象包含构建的配置信息，也通过此对象注册钩子函数
  apply(compiler) {
    compiler.hooks.emit.tap("MyPlugin", compilation => {
      // compilation可以理解为此次打包的上下文
      // compilation.assets为资源信息
      for (const name in compilation.assets) {
        if (name.endsWith('.js')) {
          const content = compilation.assets[name].source();
          const withoutComments = content.replace(/\/\*\*+\*\//g, '')
          compilation.assets[name] = {
            source: () => withoutComments,
            size: () => withoutComments.length
          }
        }
      }
    })
  }
}
```

3. 使用 Webpack 实现 Vue 项目打包任务

（1）针对不同环境配置不同配置文件，提取公共配置参数到webpack.common.js，包含加载各类资源使用的loader，以及部分插件（解析vue文件的vue-loader-plugin插件和解析html模板的html-webpack-plugin插件）。需要注意的是，不同版本的插件语法有所不同，使用时以官方文档为准。
```javascript
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
```
（2）在生产环境的配置文件中，引入公共配置文件，再配置生产环境特有的配置信息，包括每次打包前清空上次打包的文件（clean-webpack-plugin）、拷贝静态资源（copy-webpack-plugin）、设置source-map类型为none，防止暴露源代码，最后通过使用webpack-merge提供的merge方法与公共配置信息进行合并。
```javascript
//  webpack.prod.js
const common = require('./webpack.common')
const {
    merge
} = require('webpack-merge')

const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = merge(common, {
    mode: 'production',
    devtool: 'none',
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [{
                from: 'public'
            }],
        })
    ]
})
```
（3）在开发环境的配置文件中，同样引入公共配置文件，再配置开发环境特有的配置信息，设置source-map类型为cheap-module-eval-source-map，方便在开发时调试，同时使用webpack-dev-server，其集成了自动编译和自动刷新浏览器等功能，提高开发效率。
```javascript
//  webpack.dev.js
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
```
