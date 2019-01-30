// npm i hapi

const Hapi = require('hapi')
const MongoDB = require('./src/db/strategies/mongodb/mongodb')
const Context = require('./src/db/strategies/base/contextStrategy')
const HeroiSchema = require('./src/db/strategies/mongodb/schemas/heroisSchema')

const app = new Hapi.server({
    port: 5000
})

async function main() {
    const connection = MongoDB.connect()
    const context = new Context(new MongoDB(connection, HeroiSchema))

    app.route([{
        path: '/herois',
        method: 'GET',
        handler: (request, headers) => {
            return context.read()
        }
    }])

    await app.start()
    console.log('Server running at', app.info.port)
}

main()