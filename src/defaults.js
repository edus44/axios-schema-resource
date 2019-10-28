module.exports = {
  client: null,
  config: {},
  methods: {
    find(config) {
      return this.listAction(config).then(res=>res.data)
    },
    findOne(id, config = {}) {
      set(config, 'pathParams.id', id)
      return this.detailAction(config).then(res=>res.data)
    },
  },
  actions: {
    list: {
      method: 'get',
    },
    detail: {
      method: 'get',
      meta: {
        prependUrl: '/:id',
      },
    },
    create: {
      method: 'post',
    },
    update: {
      method: 'put',
      meta: {
        prependUrl: '/:id',
      },
    },
    delete: {
      method: 'delete',
      meta: {
        prependUrl: '/:id',
      },
    },
    multiDelete: {
      method: 'delete',
    },
  },
}