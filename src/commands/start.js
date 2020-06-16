const {Command, flags} = require('@oclif/command')
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('../../webpack.dev');
const Build = require('arjan-build');
const fs = require('fs');
const path = require('path');
const {scanFiles, getAltName} = require('../scanDir')

const port = 8080;
const options = {
  port: 8080,
  open: true
};

//create the appropriate filestructure for each file
function createFakePaths(files){
  return new Promise((resolve, reject) => {
    Build.createDir('./lib')
    .then(async (data)=> {
      for(let f in files){
        if(files[f].startsWith('./')) files[f] = files[f].substr(2);
        if(files[f].includes('/')){
          let dirs = files[f].split('/');
          let path = './lib';
          for(let i=0; i<dirs.length-1; i++){
            path += '/'+dirs[i];
            await Build.createDir(path).catch(err => reject(err))
            if(i >= dirs.length -2  && f >= files.length-1) resolve(true)
          }
        }
        else if(f >= files.length-1) resolve(true)
      }
    }).catch(err => reject(err))
  })
}

function createFakeScripts(){
  return new Promise((resolve, reject) => {
    //files should get html js and css files.
    let files = scanFiles()
    console.log(files)
    let stylesheets = files.css.map(style => `require('../${style}')`).join('\n')
    createFakePaths(files.html)
    .then(() => {
      for(let f in files.html){
        let filename = './lib/'+files.html[f].substr(0,files.html[f].lastIndexOf('.')) + '.js';
        Build.createFile(filename, files.html[f].includes('/')?'':stylesheets)
        .then(()=> {
          if(f>=files.html.length-1)resolve(true)
        }).catch(err => reject(err))
      }
    }).catch(err => reject(err))
  })
}

class StartCommand extends Command {
  async run() {
    const {flags} = this.parse(StartCommand)
    const server = new WebpackDevServer(webpack(config), options);
    createFakeScripts().then(() => {
      server.listen(port, 'localhost', (err) =>{
        if (err) console.log(err);
        console.log('WebpackDevServer listening at localhost:', port);
      });
    })
  }
}

StartCommand.description = `Describe the command here
...
Extra documentation goes here
`

StartCommand.flags = {
  name: flags.string({char: 'n', description: 'name to print'}),
}

module.exports = StartCommand
