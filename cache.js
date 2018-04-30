var jsonfile = require('jsonfile')
const { Client } = require('pg')

function loadCache () {
  if (process.env.DATABASE_URL) {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true
    })
  
    client.connect()
    client.query('SELECT * FROM saks;')
      .then((res) => {
        console.log('PG: returned rows from saks')
        if (res.rows.length === 0) {
          // Table empty
          console.log('PG: Empty table')
          app.locals.cachedb = {}
        } else {
          for (let row of res.rows) {
            console.log(JSON.stringify(row))
            app.locals.cachedb = row.cachedb
          }
        }
        client.end()
      })
      .catch((error) => {
        console.log('PG: error reading DB ' + error)
        if (error.toString() === 'error: relation "saks" does not exist') {
          client.query('CREATE TABLE saks (cachedb json);')
            .then(() => {
              console.log('PG: created table saks')
              return client.query('INSERT INTO saks (cachedb) VALUES (\'{}\');')
            })
            .then(() => {
              console.log('PG: added empty row for cache')
              app.locals.cachedb = {}
              client.end()
            })
            .catch((error) => {
              console.log('PG: Error in creating TABLE: ' + error)
              client.end()
            })
        }
      })
  } else {
    try {
      return jsonfile.readFileSync('cachedb.json')
    } catch (error) {
      console.log('Error opening cachedb: ' + error)
      return {}
      app.locals.updateCache()
    }
  }
}

function saveCache (cacheObj) {
  console.log('Saving cache...')

  if (process.env.DATABASE_URL) {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true
    })
    console.log('PG: update cache')
    client.connect()
    console.log('PG: Emptying table')
    client.query('DELETE FROM saks')
      .then(() => {
        let sql = 'INSERT INTO saks (cachedb) VALUES (\'' + JSON.stringify(app.locals.cachedb).replace(/'/g, "''") + '\')'
        console.log(sql)
        return client.query(sql)
      })
      .then(() => { client.end() })
      .catch((error) => {
        console.log('PG: Error updating cache: ' + error)
        client.end()
      })
  } else {
    try {
      jsonfile.writeFileSync('cachedb.json', cacheObj)
    } catch (error) {
      console.log('Error writing file ' + error)
    }
  }
}

if (process.env.DATABASE_URL) {
  // using postrgres database (heroku)
  app.locals.updateCache = function () {
  }


} else {
  // local json file

}
