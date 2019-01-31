const isDefined = data => typeof data !== 'undefined'

module.exports = {
  isDefined,
  isRequired: data => isDefined(data),
  // Note the use of "|| !isDefined" is basically to fallback to true for the validation
  // if the value is not defined since only isRequired should actually require the value to be defined
  // but that fallback should obviously only happen if the value is NOT defined.
  isBoolean: data => typeof data === 'boolean' || !isDefined(data),
  isString: data => typeof data === 'string' || !isDefined(data),
  hasLength: data => (data && data.length) ? data.length > 0 : !isDefined(data),
  isEnum: (...valid) => (data) => valid.includes(data),
  isArray: data => Array.isArray(data),
  isNumber: data => typeof data === 'number',
  isWholeNumber: data => data % 1 === 0 
}