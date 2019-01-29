const ping = require('./endpoints/ping')
const users = require('./endpoints/users')
const tokens = require('./endpoints/tokens')
const checks = require('./endpoints/checks')

module.exports = {
  ping,
  users,
  tokens,
  checks
}