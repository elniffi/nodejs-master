/*
 * Request handlers
 * 
 */

// Dependencies

module.exports = {
  ping: {
    get: (data, callback) => {
      callback(200)
    }
  },
  users: {
    post: (data, callback) => {
      callback(200)
    },
    get: (data, callback) => {
      callback(200)
    },
    put: (data, callback) => {
      callback(200)
    },
    delete: (data, callback) => {
      callback(200)
    }
  }
}