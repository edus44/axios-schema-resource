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
    remove(id, config = {}) {
      set(config, 'data', id)
      return this.$multiDelete(config).then(res => res.data)
    },
    removeOne(id, config = {}) {
      set(config, 'urlParams.id', id)
      return this.$delete(config).then(res => res.data)
    },
  },
  actions: {
    list: {
      method: 'get',
    },
    detail: {
      method: 'get',
      prependUrl: '/:id',
    },
    create: {
      method: 'post',
    },
    update: {
      method: 'put',
      prependUrl: '/:id',
    },
    delete: {
      method: 'delete',
      prependUrl: '/:id',
    },
    multiDelete: {
      method: 'delete',
    },
  },
}

module.exports = DEFAULTS
