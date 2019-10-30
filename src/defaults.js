const set = require('lodash.set')

const DEFAULTS = {
  client: null,
  config: {},
  methods: {
    find(config) {
      return this.$list(config).then(res => res.data)
    },
    findOne(id, config = {}) {
      set(config, 'urlParams.id', id)
      return this.$detail(config).then(res => res.data)
    },
    update(id, data, config = {}) {
      set(config, 'urlParams.id', id)
      config.data = data
      return this.$patch(config).then(res => res.data)
    },
    patch(id, data, config = {}) {
      set(config, 'urlParams.id', id)
      config.data = data
      return this.$patch(config).then(res => res.data)
    },
    remove(id, config = {}) {
      set(config, 'urlParams.id', id)
      return this.$delete(config).then(res => res.data)
    },
  },
  actions: {
    list: {
      method: 'get',
    },
    create: {
      method: 'post',
    },
    detail: {
      method: 'get',
      prependUrl: '/:id',
    },
    update: {
      method: 'put',
      prependUrl: '/:id',
    },
    patch: {
      method: 'patch',
      prependUrl: '/:id',
    },
    delete: {
      method: 'delete',
      prependUrl: '/:id',
    },
  },
}

module.exports = DEFAULTS
