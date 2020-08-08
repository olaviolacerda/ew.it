const assert = require('assert')
const api = require('../api')
let app = {}
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imdham8iLCJpZCI6MSwiaWF0IjoxNTQ4Nzc1MDA2fQ.14VSJcTg9fi3GnUUyJEJKZXp5agJUQ515rGFB3BdvVY'

describe('Auth test suite', function () {
    this.beforeAll(async () => {
        app = await api
    })

    it('Deve obter um token', async () => {
        const result = await app.inject({
            method: 'POST',
            url: '/login',
            payload: {
                username: 'gajo',
                password: '123'
            }
        })

        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        assert.deepEqual(statusCode, 200)
        assert.ok(dados.token.length > 30)
    })
})
