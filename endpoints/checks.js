const {
  maxChecks
} = require('../config')

const {
  createRandomString
} = require('../helpers')

const {
  read,
  create,
  update
} = require('../data')

const {
  verifyToken
} = require('../utils/authenticate')

const {
  requirements,
  validators: {
    isRequired,
    isString,
    isArray,
    hasLength,
    isEnum,
    isNumber,
    isWholeNumber,
    isDefined
  },
  validator
} = require('../validation')

const checksGetValidationConfig = [
  {
    key: 'id',
    location: 'query',
    requirements: [
      isRequired,
      isString,
      hasLength,
      (data) => data.length === 20
    ]
  }
]
const checksPostValidationConifg = [
  {
    key: 'protocol',
    requirements: [
      isRequired,
      isString,
      isEnum('http', 'https')
    ]
  },
  {
    key: 'url',
    requirements: [
      isRequired,
      isString,
      hasLength
    ]
  },
  {
    key: 'method',
    requirements: [
      isRequired,
      isString,
      isEnum('get', 'post', 'put', 'delete')
    ]
  },
  {
    key: 'successCodes',
    requirements: [
      isRequired,
      isArray,
      hasLength
    ]
  },
  {
    key: 'timeoutSeconds',
    requirements: [
      isRequired,
      isNumber,
      isWholeNumber,
      data => data >= 1 && data <= 5
    ]
  },
]

const checksPutValidationConfig = [
  { ...checksGetValidationConfig, ...{ location: 'payload' } },
  {
    key: 'protocol',
    requirements: [
      isString,
      isEnum('http', 'https')
    ]
  },
  {
    key: 'url',
    requirements: [
      isString,
      hasLength
    ]
  },
  {
    key: 'method',
    requirements: [
      isString,
      isEnum('get', 'post', 'put', 'delete')
    ]
  },
  {
    key: 'successCodes',
    requirements: [
      isArray,
      hasLength
    ]
  },
  {
    key: 'timeoutSeconds',
    requirements: [
      isNumber,
      isWholeNumber,
      data => (data >= 1 && data <= 5) || !isDefined(data)
    ]
  },
]

module.exports = {
  // Required data: id
  // Optional data: none
  get: (data, callback) => {
    if (!validator(checksGetValidationConfig, data.query)) {
      return callback(400, { message: 'data validation failed' })
    }

    const {
      id
    } = data.query

    const token = data.headers.token

    // Lookup the check
    read('checks', id, (error, checkData) => {
      if (!error && checkData) {
        // Verify that the token is valid and belongs to the user who created the check
        verifyToken(token, checkData.userPhone, isValid => {
          if (isValid) {
            callback(200, checkData)
          } else {
            callback(401)
          }
        })
      } else {
        callback(404)
      }
    })
  },
  // Required data: protocol, url, method, successCodes, timeoutSeconds
  // Optional data: none
  post: (data, callback) => {
    // if payload validation fails we should return a 400
    if (!validator(checksPostValidationConifg, data.payload)) {
      return callback(400, { message: 'data validation failed' })
    }

    const {
      protocol,
      url,
      method,
      successCodes,
      timeoutSeconds
    } = data.payload

    const token = data.headers.token

    if (typeof token === 'string' && token) {
      // NOTE: don't we also need to check the timeout for the token.
      read('tokens', token, (error, tokenData) => {
        // Token exists / is valid
        if (!error && tokenData) {
          const phone = tokenData.phone

          // Get the user that the token belongs to
          read('users', phone, (error, userData) => {
            if (!error && userData) {
              // Default to an empty array if none exists
              const userChecks = (Array.isArray(userData.checks)) ? userData.checks : []

              // Verify that the number of checks is less than the maximum
              if (userChecks.length < maxChecks) {
                // Create a random id for the check
                const checkId = createRandomString(20)

                // Create the check object, and include the user's phone
                const check = {
                  id: checkId,
                  // To be able to reference it back to the user it belongs
                  userPhone: phone,
                  method,
                  protocol,
                  url,
                  successCodes,
                  timeoutSeconds
                }

                create('checks', checkId, check, (error) => {
                  if (!error) {
                    // Add the check id to the user object
                    userChecks.push(checkId)
                    userData.checks = userChecks

                    // Persist the new user data and if successful send back check object
                    update('users', phone, userData, (error) => {
                      if (!error) {
                        callback(201, check)
                      } else {
                        callback(500, { message: 'could not persist user' })
                      }
                    })

                  } else {
                    callback(500, { message: 'could not persist the check' })
                  }
                })
              } else {
                callback(400, { message: `maximum number of checks reached (${maxChecks})` })
              }
            } else {
              callback(401)
            }
          })
        } else {
          callback(401)
        }
      })
    } else {
      callback(400, { message: 'data validation failed' })
    }

  },
  // Required data: id
  // Optional data: protocol, url, method, successCodes, timeoutSeconds [at least one of the optional pieces of data]
  put: (data, callback) => {
    if (!validator(checksPutValidationConfig, data.payload)) {
      return callback(400, { message: 'data validation failed' })
    }

    // We require at least one of the optional fields
    if (!data.protocol && !data.url && !data.method && !data.successCodes && !data.timeoutSeconds) {
      return callback(400, { message: 'data validation failed' })
    }

    read('checks', id, (error, checkData) => {
      if (!error && checkData) {
        const token = data.headers.token

        verifyToken(token, checkData.userPhone, isValid => {
          if (isValid) {
            // Take currently saved values and override with anything set in the payload
            const toSave = { ...checkData, ...payload.data }

            // Store the updated object
            update('checks', id, checkData, error => {
              if (!error) {
                callback(200)
              } else {
                callback(500)
              }
            })
          } else {
            callback(401)
          }
        })
      } else {
        callback(404)
      }
    })
  },
  delete: () => {

  }
}