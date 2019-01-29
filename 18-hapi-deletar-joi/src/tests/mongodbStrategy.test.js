// npm i --save-dev mochconnecta
const assert = require('assert')
const MongoDB = require('./../db/strategies/mongodb/mongodb')
const Context = require('./../db/strategies/base/contextStrategy')
const HeroiSchema = require('./../db/strategies/mongodb/schemas/heroisSchema')
const MOCK_HEROI_CADASTRAR = {
  nome: 'Mulher Maravilha',
  poder: 'Super força'
}

const MOCK_HEROI_DEFAULT = {
  nome: `Super Choque ${Date.now()}`,
  poder: 'Choque'
}

const MOCK_HEROI_ATUALIZAR = {
  nome: 'Homem-Aranha',
  poder: 'Super Teia'
}

let MOCK_HEROI_ID = ''

let context = {}


describe('MongoDB Strategy', function () {

  this.beforeAll(async () => {
    const connection = MongoDB.connect()
    context = new Context(new MongoDB(connection, HeroiSchema))
    await context.create(MOCK_HEROI_DEFAULT)
    const result = await context.create(MOCK_HEROI_ATUALIZAR)
    MOCK_HEROI_ID = result._id
  })

  it('MongoDB Connection', async () => {
    const result = await context.isConnected()
    const expected = 'Conectado'

    assert.deepEqual(result, expected)
  })

  it('Cadastrar', async () => {
    const {
      nome,
      poder
    } = await context.create(MOCK_HEROI_CADASTRAR)
    assert.deepEqual({
      nome,
      poder
    }, MOCK_HEROI_CADASTRAR)
  })

  it('Listar', async () => {
    const [{
      nome,
      poder
    }] = await context.read({
      nome: MOCK_HEROI_DEFAULT.nome
    })
    const result = {
      nome,
      poder
    }
    assert.deepEqual(result, MOCK_HEROI_DEFAULT)
  })

  it('Atualizar', async () => {

    const result = await context.update(MOCK_HEROI_ID, {
      nome: 'Homem de Ferro'
    })

    assert.deepEqual(result.nModified, 1)
  })

  it('Deletar', async () => {
    const result = await context.delete(MOCK_HEROI_ID)

    assert.deepEqual(result.n, 1)
  })


})