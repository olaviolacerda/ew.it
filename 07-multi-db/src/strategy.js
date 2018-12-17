class NotImplementedException extends Error {
  constructor() {
    super("Not Implemented Excepetion")
  }
}


class MongoDB extends ICrud {
  constructor() {
    super()
  }

  create(item) {
    console.log('O item foi salvo em MongoDB')
  }
}

class Postgres extends ICrud {
  constructor() {
    super()
  }

  create(item) {
    console.log('O item foi salvo em Postgres')
  }
}


const contextMongo = new ContextStrategy(new MongoDB())
contextMongo.create()