// npm i --save-dev mocha
const assert = require('assert')
const Postgres = require('./../db/strategies/postgres/postgres')
const Context = require('./../db/strategies/base/contextStrategy')
const HeroiSchema = require('./../db/strategies/postgres/schemas/heroiSchema')
const MOCK_HEROI_CADASTRAR = {
  nome: 'Gavião Negro',
  poder: 'Agilidade'
}
const MOCK_HEROI_ATUALIZAR = {
  nome: 'Batman',
  poder: 'Dinheiro'
}

let context = {}

describe('Postgres Strategy', function () {
  this.timeout(Infinity)

  this.beforeAll(async function () {
    const connection = await Postgres.connect()
    const model = await Postgres.defineModel(connection, HeroiSchema)
    context = new Context(new Postgres(connection, model))
    await context.delete()
    await context.create(MOCK_HEROI_ATUALIZAR)
  })

  it('PostgresSQL Connection', async function () {
    const result = await context.isConnected()
    assert.equal(result, true)
  })

  it('Cadastrar', async function () {
    const result = await context.create(MOCK_HEROI_CADASTRAR)
    delete result.id
    assert.deepEqual(result, MOCK_HEROI_CADASTRAR)
  })

  it('Listar', async function () {
    const [result] = await context.read({
      nome: MOCK_HEROI_CADASTRAR.nome
    })
    //pegar a primeira posição
    // const posicaoZero = result[0]
    // const [posicao1, posicao2,..] = ['esse é o 1', 'esse é o 2']

    delete result.id
    assert.deepEqual(result, MOCK_HEROI_CADASTRAR)
  })

  it('Atualizar', async function () {
    const [itemAtualizar] = await context.read({
      nome: MOCK_HEROI_ATUALIZAR.nome
    })

    const novoItem = {
      ...MOCK_HEROI_ATUALIZAR,
      nome: 'Mulher Maravilha'
    }

    const [result] = await context.update(itemAtualizar.id, novoItem)
    const [itemAtualizado] = await context.read({
      id: itemAtualizar.id
    })
    assert.deepEqual(result, 1)
    assert.deepEqual(itemAtualizado.nome, novoItem.nome)

    /* 
    No JS temos uma ténica chamada rest/spread que é o método usado para mergear objetos
    ou separá-los
    heroi = {
      nome: 'Batman',
      poder: 'Dinheiro'
    }

    data = {
      dataNascimento: '1950-01-01'
    }

    //final

    final = {...heroi, ...data}
    final 
    {
      nome: 'Batman',
      poder: 'Dinheiro',
      dataNascimento: '1950-01-01'
    }

    */
  })

  it('Remover', async function () {
    const [item] = await context.read({})
    const result = await context.delete(item.id)

    assert.deepEqual(result, 1)
  })

})