# axios-schema-resource

Simple resource layer over [axios](https://github.com/axios/axios) client with a few helpers. Valid for browser and node (6+).

**Only works for axios version 0.18.1 [more info](https://github.com/axios/axios/pull/2006)**

##### Basic usage example

```js
const axios = require('axios')
const resource = require('axios-schema-resource')
// import resource from 'axios-schema-resource'
// import axios from 'axios'

const User = resource({
  client: axios,
  config: {
    baseURL: 'https://myapi.com',
    url: '/user',
  },
  actions: {
    current: {
      url: '/profile',
    },
    export: {
      url: '/export',
      responseType: 'blob',
    },
  },
  methods: {
    async getCurrentUserId() {
      const res = await this.$current()
      return res.data.id
    },
    async getCSV() {
      const res = await this.$export()
      return res.data //blob
    },
  },
})

const userId = await User.getCurrentUserId()
FileSaver.saveAs(await User.getCSV(), 'users.csv')
```

## Actions

Actions are the definitions for API endpoints. Only accepts and [axios request config](https://github.com/axios/axios#request-config) as first argument, and returns an [axios response schema](https://github.com/axios/axios#response-schema).

Actions are accesible as methods prefixed with a `$` in the returned object.

##### Action definition

```js
const User = resource({
  config:{ url: '/user', }
  // ...
  actions: {
    enable: {
      // axios request config, plus:

      // Prepends this path to url
      prependUrl: '/v1/admin',

      // Appends this path to url
      appendUrl: '/:userId/enable',

      // Interpolate :keys in url
      urlParams: {
        userId: 'anonymous',
      }
    },
  }
})

User.$enable()
// GET /v1/admin/user/anonymous/enable

User.$enable({ urlParams:{ userId:21 }})
// GET /v1/admin/user/21/enable
```

**Final request config** are the results of merging 5 request config, in order of precedence:

- Action method (`user.$enable(methodConfig)`)
- Action definition (`action: { enable: actionConfig }`)
- Resource definition (`resource({ config: resourceConfig })`)
- Default definition (`resource.withDefaults({ config: defaultConfig })`) _See [Defaults resource definition](#defaults-resource-definition)_
- Axios defaults (`axios.create(axiosConfig)`) _See [Change axios defaults](#change-axios-defaults)_

**Final url** is the result of `prependUrl + url + appendUrl`, and the interpolation of `urlParams` object. _See action definition example above_.

##### Default actions available

```js
const res = await User.$list() // GET
const res = await User.$create() // POST
const res = await User.$detail() // GET __/:id
const res = await User.$update() // PUT __/:id
const res = await User.$patch() // PATCH __/:id
const res = await User.$delete() // DELETE __/:id
```

## Methods

Methods are responsible for calling `actions`, accepting any arguments they need and handling the response as needed.

##### Methods definition

```js
const User = resource({
  // ...
  methods: {
    async findPaginated(query) {
      const res = await this.$list({ params: { query } })
      return res.data.items
    },
  },
})

const users = await User.findPaginated({ limit: 10, page: 4 })
```

##### Default methods available

```js
const users = await User.find()
// GET https://myapi.com/user

const user = await User.findOne(15)
// GET https://myapi.com/user/15

const user = await User.create(15, {
  name: 'foo1',
  roles: [1, 2],
})
// POST https://myapi.com/user
// {"name":"foo1","roles":[1,2]}

const user = await User.update(15, {
  name: 'foo2',
  roles: [3, 4],
})
// PUT https://myapi.com/user/15
// {"name":"foo2","roles":[3,4]}

const user = await User.patch(15, {
  name: 'foo3',
})
// PATCH https://myapi.com/user/15
// {"name":"foo3"}

await User.delete(15)
// DELETE https://myapi.com/user/15
```

## Change axios defaults

You can use [axios custom instance](https://github.com/axios/axios#custom-instance-defaults):

```js
const client = axios.create({
  baseURL: API_URL,
  timeout: 30000,
})
const User = resource({
  client,
  config: {
    // baseURL: API_URL // Is not needed anymore
  },
})
```

## Request and response interceptors (error handling)

You can use [axios interceptors](https://github.com/axios/axios#interceptors) as follows:

```js
const client = axios.create()

// Add a request interceptor
client.interceptors.request.use(
  function(config) {
    // Do something before request is sent
    return config
  },
  function(error) {
    // Do something with request error
    return Promise.reject(error)
  }
)

// Add a response interceptor
client.interceptors.response.use(
  function(response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response
  },
  function(error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error)
  }
)

const User = resource({
  client,
  // ...
})
```

## Defaults resource definition

You can override defaults resource definitions using `.withDefaults()` method like:

```js
const myResource = resource.withDefaults({
  client,
  config,
  actions,
  methods,
})

const user = myResource({
  config: { url: '/user' },
  // ...
})
```

#### Current resource defaults

This is the source code for the **defaults object** (as exposed above in methods and actions explanations). You can use this object as a **template** for creating your own defaults.

```js
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
    create(data, config = {}) {
      config.data = data
      return this.$create(config).then(res => res.data)
    },
    update(id, data, config = {}) {
      set(config, 'urlParams.id', id)
      config.data = data
      return this.$update(config).then(res => res.data)
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
```
