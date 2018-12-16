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

const possibleCharacters = 'abcdefghijklmnopqrstuvxyz0123456789'

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
  },
  createRandomString: (length) => {
    if(typeof length !== 'number' || length <= 0 || length !== Math.floor(length)) {
      return false
    }

    let result = ''

    for (let i = 0; i < length; i++) {
      const randomPosition = Math.floor(Math.random() * possibleCharacters.length)
      const selectedCharacther = possibleCharacters.charAt(randomPosition)
      result += selectedCharacther
    }

    return result
  }
}