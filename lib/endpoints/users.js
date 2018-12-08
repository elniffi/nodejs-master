const {
  validators: {
    isRequired,
    isString,
    isBoolean,
    hasLength
  },
  validate
} = require('../validation')

const usersPostValidationConfig = [
  {
    key: 'firstName',
    requirements: [
      isRequired,
      isString,
      hasLength
    ]
  },
  {
    key: 'lastName',
    requirements: [
      isRequired,
      isString,
      hasLength
    ]
  },
  {
    key: 'phone',
    requirements: [
      isRequired,
      isString, 
      (data) => data.length === 10
    ]
  },
  {
    key: 'password',
    requirements: [
      isRequired,
      isString,
      hasLength
    ]
  },
  {
    key: 'tosAgreement',
    requirements: [
      isRequired,
      isBoolean,
      (data) => data === true
    ]
  }  
]       

module.exports = {
  // Required data: firstName, lastName, phone, password, tosAgreement
  // Optional data: none
  post: (data, callback) => {
    const {
      payload
    } = data

    // if payload validation fails we should return a 400
    if (!validate(usersPostValidationConfig, payload)) {
      return callback(400)
    }

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