/*
 * Request handlers
 * 
 */

// Dependencies

module.exports = {
  ping: (data, callback) => {
    callback(200)
  },
  notFoundHandler: (data, callback) => {
    callback(404)
  }
}