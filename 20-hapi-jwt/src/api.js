// npm i hapi
// npm i vision inert hapi-swagger
// npm i hapi-auth-jwt2
const Hapi = require('hapi')
const MongoDB = require('./db/strategies/mongodb/mongodb')
const Context = require('./db/strategies/base/contextStrategy')
const HeroiSchema = require('./db/strategies/mongodb/schemas/heroisSchema')
const HeroRoutes = require('./routes/heroRoutes')
const AuthRoutes = require('./routes/authRoutes')
const HapiJwt = require('hapi-auth-jwt2')

const JWT_SECRET = 'MEU_SEGREDO_01'

const HapiSwagger = require('hapi-swagger')
const Vision = require('vision')
const Inert = require('inert')

const app = new Hapi.server({
    port: 5000
})

function mapRoutes(instance, methods) {
    return methods.map(method => instance[method]())
}

async function main() {
    const connection = MongoDB.connect()
    const context = new Context(new MongoDB(connection, HeroiSchema))

    const swaggerOptions = {
        info: {
            title: 'API Herois - #CursoNodeBR',
            version: 'v1.0'
        },
        lang: 'pt'
    }

    await app.register([
        HapiJwt,
        Vision,
        Inert, {
            plugin: HapiSwagger,
            options: swaggerOptions
        }
    ])

    app.auth.strategy('jwt', 'jwt', {
        key: JWT_SECRET,
        // options: {
        //     expiresIn: 20
        // },
        validate: (dado, request) => {
            //verifica no banco se o usuário continua ativo
            //verifica no banco se o usuário continua pagando

            return {
                isValid: true //caso não valido, false
            }
        }
    })

    app.auth.default('jwt')

    app.route([
        ...mapRoutes(new HeroRoutes(context), HeroRoutes.methods()),
        ...mapRoutes(new AuthRoutes(JWT_SECRET), AuthRoutes.methods())
    ])

    await app.start()
    console.log('Server running at', app.info.port)

    return app
}

module.exports = main()