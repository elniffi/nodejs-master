const {
  read
} = require('../data')

module.exports = {
  /**
   * Verify if a given token id is valid for a given user ( phone )
   */
  verifyToken: (id, phone, callback) => {
    if (typeof id !== 'string' || !id) {
      callback(false)
    } else {
      // Lookup the token
      read('tokens', id, (error, tokenData) => {
        if (!error && tokenData) {
          // Check that the token is for the given user and has not expired
          if (tokenData.phone === phone && tokenData.expires > Date.now()) {
            callback(true)
          } else {
            callback(false)
          }
        } else {
          callback(false)
        }
      })
    }
  }
}