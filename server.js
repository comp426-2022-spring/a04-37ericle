// Define app using express
const express = require('express')
const app = express()

const args = require('minimist')(process.argv.slice(2));
// Require database SCRIPT file
const logdb = require('./database')
// Require md5 MODULE
const md5 = require('md5')
// Make Express use its own built-in body parser for both urlencoded and JSON body data. 
app.use(express.urlencoded({ extended: true}))
app.use(express.json())
// Require morgan
const morgan = require('morgan')
//Require fs
const fs = require('fs')
// Server port
var port = args['port']
// Command line options
var debug = args['debug']
var log = args['log']
// Start server
const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%', port))
})

// Create access log file if --log=true
if (args.log) {
  const accesslog = fs.createWriteStream('access.log', {flags: 'a'})
  app.use(morgan('combined', {stream: accesslog}))
}

app.post('/',(req, res, next) => {
  let logdata = {
    remoteaddr: req.ip,
    remoteuser: req.user,
    time: Date.now(),
    method: req.method,
    url: req.url,
    protocol: req.protocol,
    httpversion: req.httpVersion,
    status: res.statusCode,
    referer: req.headers['referer'],
    useragent: req.headers['user-agent']
}
  const logger = logdb.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, datetime, method, url, protocol, httpversion, secure, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
  const info = logger.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent)
  //res.json(info)
  //console.log(info)
  next()
})

app.get('/app/', (req, res) => {
        res.status(200).end('OK')
        res.type('text/plain')
    });

app.get('/app/flip', (req, res) => {
    res.status(200)
    res.type('text/plain')
    res.json({'flip': coinFlip()})
})

app.get('/app/flips/:number', (req, res) => {
    res.status(200)
    var flipsArray = coinFlips(req.params.number)
    res.json({'raw': flipsArray, 'summary': countFlips(flipsArray)})
})

app.get('/app/flip/call/heads', (req, res) => {
    res.status(200)
    res.json(flipACoin("heads"))
})

app.get('/app/flip/call/tails', (req, res) => {
    res.status(200)
    res.json(flipACoin("tails"))
})
if (args.debug) {
  app.get('/app/log/access', (req, res) => {
    try {
      const stmt = logdb.prepare('SELECT * FROM accesslog').all()
      res.status(200).json(stmt)
    } catch {
      console.error(e)
    }
})
  app.get('app/error', (req, res) => {
    throw new Error('Error test successful.')
  })
}

// See what is stored in the object produced by minimist
console.log(args)
// Store help text 
const help = (`
server.js [options]

--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.

--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.

--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.

--help	Return this message and exit.
`)
// If --help or -h, echo help text to STDOUT and exit
if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}




// Functions

function coinFlip() {
  return (Math.floor(Math.random() * 2) == 0) ? "heads" : "tails";
}

function coinFlips(flips) {
var output = [];
for (let i = 0; i < flips; i++) {
  output.push(coinFlip())
}
return output;
}

function countFlips(array) {
  let countArray = [];
  let headsCount = 0;
  let tailsCount = 0;
  var o = new Object();
  array.forEach(function(item) {
    if (item == "heads") {
      headsCount += 1;
    }
    if (item == "tails") {
      tailsCount += 1;
    }
  });
  if (headsCount == 0) {
    o = {tails: tailsCount}
  }
  else if (tailsCount == 0) {
    o = {heads: headsCount}
  }
  else {
    o = {heads: headsCount, tails: tailsCount}
  }
  return o;
}

function flipACoin(call) {
let result = "";
let flip = (Math.floor(Math.random() * 2) == 0) ? "heads" : "tails";
if (flip == call) {
  result = "win"
}
else {
  result = "lose"
}
let o = {call: call, flip: flip, result: result}
return o;
}  

function flipACoin(call) {
  let result = "";
  let flip = (Math.floor(Math.random() * 2) == 0) ? "heads" : "tails";
  if (flip == call) {
    result = "win"
  }
  else {
    result = "lose"
  }
  let o = {call: call, flip: flip, result: result}
  return o;
}

app.use(function(req, res){
  res.status(404).send('404 NOT FOUND')
  res.type('text/plain')
});