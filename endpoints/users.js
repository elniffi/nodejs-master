const {
  hash
} = require('../helpers')
const {
  read,
  create,
  update,
  remove
} = require('../data')
const {
  requirements,
  validator
} = require('../validation')

const {
  verifyToken
} = require('../utils/authenticate')

const userPostValidationConfig = [
  {
    key: 'firstName',
    requirements: requirements.firstName
  },
  {
    key: 'lastName',
    requirements: requirements.lastName
  },
  {
    key: 'phone',
    requirements: requirements.phone
  },
  {
    key: 'password',
    requirements: requirements.password
  },
  {
    key: 'tosAgreement',
    requirements: requirements.tosAgreement
  }  
]       
const userGetValidationConfig = [
  {
    key: 'phone',
    requirements: requirements.phone
  }
]
const userPutValidationConfig = [
  {
    key: 'firstName',
    requirements: requirements.firstName
  },
  {
    key: 'lastName',
    requirements: requirements.lastName
  },
  {
    key: 'phone',
    requirements: requirements.phone
  },
  {
    key: 'password',
    requirements: requirements.password
  }
]
const userDeleteValidationConfig = [
  {
    key: 'phone',
    requirements: requirements.phone
  }
]

//TODO: Get, Update and Delete should only work for authenticated users on their own user only
module.exports = {
  // Required data: firstName, lastName, phone, password, tosAgreement
  // Optional data: none
  post: (data, callback) => {
    // if payload validation fails we should return a 400
    if (!validator(userPostValidationConfig, data.payload)) {
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
        const hashedPassword = hash(password)
        
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
    if (!validator(userGetValidationConfig, data.query)) {
      return callback(400, { message: 'data validation failed'})
    }
    
    const token = data.headers.token
    const phone = data.query.phone

    verifyToken(token, phone, isValid => {
      if (isValid) {
        read('users', phone, (error, user) => {
          if (!error && user) {
            // Remove the hashed password from the user before returning to requestor
            delete user.hashedPassword
    
            callback(200, user)
          } else {
            callback(404)
          }
        })
      } else {
        callback(401)
      }
    })
  },
  // Required data: phone
  // Optional data: firstName, lastName, password, tosAgreement (at least one must be specified)
  put: (data, callback) => {
      // Check that the phone number is valid
      // and if the other optional fields are set that they also are valid.
      if (!validator(userPutValidationConfig, data.payload)) {
        return callback(400, { message: 'data validation failed'})
      }

      const token = data.headers.token
      const { phone, firstName, lastName, password } = data.payload

      verifyToken(token, phone, isValid => {
        if (isValid) {
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
                updatedUserData.hashedPassword = hash(password)
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
        } else {
          callback(401)
        }
      }) 
  },
  // Required data: phone
  // Optional data: none
  delete: (data, callback) => {
    // if payload validation fails we should return a 400
    if (!validator(userDeleteValidationConfig, data.payload)) {
      return callback(400, { message: 'data validation failed'})
    }

    const token = data.headers.token
    const { phone } = data.payload

    verifyToken(token, phone, isValid => {
      if (isValid) {
        read('users', phone, (error, userData) => {
          if (!error && userData) {
            // TODO: This should also cleanup any tokens that belongs to that user
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
      } else {
        callback(401)
      }
    })
  }
}