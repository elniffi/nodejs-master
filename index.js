/*
* Primary file for the API
*
*/

// Core dependencies
const http = require('http')
const https = require('https')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const fs = require('fs')

// Dependencies
const config = require('./config')
const {
  ping,
  users
} = require('./handlers')

// Define a request router
const router = {
  ping,
  users
}

const sender = (res, statusCode = 200, payload = {}) => {
  // Convert the payload to a json string
  const payloadString = JSON.stringify(payload)

  // If there was no payload provided
  if (payloadString !== '{}') {
    res.setHeader('Content-Type', 'application/json')
    res.writeHead(statusCode)
    res.end(payloadString)
  } else {
    // If no payload is given, send back the standard string for the given http code
    res.setHeader('Content-Type', 'text/plain')
    res.writeHead(statusCode)
    res.end(http.STATUS_CODES[statusCode])
  }
}

// All the server logic for both http and https server
const unifiedServer = (req, res) => {
  // Get the URL and parse it
  const parsedUrl = url.parse(req.url, true)

  // Get the path
  const path = parsedUrl.pathname
  const trimmedPath = path.replace(/^\/+|\/+$/g, '')

  // Get the query string as an object
  const queryStringObject = parsedUrl.query

  // Get the HTTP Method
  const method = req.method.toLowerCase()

  // Get the headers as an object
  const headers = req.headers

  // Get the payload, if any
  const decoder = new StringDecoder('utf-8')
  let buffer = ''

  req.on('data', (data) => {
    buffer += decoder.write(data);
  })

  req.on('end', () => {
  
    buffer += decoder.end()

    let payload

    const boundSender = sender.bind(null, res)

    // assume payload is json string
    // TODO: What if there is no payload?!
    try {
      payload = JSON.parse(buffer)
    } catch (error) {
      return boundSender(400)
    }

    // construct the data object to send to the handler
    const data = {
      path: trimmedPath,
      query: queryStringObject,
      payload,
      method,
      headers
    }


    // if path is not defined send 404
    if (!router[trimmedPath]) {
      return boundSender(404)
    }
    
    // if method is not supported on path send 405
    if (!router[trimmedPath][method]) {
      return boundSender(405) 
    }

    const handler = router[trimmedPath][method]

    // Route the request to the found handler
    handler(data, boundSender)
  })
}

// Instantiate the HTTP server
const httpServer = http.createServer(unifiedServer)

// Instantiate the HTTPS server
const httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem')
}
const httpsServer = https.createServer(httpsServerOptions, unifiedServer)

// Start the HTTP server
httpServer.listen(config.httpPort, () => {
  console.log(`The server is listening for http traffic on port ${config.httpPort}`)
})

// Start the HTTPS server
httpsServer.listen(config.httpsPort, () => {
  console.log(`The server is listening for https traffic on port ${config.httpsPort}`)
})