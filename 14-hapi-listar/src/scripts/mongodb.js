// docker ps
// sudo docker exec -it 62d6395327a4 mongo -u olaviolacerda -p 123456 --authenticationDatabase herois

//databases
show dbs

//mudando o contexto para uma db
use herois

//mostrar tables (coleções)
show collections

db.herois.insert({
  nome: 'Flash',
  poder: 'Velocidade',
  dataNascimento: '1970-09-01'
})

db.herois.find().pretty()

for (let i = 0; i <= 100000; i++) {
  db.herois.insert({
    nome: `Clone-${i}`,
    poder: 'Velocidade',
    dataNascimento: '1970-09-01'
  })
}

db.herois.count()
db.herois.findOne()
db.herois.find().limit(1000).sort({
  nome: -1
})
db.herois.find({}, {
  poder: 1,
  _id: 0
})

//create
db.herois.insert({
  nome: 'Hulk',
  poder: 'Força',
  dataNascimento: '1970-09-01'
})

//read
db.herois.find()

//update
db.herois.find({
  name: 'Flash'
})

//atualiza o nome e deleta o resto 
db.herois.update({
  _id: ObjectId("5c4e75bd348262430475d77f")
}, {
    nome: 'Mulher Maravilha'
  })


// atualiza somente o NOME e mantem as demais 
db.herois.update({
  _id: ObjectId("5c4e76303482624304775e12")
}, {
    $set: {
      nome: 'Lanterna Verde'
    }
  })

// atualiza somente um
db.herois.update({
  poder: 'Velocidade'
}, {
    $set: {
      poder: 'Super força'
    }
  })

//delete
//deleta a base
db.herois.remove({})

//deleta um
db.herois.remove({
  name: 'Mulher Maravilha'
})