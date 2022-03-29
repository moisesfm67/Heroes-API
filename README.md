# Heroes API

## About
#####  Project developed during the course of Professor Erick Wendel, a specialist in JavaScript.

##### The project's main focus is the creation of a heroes api using Hapi to perform requests and to perform requests with

##### facility, API documentation was created using swagger, using the JWT pattern, it is necessary to login to generate a token and use this token to authenticate other requests.

- ###### [API Documentation](https://cursonodebr-moises.herokuapp.com/documentation)

##### In this project, only javascript was used as a programming language, following the TDD methods, using mocha to perform the tests, and the Strategy pattern to work with multiple databases, namely mongodb and postgres.



- To put the tests into production, istanbul was used.
- [Mongoose](https://mongoosejs.com/) was used to manipulate mongodb and [Sequelize](https://sequelize.org/) was used for Postgres.
- In the development environment, [docker](https://www.docker.com/) was used to create and use postgres and mongodb.
- In the production environment,[MongoDB Atlas](https://www.mongodb.com/) was used for mongodb and [Heroku](https://www.heroku.com) for Postgres.
- To put the project into production, [Heroku](https://www.heroku.com) was used.

## Running the project in the development environment

after cloning the project, let's make the following settings

### Postgres

##### Before running the following commands, make sure you have docker installed

if you don't have docker, you can follow this [tutorial](https://www.youtube.com/watch?v=5nX8U8Fz5S0)

#### Create of heroes database in postgres
```bash
docker run --name postgres -e POSTGRES_USER=root -e POSTGRES_PASSWORD=123321 -e POSTGRES_DB=heroes -p 5432:5432 -d postgres
```

#### create the postgres administrator
```bash
docker run --name adminer -p8080:8080 --link postgres:postgres -d adminer
```
After created if you want to have a dashboard for postgres just access [adminer](http://localhost:8080/) and put the following settings

System = PostgreSQL

server = postgres

user = root

password = 123321

database = heroes

### Mongodb

#### Create a mongodb image and a username and password for that image
```bash
docker run --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=senhaadmin -d mongo:4
```
#### Create an administrator for mongodb
```bash
docker run --name mongoclient -p 3000:3000 --link mongodb:mongodb -d mongoclient/mongoclient
```

after created if you want to have a dashboard for mongodb just access  [mongo-cliente](http://localhost:3000/) and put the following steps

Connection Name: mongodb

#### in the connection tab

Host = mongodb

Port = 27017

database name = admin

#### in the authentication tab

authentication type = Scram-Sha-1

username = admin

password = passwordadmin

authenticationdb = admin

this connection is for your admin user

#### Create a user with access only to the heroes database

Replace <-ANY-USER-> with a name of your choice and <-ANY-PASSWORD-> with a password of your choice, this will be the username and password for your local mongodb connection

```bash
docker exec -it mongodb mongo --host localhost -u admin -p senhaadmin -authenticationDatabase admin --eval "db.getSiblingDB('heroes').createUser({user:'<-ANY-USER->', pwd: '<-ANY-PASSWORD->', roles: [{role: 'readWrite', db: 'heroes'}]})"
```

Go back to [mongo-cliente](http://localhost:3000/) and make a new connection following the same steps as before but changing the following settings

Connection Name: mongodb-readWrite

#### in the connection tab

Host = mongodb

Port = 27017

database name = heroes

#### in the authentication tab

authentication type = Scram-Sha-1

username = username that was replaced in <-ANY-USER->

password = password that was replaced in <-ANY-PASSWORD->

authenticationdb = heroes

this connection is for your user with access only to the heroes database

### Environment variables

before we continue, with the project open create a file with the name of ".env.dev" in the root of the project that will have the following content

replace <-USER-> and <-PASSWORD-> with the data that was used to create the user with access only to the heroes database

```
JWT_SECRET=SECRET
PORT=5000
SALT_PWD=3
MONGO_DB_URL=mongodb://<-USER->:<-PASSWORD->@localhost:27017/heroes
POSTGRES_URL=postgres://root:123321@localhost/heroes
```

#### Install dependencies

```bash
npm install
```

#### Run the tests
```bash
npm run test
```

have to pass a total of 24 tests

#### Running the project
```bash
npm run dev
```

with the project running, just access the [API documentation](localhost:5000/documentation)

First, login with the username "John" and password "Moises@123"

the login will generate a token and with this token you can perform the other requests.
