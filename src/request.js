const merge = require('lodash.merge')

function request(client, inputConfig, actionConfig, resourceConfig) {
  // Merge configs, sort by precedence
  const config = merge({}, resourceConfig, actionConfig, inputConfig)

  // Compose url
  const fullUrl = `${(config.meta && config.meta.appendUrl) || ''}${config.url ||
    ''}${(config.meta && config.meta.prependUrl) || ''}`
  config.url = interpolate(fullUrl, config.urlParams)

  return client(config)
}

function interpolate(str, values) {
  for (const key in values) str = str.replace(`:${key}`, encodeURIComponent(values[key]))
  return str
}

module.exports = request
