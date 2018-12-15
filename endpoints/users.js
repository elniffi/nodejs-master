const helpers = require('../helpers')
const {
  read,
  create,
  update,
  remove
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
    hasLength, 
    (data) => data.length === 10
  ]
}

const userPostValidationConfig = [
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
const userPutValidationConfig = [
  phoneValidation,
  {
    key: 'firstName',
    requirements: [
      isString,
      hasLength
    ]
  },
  {
    key: 'lastName',
    requirements: [
      isString,
      hasLength
    ]
  },
  {
    key: 'password',
    requirements: [
      isString,
      hasLength
    ]
  }
]
const userDeleteValidationConfig = [
  phoneValidation
]

//TODO: Get, Update and Delete should only work for authenticated users on their own user only
module.exports = {
  // Required data: firstName, lastName, phone, password, tosAgreement
  // Optional data: none
  post: (data, callback) => {
    // if payload validation fails we should return a 400
    if (!validate(userPostValidationConfig, data.payload)) {
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
  // Required data: phone
  // Optional data: firstName, lastName, password, tosAgreement (at least one must be specified)
  put: (data, callback) => {
      // Check that the phone number is valid
      // and if the other optional fields are set that they also are valid.
      if (!validate(userPutValidationConfig, data.payload)) {
        return callback(400, { message: 'data validation failed'})
      }

      const { phone, firstName, lastName, password } = data.payload

      if (!firstName && !lastName && !password) {
        return callback(400, { message: 'data validation failed'})
      }

      read('users', phone, (error, userData) => {
        if (!error && userData) {

          const updatedUserData = { ...userData }

          if (firstName) {
            updatedUserData.firstName = firstName
          }

          if (lastName) {
            updatedUserData.lastName = lastName
          }

          if (password) {
            updatedUserData.hashedPassword = helpers.hash(password)
          }

          update('users', phone, updatedUserData, (error) => {
            if (!error) {
              callback(200)
            } else {
              callback(500)
            }
          })
        } else {
          callback(404)
        }
      })
  },
  // Required data: phone
  // Optional data: none
  delete: (data, callback) => {
    // if payload validation fails we should return a 400
    if (!validate(userDeleteValidationConfig, data.payload)) {
      return callback(400, { message: 'data validation failed'})
    }

    const { phone } = data.payload

    read('users', phone, (error, userData) => {
      if (!error) {
        remove('users', phone, (error) => {
          if (!error) {
            callback(204)
          } else {
            callback(500)
          }
        })
      } else {
        callback(404)
      }
    })
  }
}