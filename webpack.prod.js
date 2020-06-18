const path = require('path');
const buildPath = path.resolve(__dirname, 'dep_pack/js');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const imageminMozjpeg = require('imagemin-mozjpeg');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {scanFiles, getAltName} = require('./src/scanDir')

//plugins.push(new CleanWebpackPlugin(buildPath))
var plugins = require('./webpack.plugins.prod')
plugins.push(
    new MiniCssExtractPlugin({
        filename: "../css/[name].css",
        chunkFilename: "[id].[contenthash].css"
    }),
    new CopyWebpackPlugin({
        patterns:[
            {
            from: 'img/**/**',
            to: path.resolve(__dirname, 'dep_pack')
            }
        ]
    }),
    new ImageminPlugin({ 
        test: /\.(jpe?g|png|gif|svg)$/i,
        pngquant: ({quality: [50-90]}),
        plugins: [
            imageminMozjpeg({
              quality: 50,
              progressive: true
            })
          ] 
    })
)

const getEntries = () =>{
  let entries = {}
  let files = scanFiles()
  //for(let filePath of files.html) entries[getAltName(filePath)] = 'filePath.substr(0,filePath.lastIndexOf('.')) + '.js'
  for(let script of files.js) {
      let base = script.substr(script.indexOf('/'), script.length)
      let name = base.substr(0, base.lastIndexOf('.'))
      entries[name] = './'+script
  }
  return entries;
}

module.exports = {
    mode:'production',
    entry: getEntries,
    output: {
        path: buildPath
    },
    module: {
        rules: [
            //JS
            {
              test: /\.js$/,
              exclude: [
                /node_modules/,
                /src/,
                /test/,
              ],
              loader: 'babel-loader',
              options: {
                  presets: ['@babel/preset-env']
              }
            },
            //CSS
            {
              test: /\.css$/,
              use: [
                MiniCssExtractPlugin.loader,
                "css-loader"
              ],
            },
            //SASS
            {
              test: /\.s[c|a]ss$/,
              use: [
                MiniCssExtractPlugin.loader,
                "css-loader",
                {
                  loader: 'sass-loader',
                  options: {
                    //sourceMap,
                  },
                },
              ],
            },
            //LESS
            {
              test: /\.less$/,
              use: [
                MiniCssExtractPlugin.loader,
                "css-loader",
                {
                  loader: 'less-loader',
                  options: {
                    //sourceMap,
                  },
                },
              ],
            }
        ]
    },
    plugins
};