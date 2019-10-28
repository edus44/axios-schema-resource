const set = require('lodash.set')

const DEFAULTS = require('./defaults')
const request = require('./request')

function withDefaults(defaults = {}) {
  defaults = Object.assign({}, DEFAULTS, defaults)

  function resource({ client, actions = {}, methods = {}, config = {} }) {
    Object.assign(actions, defaults.actions)
    Object.assign(methods, defaults.methods)
    Object.assign(config, defaults.config)
    if (!client) client = defaults.client

    if (!client) throw new Error('Axios client required')

    for (const methodName in methods) {
      methods[methodName] = methods[methodName].bind(methods)
    }
    for (const actionName in actions) {
      methods[actionName + 'Action'] = inputConfig => {
        return request(client, inputConfig, actions[actionName], config)
      }
    }

    return methods
  }

  return resource
}

const resource = withDefaults()
resource.withDefaults = withDefaults

module.exports = resource