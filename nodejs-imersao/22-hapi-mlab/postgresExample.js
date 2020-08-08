// npm install sequelize pg-hstore pg pg-native
const Sequelize = require('sequelize')
const driver = new Sequelize(
  'herois',
  'postgres',
  '123456', {
    host: 'localhost',
    dialect: 'postgres',
    quoteIdentifiers: false,
    operatorAliases: false
  }
)

async function main() {
  const Herois = driver.define('herois', {
    id: {
      type: Sequelize.INTEGER,
      required: true,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: Sequelize.STRING,
      required: true,
    },
    poder: {
      type: Sequelize.STRING,
      required: true,
    }
  }, {
    tableName: 'TB_HEROIS',
    freezeTableName: false,
    timestamps: false
  })
  await Herois.sync()
  await Herois.create({
    nome: 'Lanterna Verde',
    poder: 'Anel'
  })
  const result = await Herois.findAll({
    raw: true,
    attributes: ['nome', 'poder']
  })

  console.log('result', result)
}

main()