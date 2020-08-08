// npm i hapi
// npm i vision inert hapi-swagger
// npm i hapi-auth-jwt2
// npm i bcrypt
// npm i dotenv
// npm i -g cross-env
const { config } = require('dotenv')
const { join } = require('path') //node
const { ok } = require('assert')

const env = process.env.NODE_ENV || "dev"

ok(env == "prod" || env == "dev", "A env é inválida, ou dev ou prod")

const configPath = join(__dirname, './config', `.env.${env}`)

config({
    path: configPath
})

console.log(configPath)

const Hapi = require('hapi')
const MongoDB = require('./src/db/strategies/mongodb/mongodb')
const Context = require('./src/db/strategies/base/contextStrategy')
const HeroiSchema = require('./src/db/strategies/mongodb/schemas/heroisSchema')
const HeroRoutes = require('./src/routes/heroRoutes')
const AuthRoutes = require('./src/routes/authRoutes')
const HapiJwt = require('hapi-auth-jwt2')

const JWT_SECRET = process.env.JWT_KEY

const Postgres = require('./src/db/strategies/postgres/postgres')
const UsuarioSchema = require('./src/db/strategies/postgres/schemas/usuarioSchema')

const HapiSwagger = require('hapi-swagger')
const Vision = require('vision')
const Inert = require('inert')

const app = new Hapi.server({
    port: process.env.PORT
})

function mapRoutes(instance, methods) {
    return methods.map(method => instance[method]())
}

async function main() {
    const connection = MongoDB.connect()
    const context = new Context(new MongoDB(connection, HeroiSchema))

    const connectionPostgres = await Postgres.connect()
    const model = await Postgres.defineModel(connectionPostgres, UsuarioSchema)
    const contextPostgres = new Context(new Postgres(connectionPostgres, model))

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
        validate: async (dado, request) => {
            //verifica no banco se o usuário continua ativo
            //verifica no banco se o usuário continua pagando
            const [result] = await contextPostgres.read({
                username: dado.username.toLowerCase()
            })

            if (!result) {
                return {
                    isValid: false
                }
            }

            return {
                isValid: true //caso não valido, false
            }
        }
    })

    app.auth.default('jwt')

    app.route([
        ...mapRoutes(new HeroRoutes(context), HeroRoutes.methods()),
        ...mapRoutes(new AuthRoutes(JWT_SECRET, contextPostgres), AuthRoutes.methods())
    ])

    await app.start()
    console.log('Server running at', app.info.port)

    return app
}

module.exports = main()