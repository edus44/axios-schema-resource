const resource = require('../src')
const axios = require('axios')
const MockAdapter = require('axios-mock-adapter')

const mock = new MockAdapter(axios)

beforeEach(() => mock.reset())

it('should require client', async () => {
  expect(() => {
    resource()
  }).toThrow('Client required')

  expect(() => {
    resource({ client: {} })
  }).toThrow('Client required')

  expect(() => {
    resource.withDefaults({ client: axios })({ client: {} })
  }).toThrow('Client required')
})

it('should have proper methods', async () => {
  const user = resource({
    client: axios,
    config: { baseURL: 'http://example.com' },
  })
  expect(user).toMatchObject({
    $list: expect.any(Function),
    $detail: expect.any(Function),
    $create: expect.any(Function),
    $update: expect.any(Function),
    $patch: expect.any(Function),
    $delete: expect.any(Function),
    find: expect.any(Function),
    findOne: expect.any(Function),
    update: expect.any(Function),
    patch: expect.any(Function),
    remove: expect.any(Function),
  })
})

it('should change default actions and methods', async () => {
  const defs = {
    config: {
      appendUrl: '/v1',
    },
    actions: { foo: { url: '/foo' } },
    methods: {
      findFoo() {
        return this.$foo()
      },
    },
  }
  const user = resource.withDefaults(defs)({
    client: axios,
    config: { baseURL: 'http://example.com' },
  })
  expect(user).toMatchObject({
    $foo: expect.any(Function),
    findFoo: expect.any(Function),
  })

  mock.onGet('http://example.com/v1/foo').reply(200, { foo: 'bar' })

  const res = await user.findFoo()
  expect(res).toMatchObject({
    status: 200,
    data: {
      foo: 'bar',
    },
  })
})

it('should rebind methods', async () => {
  const user = resource({
    client: axios,
    methods: {
      whoami() {
        return this
      },
    },
  })
  expect(user.whoami()).toBe(user)
})
it('should allow override defaults methods', async () => {
  const find = () => 'custom'
  const user = resource({
    client: axios,
    methods: {
      find,
    },
  })
  expect(user.find()).toBe('custom')
})
it('should copy statics', async () => {
  const model = {}
  const user = resource({
    client: axios,
    statics: {
      model,
    },
  })
  expect(user.model).toBe(model)
})

it('should response from list action', async () => {
  mock.onGet('http://example.com/').reply(200, { foo: 'bar' })
  const user = resource({
    client: axios,
    config: { baseURL: 'http://example.com' },
  })
  const res = await user.$list()
  expect(res).toMatchObject({
    status: 200,
    data: {
      foo: 'bar',
    },
  })
})

it('should response from detail action', async () => {
  mock.onGet('http://example.com/user/15').reply(200, { foo: 'bar' })
  const user = resource({
    client: axios,
    config: { baseURL: 'http://example.com', url: '/user' },
  })
  const res = await user.$detail({ urlParams: { id: '15' } })
  expect(res).toMatchObject({
    status: 200,
    data: {
      foo: 'bar',
    },
  })
})

it('should response from find method', async () => {
  mock.onGet('http://example.com/user').reply(200, { foo: 'bar' })
  const user = resource({
    client: axios,
    config: { baseURL: 'http://example.com', url: '/user' },
  })
  const res = await user.find()
  expect(res).toMatchObject({
    foo: 'bar',
  })
})

it('should response from findOne method', async () => {
  mock.onGet('http://example.com/user/15').reply(200, { foo: 'bar' })
  const user = resource({
    client: axios,
    config: { baseURL: 'http://example.com', url: '/user' },
  })
  const res = await user.findOne(15)
  expect(res).toMatchObject({
    foo: 'bar',
  })
})

it('should response from remove one method', async () => {
  mock.onDelete('http://example.com/user/15').reply(200, { ok: true })
  const user = resource({
    client: axios,
    config: { baseURL: 'http://example.com', url: '/user' },
  })
  const res = await user.remove(15)
  expect(res).toMatchObject({
    ok: true,
  })
})
