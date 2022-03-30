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

// Server port
var port = args['port']
// Command line options
var debug = args['debug']
var log = args['log']
var help = args['help']
// Start server
const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%', port))
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
if (debug == 'true') {
  app.get('/app/log/access', (req, res) => {
    res.status(200)
})
  app.get('app/error', (req, res) => {
    throw new Error('Error test successful')
  })
}


// let logger = (req, res, next) => {
//   let logdata = {
//     remoteaddr: req.ip,
//     remoteuser: req.user,
//     time: Date.now(),
//     method: req.method,
//     url: req.url,
//     protocol: req.protocol,
//     httpversion: req.httpVersion,
//     secure: req.secure,
//     status: res.statusCode,
//     referer: req.headers['referer'],
//     useragent: req.headers['user-agent']
//   }
//   console.log(logdata)
//   next()
// }

// app.use(logger)

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

// Functions
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