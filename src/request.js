const merge = require('lodash.merge')

/**
 * Joins every config, joins url and interpolate its parameter and
 * then calls the client with the final config
 *
 * @param {Object} client Request client
 * @param {Object} inputConfig Method config
 * @param {Object} actionConfig Config defined in action
 * @param {Object} resourceConfig Config defined in resource
 */
function request(client, inputConfig, actionConfig, resourceConfig) {
  // Merge configs, sort by precedence
  const config = merge({}, resourceConfig, actionConfig, inputConfig)

  // Compose url
  const fullUrl = `${config.appendUrl || ''}${config.url || ''}${config.prependUrl || ''}`
  config.url = interpolate(fullUrl, config.urlParams)

  // Call client with final config
  return client(config)
}

/**
 * Interpolate a string. Looks for each key found in values arguments in the form of ..:key.. and replaces with its value.
 *
 * @param {String} str String containing interpolation marks
 * @param {Object} values Keys to be interpolated
 */
function interpolate(str, values) {
  for (const key in values) str = str.replace(`:${key}`, encodeURIComponent(values[key]))
  return str
}

module.exports = request
