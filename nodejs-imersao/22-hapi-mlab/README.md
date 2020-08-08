docker run \
    --name postgress \
    -e POSTGRES_USER=olaviolacerda \
    -e POSTGRES_PASSWORD=123456 \
    -e POSTGRES_DB=heroes \
    -p 3000:5432 \
    -d \
    postgres

docker ps

docker exec -it postgress /bin/bash 
## entrar no container

docker run \
    --name adminer \
    -p 8080:8080 \
    --link postgres:postgress \
    -d \
    adminer

## ---- mongodb 
sudo docker run \
    --name mongodb \
    -p 27017:27017 \
    -e MONGO_INITDB_ROOT_USERNAME=admin \
    -e MONGO_INITDB_ROOT_PASSWORD=123456 \
    -d \
    mongo:4 

sudo docker run \
    --name clientmongo \
    -p 3010:3000 \
    --link mongodb:mongodb \
    -d \
    mongoclient/mongoclient


sudo docker exec -it mongodb \
    mongo --host localhost -u admin -p 123456 --authenticationDatabase admin \
    --eval "db.getSiblingDB('herois').createUser({user: 'olaviolacerda', pwd: '123456', roles: [{role: 'readWrite', db: 'herois'}]})"

docker rm -f $(docker ps -a -q)