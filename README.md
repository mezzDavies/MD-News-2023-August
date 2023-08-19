# Northcoders News API

## Install Instructions

After cloning this repo to your local machine you will need to:

- create two .env files at repo root level: _.env.test_ and _.env.development._ Into each, add `PGDATABASE=` followed by the correct database name for that environment e.g. `PGDATABASE=correct_database_name` (see /db/setup.sql for the database names).

  These files will allow you to connect to the two databases locally. (More info to follow.)

- Now run `npm i` to install the repo dependencies
