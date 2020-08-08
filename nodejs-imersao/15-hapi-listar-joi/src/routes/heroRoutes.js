const BaseRoute = require('./base/baseRoute')
const Joi = require('joi')
class HeroRoutes extends BaseRoute {
    constructor(db) {
        super()
        this.db = db
    }

    list() {
        return {
            path: '/herois',
            method: 'GET',
            config: {
                validate: {
                    //payload -> body
                    //headers -> header
                    //params -> na URL :id
                    //query -> ?skip=0&limit=10
                    failAction: (request, headers, error) => {
                        throw error
                    },
                    query: {
                        skip: Joi.number().integer().default(0),
                        limit: Joi.number().integer().default(10),
                        nome: Joi.string().min(3).max(30)
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
                    console.log('DEU RUIM', error)
                    return "Erro interno no servidor"
                }
            }
        }
    }

}

module.exports = HeroRoutes