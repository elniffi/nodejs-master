const {
  hash,
  createRandomString
} = require('../helpers')
const {
  read,
  create
} = require('../data')
const {
  requirements,
  validators: {
    isRequired,
    isString,
    hasLength
  },
  validator
} = require('../validation')

const tokensPostValidationConfig = [
  {
    key: 'phone',
    requirements: requirements.phone
  },
  {
    key: 'password',
    requirements: requirements.password
  }
]

const tokensGetValidationConfig = [
  {
    key: 'id',
    requirements: [
      isRequired,
      isString,
      hasLength,
      id => id.length === 36
    ]
  }
]

module.exports = {
  // Required data: phone, password
  // Optional data: none
  post: (data, callback) => {
    // if payload validation fails we should return a 400
    if (!validator(tokensPostValidationConfig, data.payload)) {
      return callback(400, { message: 'data validation failed'})
    }

    const { phone, password } = data.payload

    read('users', phone, (error, userData) => {
      if (!error && userData) {
        const hashedPassword = hash(password)
         
        // the provided password must match the password the user passed in after it also has been hashed
        if (userData.hashedPassword === hashedPassword) {
          // if it's an authenticated user then go ahead and create the token for that user
          const id = createRandomString(36);
          const expires = Date.now() + (1000 * 60 * 60)

          // build the token object that will be sent back to the user
          const tokenObject = {
            phone,
            id,
            expires
          }

          create('tokens', id, tokenObject, (error) => {
            if (!error) {
              callback(200, tokenObject)
            } else {
              callback(500)
            }
          })
        } else {
          callback(401)
        }
      } else {
        callback(404)
      }
    })
  },
  // Required data: id
  // Optional data: none
  get: (data, callback) => {
    // if payload validation fails we should return a 400
    if (!validator(tokensGetValidationConfig, data.query)) {
      return callback(400, { message: 'data validation failed'})
    }

    const { id } = data.query

    read('tokens', id, (error, tokenData) => {
      if (!error && tokenData) {
        callback(200, tokenData)
      } else {
        callback(404)
      }
    })
  },
  // Required data: id, extend
  // Optional data: none
  put: (data, callback) => {
    callback(200)
  },
  delete: (data, callback) => {
    callback(200)
  }
}