class NotImplementedException extends Error {
  constructor() {
    super("Not Implemented Excepetion")
  }
}

class ICrud {
  create(item) {
    throw new NotImplementedException()
  }

  read(item) {
    throw new NotImplementedException()
  }

  update(id, item) {
    throw new NotImplementedException()
  }

  delete(id) {
    throw new NotImplementedException()
  }

  isConnected() {
    throw new NotImplementedException()
  }
}

module.exports = ICrud