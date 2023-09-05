# Northcoders MD News API

## What's this all about?

This is a node backend CRUD API that serves and recieves data in a Reddit-style format. It was written using TDD and utilises Jest, Supertest, node-postgres, Express.js along with other packages.

(Full disclosure - this is a redo of a project done as part of my time as a student on the Northcoders Software Developer Bootcamp. I decided to redo it as an exercise in consolidating the course content (I am now a Junior Software Devoper and Mentor for Northcoders) and as the previous version needed rehosting and reworking anyway)

## Install Instructions

After cloning this repo to your local machine you will need to:

- create two .env files at repo root level: _.env.test_ and _.env.development._ Into each, add `PGDATABASE=` followed by the correct database name for that environment e.g. `PGDATABASE=correct_database_name` (see /db/setup.sql for the database names).

  These files will allow you to connect to the two databases locally. (More info to follow.)

- Now run `npm i` to install the repo dependencies.

## Create the databases on your local machine

- `npm run setup-dbs` - this creates two DBs locally.

- Assuming no errors you can seed these DBs using the seeding function and data provided (see the db directory). Use this command - `npm run seed` .

## Run the tests!

You can now run the tests - `npm t` - to see the tests used in the creation of the server. Look at all them lovely green ticks! ✅

(The app test suite connects to the (correct) _test DB_ through the use of the logic in the connection.js file and utilising the appropriate .env.test file.)
