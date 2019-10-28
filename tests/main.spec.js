const resource = require('../src')
const axios = require('axios')

it('should work', async () => {
  const user = resource({
    client: axios,
    config: { baseURL: 'http://example.com' },
  })
  await user.find()
})
