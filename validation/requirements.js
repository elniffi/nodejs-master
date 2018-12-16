const {
  isRequired,
  isString,
  isBoolean,
  hasLength
} = require('./validators')

module.exports = {
  firstName: [
    isRequired,
    isString,
    hasLength
  ],
  lastName: [
    isRequired,
    isString,
    hasLength
  ],
  password: [
    isRequired,
    isString,
    hasLength
  ],
  phone: [
    isRequired,
    isString,
    hasLength, 
    (data) => data.length === 10
  ],
  tosAgreement: [
    isRequired,
    isBoolean,
    (data) => data === true
  ]
}