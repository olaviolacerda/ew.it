/*
  0 - Obter um usuário
  1 - Obter o número de telefone de um usuário a partir de seu Id
  2 - Obter o endereço do usuário pelo Id
*/

function obterUsuario(callback) {
  setTimeout(function() {
    return callback(null, {
      id: 1,
      nome: 'Aladin',
      dataNascimento: new Date()
    });
  }, 1000);
}

function obterTelefone(idUsuario, callback) {
  setTimeout(function() {
    return callback(null, {
      telefone: '110055334',
      ddd: '11'
    });
  }, 2000);
}

function obterEndereco(idUsuario, callback) {
  setTimeout(function() {
    return callback(null, {
      rua: 'dos Bobos',
      numero: '0'
    });
  }, 2000);
}

obterUsuario(function resolverUsuario(erro, usuario) {
  if (erro) {
    console.error('Deu ruim com o usuário');
    return;
  }
  obterTelefone(usuario.id, function resolverTelefone(erro1, telefone) {
    if (erro) {
      console.error('Deu ruim com o telefone');
      return;
    }
    obterEndereco(usuario.id, function resolverEndereo(erro2, endereco) {
      if (erro) {
        console.error('Deu ruim com o endereço');
        return;
      }

      console.log(`Nome: ${usuario.nome}, 
      Endereço: ${endereco.rua}, ${endereco.numero},
      Telefone: (${telefone.ddd}) ${telefone.telefone}`);
    });
  });
});
