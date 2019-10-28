const resource = require('../src')
const axios = require('axios')

it('should work', () => {
  const user = resource({
    client: axios,
    config:{baseURL:'http://example.com'}})
  user.find()
})
