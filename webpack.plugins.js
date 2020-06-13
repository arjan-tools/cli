const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const ignorePaths = {
  'node_modules':true,
  'dep_pack':true
}

function scanFiles(){
  let arrs = [];
    scanDir("./", (filePath, stat) => arrs.push(filePath))
    return (arrs)
}
function scanDir(currentDirPath, callback) {
  fs.readdirSync(currentDirPath).forEach((name)=>{
    var filePath = path.join(currentDirPath, name);
    var stat = fs.statSync(filePath);
    if(!ignorePaths[filePath]) {
      if (stat.isFile()) {
        let ext = name.substr(name.lastIndexOf(".")+1, name.length)
        if(ext === "html") callback(filePath, stat);
      }
      else if (stat.isDirectory()) {
        //i && !fs.existsSync(`}/${filePath}`)) fs.mkdirSync(`}/${filePath}`)
        scanDir(filePath, callback)
      }
    }
  });
}

const getAltName =(filePath)=> filePath.substr(0, filePath.lastIndexOf(".")).replace(/\//g, '_')

const getHtmlPlugins =()=>{
  let files = scanFiles()
  console.log('FILEs ', files)
  htmlPlugins = []; 
  for(let filePath of files){
    htmlPlugins.push(
    new HtmlWebpackPlugin({
      template: './'+filePath,
      inject: true,
      chunks: [getAltName(filePath)],
      filename: filePath.includes('/') ? filePath.substr(filePath.lastIndexOf('/')+1, filePath.length) : filePath
    })
    )
  }
  return htmlPlugins
}

module.exports = getHtmlPlugins()