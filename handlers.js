const ping = require('./endpoints/ping')
const users = require('./endpoints/users')
const tokens = require('./endpoints/tokens')

module.exports = {
  ping,
  users,
  tokens
}