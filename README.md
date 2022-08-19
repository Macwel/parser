## Running the app

First run docker

```bash
# database startup and initialization
$ yarn db:up

# startup app
$ yarn start
```
If an error occurs during the initialization of the database, it is necessary to restart the initialization of the database. This error occurs because mysql does not have time to start, and prismaORM is already performing migrations
