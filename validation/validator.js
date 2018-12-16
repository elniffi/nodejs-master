module.exports = (requirements, payload) => {
  // requirements is an array so need to get the keys from each requirement
  const requirementKeys = requirements.map(requirement => requirement.key)

  // first make sure no extra fields where passed in
  const hasExtraProperties = Object
    // for every key defined in payload
    .keys(payload)
    // make sure there is a requirement for that payload key
    .some(key => !requirementKeys.includes(key))

  // if the payload had properties w/h any corresponding validation rule
  // then the request should be seen as invalid and validation fails  
  if (hasExtraProperties)  {
    return false
  }

  // validate data according to the requirements passed
  return requirements.every(
    ({key, requirements}) => 
      // For all requirements for a specific rule
      requirements.every(requirement => 
        // make sure they are all true
        requirement(payload[key]))
  )
}