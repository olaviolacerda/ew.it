const assert = require('assert')
const PasswordHelper = require('./../src/helpers/passwordHelper')
const SENHA = 'Olavio@123456'
const HASH = '$2b$04$IsFdsRtH2CPs/QFFFCVye.uQK7iF24UV1OqMe7sqDvKUmXi0VnZRm'

describe('UserHelper test suite', function () {
  it('Deve gerar um hash a partir de uma senha', async () => {
    const result = await PasswordHelper.hashPassword(SENHA)

    assert.ok(result.length > 10)
  })

  it('Deve comparar uma senha usando seu hash', async () => {
    const result = await PasswordHelper.comparePassword(SENHA, HASH)

    assert.ok(result)
  })
})