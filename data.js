/*
 * Library for storing and editing data
 *
 */

// Dependencies
const fs = require('fs')
const path = require('path')

// Base directory of the data folder
const baseDir = path.join(__dirname, '.data/')

const buildFilePath = (directory, filename) => 
  path.join(baseDir, directory, `/${filename}.json`)

module.exports = {
  // Write data to a file 
  create: (directory, filename, data, callback) => {
    const filePath = buildFilePath(directory, filename)
    
    // Open the file for writing
    fs.open(filePath, 'wx', (error, fileDescriptor) => {
      if (!error) {
        // Convert data to string
        const stringData = JSON.stringify(data, null, 2)
        
        // Write to file and close it
        fs.writeFile(fileDescriptor, stringData, error => {
          if (!error) {
            fs.close(fileDescriptor, error => {
              if (!error) {
                callback(false)
              } else {
                callback(error)
              }
            })
          } else {
            callback(error)
          }
        })
      } else {
        callback(error)
      }
    })
  },
  read: (directory, filename, callback) => {
    const filePath = buildFilePath(directory, filename)

    fs.readFile(filePath, 'utf-8', (error, data) => {
      callback(error, data)
    })
  },
  update: (directory, filename, data, callback) => {
    const filePath = buildFilePath(directory, filename)

    // Open the file for writing
    fs.open(filePath, 'r+', (error, fileDescriptor) => {
      if (!error) {
        // Convert data to string
        const stringData = JSON.stringify(data, null, 2)

        // Truncate the file
        fs.ftruncate(fileDescriptor, error => {
          if (!error) {
            // Write to file and close it
            fs.writeFile(fileDescriptor, stringData, error => {
              if (!error) {
                fs.close(fileDescriptor, error => {
                  if (!error) {
                    callback(false)
                  } else {
                    callback(error)
                  }
                })
              } else {
                callback(error)
              }
            })
          } else {
            callback(error)
          }
        })
      } else {
        callback(error)
      }
    })
  },
  delete: (directory, filename, callback) => {
    const filePath = buildFilePath(directory, filename)

    // Unlink the file
    fs.unlink(filePath, error => {
      if (!error) {
        callback(false)
      } else {
        callback(error)
      }
    })
  }
}