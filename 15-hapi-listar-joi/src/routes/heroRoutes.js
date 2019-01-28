const BaseRoute = require('./base/baseRoute')

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
                }
            },
            handler: (request, headers) => {
                try {
                    const { skip, limit, nome } = request.query
                    let query = {}
                    if (nome) {
                        query.nome = nome
                    }

                    if (isNaN(skip))
                        throw Error('O tipo do skip é incorreto')

                    if (isNaN(limit))
                        throw Error('O tipo do limit é incorreto')



                    return this.db.read(query, Number(skip), Number(limit))
                } catch (error) {
                    console.log('DEU RUIM', error)
                    return "Erro interno no servidor"
                }
            }
        }
    }

}

module.exports = HeroRoutes