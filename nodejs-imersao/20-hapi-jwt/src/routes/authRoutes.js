// npm i jsonwebtoken
const BaseRoute = require('./base/baseRoute')
const Joi = require('joi')
const Boom = require('boom') //better errors
const Jwt = require('jsonwebtoken')
const failAction = (request, headers, error) => {
    throw error
}
const USER = {
    username: 'gajo',
    password: '123'
}

class AuthRoutes extends BaseRoute {
    constructor(secret) {
        super()
        this.secret = secret
    }

    login() {
        return {
            path: '/login',
            method: 'POST',
            config: {
                auth: false,
                tags: ['api'],
                description: 'Obter token',
                notes: 'Faz login com user e senha do banco',
                validate: {
                    payload: {
                        username: Joi.string().required(),
                        password: Joi.string().required()
                    },
                    failAction
                }
            },
            handler: async request => {
                try {
                    const {
                        username,
                        password
                    } = request.payload;

                    if (username.toLowerCase() !== USER.username || password !== USER.password) {
                        return Boom.unauthorized()
                    }

                    const token = Jwt.sign({
                        username,
                        id: 1
                    }, this.secret)

                    return {
                        token
                    }

                } catch (error) {
                    console.log('Deu Ruim', error)
                    return Boom.internal()
                }
            }
        }
    }
}

module.exports = AuthRoutes