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
  notFoundHandler
} = require('./lib/handlers')

// Define a request router
const router = {
  ping
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

    // Choose the handler this request should go to. If one is not found use the notFound handler
    const choosenHandler = (router[trimmedPath]) ? router[trimmedPath] : notFoundHandler

    //Construct the data object to send to the handler
    const data = {
      path: trimmedPath,
      query: queryStringObject,
      data: buffer,
      method,
      headers
    }

    // Route the request to the handler specified in the router
    choosenHandler(data, (statusCode = 200, payload = {}) => {
      // Convert the payload to a string
      const payloadString = JSON.stringify(payload)

      // Return the response
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode)
      res.end(payloadString)

      // Log the response to the request
      console.log('Returning this response: ', statusCode, payloadString)
    })
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