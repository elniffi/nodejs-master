/*
 * Helpers for various tasks
 *
 */

// Dependencies 
const crypto = require('crypto')
const config = require('./config')
const {
  hashingSecret
} = require('./config')

module.exports = {
  /**
   * Create a sha256 hash
   */
  hash: (password) => {
    if (typeof password !== 'string' || !password.length) {
      return false
    }

    // TODO: Consider replacing with crypto.pbkdf2(...) after done with training
    return crypto
      .createHmac('sha256', hashingSecret)
      .update(password)
      .digest('hex')
  }
}