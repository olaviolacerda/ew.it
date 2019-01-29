const ICrud = require('./../interfaces/interfaceCrud')
const Mongoose = require('mongoose')
const STATUS = {
  0: 'Desconectado',
  1: 'Conectado',
  2: 'Conectando',
  3: 'Descontando'
}

class MongoDB extends ICrud {
  constructor(connection, schema) {
    super()
    this._connection = connection
    this._schema = schema
  }

  static connect() {
    Mongoose.connect('mongodb://olaviolacerda:123456@localhost:27017/herois', {
      useNewUrlParser: true
    }, function (error) {
      if (!error) return;

      console.log('Falha na conexão!', error)
    })

    const connection = Mongoose.connection

    connection.once('open', () => console.log('Database rodando!!!'))
    return connection
  }

  async isConnected() {
    const state = STATUS[this._connection.readyState]
    if (state === 'Conetado' || state !== 'Conectando') return state;

    await new Promise(resolve => setTimeout(resolve, 1000))

    return STATUS[this._connection.readyState]
  }

  create(item) {
    return this._schema.create(item)
  }

  read(item, skip = 0, limit = 10) {
    return this._schema.find(item).skip(skip).limit(limit)
  }

  update(id, item) {
    return this._schema.updateOne({
      _id: id
    }, {
      $set: item
    })
  }

  delete(id) {
    return this._schema.deleteOne({
      _id: id
    })
  }
}

module.exports = MongoDB