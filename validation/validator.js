/**
 * requirements - the rules to be checked
 * data - {      
 *   path,
 *   query,
 *   payload,
 *   method,
 *   headers
 * }
 */
module.exports = (requirements, data) => {
  // requirements is an array so need to get the keys from each requirement
  const requirementKeys = requirements.map(requirement => requirement.key)

  // first make sure no extra fields where passed in
  const hasExtraProperties = Object
    // for every key defined in data
    .keys(data)
    // make sure there is a requirement for that data key
    .some(key => !requirementKeys.includes(key))

  // if the data had properties w/h any corresponding validation rule
  // then the request should be seen as invalid and validation fails  
  if (hasExtraProperties)  {
    return false
  }

  // validate data according to the requirements passed
  return requirements.every(
    ({location = 'payload', key, requirements}) => {
      // get data to validate, default to undefined if the location does not exist
      const toValidate = (data[location]) ? data[location][key] : undefined

      // run all the requirements using the piece of data extracted from the data object
      return requirements.every(requirement => requirement(toValidate))
    })
}