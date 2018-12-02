/*
 * Create and export configuration variables
 *
 */

// Container for all the environments 
const environments = {
  staging: {
    envName: 'staging',
    port: 3000
  },
  production: {
    envName: 'production',
    port: 5000
  }
} 

// Determine which environment was passed as a command-line argument
const currentEnvironment = (process.env.NODE_ENV) ? process.env.NODE_ENV : ''

// Check that the current environment is one of the environments above, if not, default to staging
const environmentToExport = (environments[currentEnvironment]) ? environments[currentEnvironment] : environments.staging

// Export the module
module.exports = environmentToExport