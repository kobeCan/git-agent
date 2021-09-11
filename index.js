#!/usr/bin/env node
const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')
const arg = require('arg')
const env = require('dotenv')
const { homedir, EOL } = require('os')


// git-agent --list
// git-agent --set-proxy socks5://127.0.0.1:7890 --name gitproxy
// git-agent https://github.com/dominictarr/through.git --name gitproxy

const args = arg({
  '--proxy': String,

  '--set-proxy': String,

  '--name': String,

  '--list': Boolean,
  
  '--version': Boolean,

  '-p': '--proxy',

  '-v': '--version'
})
const version = args['--version']

const proxy = args['--proxy']
const setProxy = args['--set-proxy']
const proxyName = args['--name'] || 'default'
const [ address ] = args['_']
const list = args['--list']

const configpath = path.join(homedir(), '.gitagent_config')

const envconfig = env.config({
  path: configpath
})

const config = envconfig.error ? {} : envconfig.parsed

if (version) {
  console.log(`${require('./package.json').name} v${require('./package.json').version}`)
  return
}

if (list) {
  console.log(config)
  return
}

if (setProxy) {
  config[proxyName] = setProxy
  const output = []
  for (const key in config) {
    output.push(`${key}=${config[key]}`)
  }

  fs.writeFileSync(configpath, output.join(EOL), {
    flag: 'w'
  })

  return
}

if (address) {
  const useProxy = config[proxyName]

  let arg = ''

  if (useProxy) {
    console.log("You will use ", useProxy, ' to clone the repository...');
    arg = `-c http.proxy=${useProxy}`
  } else {
    console.error("No Proxy configed, will not use proxy to git clone.")
  }
  
  const clone = `git clone ${arg} ${address}`
  
  try {
    execSync(clone, {
      stdio: 'inherit'
    })
  } catch (error) {
    console.log(error.message)
  }

}

