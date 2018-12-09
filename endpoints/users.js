const helpers = require('../helpers')
const {
  read,
  create
} = require('../data')
const {
  validators: {
    isRequired,
    isString,
    isBoolean,
    hasLength
  },
  validate
} = require('../validation')

const phoneValidation = {
  key: 'phone',
  requirements: [
    isRequired,
    isString, 
    (data) => data.length === 10
  ]
}

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
  phoneValidation,
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
const userGetValidationConfig = [
  phoneValidation
]

module.exports = {
  // Required data: firstName, lastName, phone, password, tosAgreement
  // Optional data: none
  post: (data, callback) => {
    // if payload validation fails we should return a 400
    if (!validate(usersPostValidationConfig, data.payload)) {
      return callback(400, { message: 'data validation failed'})
    }

    const {
      payload: {
        firstName,
        lastName,
        phone,
        password,
        tosAgreement
      }
    } = data

    // Make sure the user does not already exist
    read('users', phone, (error, data) => {
      // If any error we assume the user exists
      if (error) {
        // Hash the password
        const hashedPassword = helpers.hash(password)
        
        if (!hashedPassword) {
          return callback(500, { message: 'failed to hash user password'})
        }

        // Create the user object
        const userObject = {
          firstName,
          lastName,
          phone,
          hashedPassword,
          tosAgreement
        }

        // Store the user
        create('users', phone, userObject, (error) => {
          if (!error) {
            callback(201)
          } else {
            callback(500, { message: 'failed to create user'})
          }
        })
      } else {
        callback(409, { message: 'user already exists'})
      }
    })
  },
  // Required data: phone
  // Optional data: none
  get: (data, callback) => {
    // Check that the phone number is valid
    if (!validate(userGetValidationConfig, data.query)) {
      return callback(400, { message: 'data validation failed'})
    }

    const phone = data.query.phone

    read('users', phone, (error, user) => {
      if (!error && user) {
        // Remove the hashed password from the user before returning to requestor
        delete user.hashedPassword

        callback(200, user)
      } else {
        callback(404)
      }
    })
  },
  put: (data, callback) => {
    callback(200)
  },
  delete: (data, callback) => {
    callback(200)
  }
}