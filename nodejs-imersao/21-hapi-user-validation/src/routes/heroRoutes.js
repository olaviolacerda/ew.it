const BaseRoute = require('./base/baseRoute')
const Joi = require('joi')
const Boom = require('boom') //better errors
const failAction = (request, headers, error) => {
    throw error
}

const headers = Joi.object({
    authorization: Joi.string().required()
}).unknown()

class HeroRoutes extends BaseRoute {
    constructor(db) {
        super()
        this.db = db
    }

    create() {
        return {
            path: '/herois',
            method: 'POST',
            config: {
                tags: ['api'],
                description: 'Deve criar um novo herói',
                notes: 'Deve cadastrar herói por nome e poder',
                validate: {
                    failAction,
                    headers,
                    payload: {
                        nome: Joi.string().required().min(3).max(50),
                        poder: Joi.string().required().min(2).max(30)
                    }
                }
            },
            handler: async request => {
                try {
                    const {
                        nome,
                        poder
                    } = request.payload
                    const result = await this.db.create({
                        nome,
                        poder
                    })
                    return {
                        message: 'Heroi cadastrado com sucesso',
                        _id: result._id
                    }
                } catch (error) {
                    console.log('Deu Ruim', error)
                    return Boom.internal()
                }
            }
        }
    }


    update() {
        return {
            path: '/herois/{id}',
            method: 'PATCH',
            config: {
                tags: ['api'],
                description: 'Deve atualizar um novo herói por id',
                notes: 'Deve atualizar qualquer campo',
                validate: {
                    params: {
                        id: Joi.string().required(),
                    },
                    failAction,
                    headers,
                    payload: {
                        nome: Joi.string().min(3).max(50),
                        poder: Joi.string().min(2).max(30)
                    }
                }
            },
            handler: async request => {
                try {
                    const {
                        id
                    } = request.params;

                    const {
                        payload
                    } = request

                    const dadosString = JSON.stringify(payload)
                    const dados = JSON.parse(dadosString)
                    const result = await this.db.update(id, dados)
                    if (result.nModified !== 1) return Boom.preconditionFailed('Id não encontrado no banco')
                    return {
                        message: 'Heroi atualizado com sucesso'
                    }
                } catch (error) {
                    console.log('Deu Ruim', error)
                    return Boom.internal()
                }
            }
        }
    }

    list() {
        return {
            path: '/herois',
            method: 'GET',
            config: {
                tags: ['api'],
                description: 'Deve listar heróis',
                notes: 'Pode paginar resultados e filtrar por nome',
                validate: {
                    //payload -> body
                    //headers -> header
                    //params -> na URL :id
                    //query -> ?skip=0&limit=10
                    failAction,
                    headers,
                    query: {
                        skip: Joi.number().integer().default(0),
                        limit: Joi.number().integer().default(10),
                        nome: Joi.string().min(3).max(50)
                    }
                }
            },
            handler: (request, headers) => {
                try {
                    const {
                        skip,
                        limit,
                        nome
                    } = request.query

                    let query = {
                        nome: {
                            $regex: `.*${nome}*.`
                        }
                    }


                    return this.db.read(nome ? query : {}, skip, limit)
                } catch (error) {
                    console.log('Deu Ruim', error)
                    return Boom.internal()
                }
            }
        }
    }

    delete() {
        return {
            path: '/herois/{id}',
            method: 'DELETE',
            config: {
                tags: ['api'],
                description: 'Deve remover um herói pelo id',
                notes: 'O id precisa ser válido',
                validate: {
                    params: {
                        id: Joi.string().required(),
                    },
                    failAction,
                    headers
                }
            },
            handler: async request => {
                try {
                    const {
                        id
                    } = request.params;


                    const result = await this.db.delete(id)

                    if (result.n !== 1) return Boom.preconditionFailed('Id não encontrado no banco')
                    return {
                        message: 'Heroi removido com sucesso'
                    }
                } catch (error) {
                    console.log('Deu Ruim', error)
                    return Boom.internal()
                }
            }
        }
    }
}

module.exports = HeroRoutes