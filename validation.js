module.exports = {
  validators: {
    isRequired: data => typeof data !== 'undefined',
    isBoolean: data => typeof data === 'boolean',
    isString: data => typeof data === 'string',
    hasLength: data => data.length > 0
  },
  // For all the rules sent in
  validate: (config, payload) => config.every(
    ({key, requirements}) => 
      // For all requirements for a specific rule
      requirements.every(requirement => 
        // make sure they are all true
        requirement(payload[key]))
  )
}