const assert = require('assert')
const api = require('./../api')
let app = {}
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imdham8iLCJpZCI6MSwiaWF0IjoxNTQ4Nzc1MDA2fQ.14VSJcTg9fi3GnUUyJEJKZXp5agJUQ515rGFB3BdvVY'

const headers = {
    Authorization: TOKEN
}
const MOCK_HEROI_CADASTRAR = {
    nome: 'Chapolin Colorado',
    poder: 'Marreta Biônica'
}

const MOCK_HEROI_INICIAL = {
    nome: 'Pantera Negra',
    poder: 'Agilidade'
}
let MOCK_ID = ''

describe('Suide de testes da API Herois', function () {
    this.beforeAll(async () => {
        app = await api
        const result = await app.inject({
            method: 'POST',
            url: '/herois',
            headers,
            payload: MOCK_HEROI_INICIAL
        })
        const dados = JSON.parse(result.payload)
        MOCK_ID = dados._id
    })

    it('Listar /herois', async () => {
        //simular request
        const result = await app.inject({
            method: 'GET',
            headers,
            url: '/herois?skip=0&limit=10'
        })
        const dados = JSON.parse(result.payload)
        const statusCode = result.statusCode

        assert.deepEqual(statusCode, 200)
        assert.ok(Array.isArray(dados))
    })

    it('Listar /herois - deve retornar somente 3 registros', async () => {
        const TAMANHO_LIMITE = 3
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/herois?skip=0&limit=${TAMANHO_LIMITE}`
        })
        const dados = JSON.parse(result.payload)
        const statusCode = result.statusCode
        assert.deepEqual(statusCode, 200)
        assert.ok(Array.isArray(dados))
        assert.ok(dados.length === TAMANHO_LIMITE)
    })

    it('Listar /herois - deve retornar um erro com limit incorreto', async () => {
        const TAMANHO_LIMITE = 'AEEE'
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/herois?skip=0&limit=${TAMANHO_LIMITE}`
        })


        const erroResult = {
            "statusCode": 400,
            "error": "Bad Request",
            "message": "child \"limit\" fails because [\"limit\" must be a number]",
            "validation": {
                "source": "query",
                "keys": ["limit"]
            }
        }

        assert.deepEqual(result.statusCode, 400)
        assert.deepEqual(result.payload, JSON.stringify(erroResult))
    })

    it('Listar GET - /herois - deve filtrar um item pelo nome', async () => {
        const NAME = MOCK_HEROI_INICIAL.nome
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/herois?skip=0&limit=1000&nome=${NAME}`
        })
        const dados = JSON.parse(result.payload)
        const statusCode = result.statusCode
        assert.deepEqual(statusCode, 200)
        assert.ok(dados[0].nome === NAME)
    })

    it('Cadastrar POST - /herois', async () => {

        const result = await app.inject({
            method: 'POST',
            url: `/herois`,
            headers,
            payload: JSON.stringify(MOCK_HEROI_CADASTRAR)
        })

        const statusCode = result.statusCode
        const {
            message,
            _id
        } = JSON.parse(result.payload)

        assert.deepEqual(message, 'Heroi cadastrado com sucesso')
        assert.notStrictEqual(_id, undefined)
        assert.ok(statusCode === 200)

    })

    it('Atualizar PATCH - /herois/:id', async () => {
        const _id = MOCK_ID

        const expected = {
            poder: 'Super Agilidade'
        }

        const result = await app.inject({
            method: 'PATCH',
            url: `/herois/${_id}`,
            headers,
            payload: JSON.stringify(expected)
        })

        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        assert.ok(statusCode === 200)
        assert.deepEqual(dados.message, 'Heroi atualizado com sucesso')
    })

    it('Atualizar PATCH - /herois/:id - não deve atualizar com id incorreto', async () => {
        const _id = `5c4fa1e9c5f0e9f02eb3743a`

        const result = await app.inject({
            method: 'PATCH',
            url: `/herois/${_id}`,
            headers,
            payload: JSON.stringify({
                poder: 'Super Agilidade'
            })
        })

        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)
        const expected = {
            statusCode: 412,
            error: 'Precondition Failed',
            message: 'Id não encontrado no banco'
        }
        assert.ok(statusCode === 412)
        assert.deepEqual(dados, expected)
    })

    it('Remover DELETE - /herois/:id - deve deletar um item', async () => {
        const _id = MOCK_ID

        const result = await app.inject({
            method: 'DELETE',
            headers,
            url: `/herois/${_id}`
        })

        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        assert.ok(statusCode === 200)
        assert.deepEqual(dados.message, 'Heroi removido com sucesso')
    })

    it('Remover DELETE - /herois/:id - não deve deletar um item', async () => {
        const _id = `5c4fa1e9c5f0e9f02eb3743a`

        const result = await app.inject({
            method: 'DELETE',
            headers,
            url: `/herois/${_id}`
        })

        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        const expected = {
            statusCode: 412,
            error: 'Precondition Failed',
            message: 'Id não encontrado no banco'
        }

        assert.ok(statusCode === 412)
        assert.deepEqual(dados, expected)
    })

    it('Remover DELETE - /herois/:id - não deve deletar um item com id inválido', async () => {
        const _id = `ID_INVALIDO`

        const result = await app.inject({
            method: 'DELETE',
            headers,
            url: `/herois/${_id}`
        })

        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        const expected = {
            statusCode: 500,
            error: 'Internal Server Error',
            message: 'An internal server error occurred'
        }

        assert.ok(statusCode === 500)
        assert.deepEqual(dados, expected)
    })
})