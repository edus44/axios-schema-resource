const DEFAULTS = require('./defaults')
const request = require('./request')

/**
 * Returns a closured factory of `resource` with a defaults object
 *
 * @param {Object} defaults
 */
function withDefaults(defaults = {}) {
  defaults = Object.assign({}, DEFAULTS, defaults)

  return function resource({ client, actions = {}, methods = {}, config = {}, statics = {} } = {}) {
    // Merge with defaults properties
    actions = Object.assign({}, defaults.actions, actions)
    methods = Object.assign({}, defaults.methods, methods)
    config = Object.assign({}, defaults.config, config)
    statics = Object.assign({}, defaults.static, statics)
    if (!client) client = defaults.client

    // Checks client is valid
    if (typeof client !== 'function') throw new Error('Client required')

    const instance = {}

    // Apply statics
    for (const propName in statics) {
      instance[propName] = statics[propName]
    }

    // Rebind methods
    for (const methodName in methods) {
      instance[methodName] = methods[methodName].bind(instance)
    }

    // Prefix every action and closures the request call
    for (const actionName in actions) {
      instance['$' + actionName] = inputConfig => {
        return request(client, inputConfig, actions[actionName], config)
      }
    }

    return Object.freeze(instance)
  }
}

/**
 * Main resource factory with initial defaults
 * and a method to create more factories
 */
const resource = withDefaults()
resource.withDefaults = withDefaults

module.exports = resource
