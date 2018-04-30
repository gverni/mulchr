const { Client } = require('pg')
const debug = require('debug')('pg-mini-fs')
const debugSql = require('debug')('pg-mini-fs:sql')
const dbConnectionString = process.env.DATABASE_URL
const fsTable = 'fs'

function _connect () {
  var client = new Client({
    connectionString: dbConnectionString,
    ssl: true
  })
  debug('Connecting to DB...')
  return client.connect()
    .then(() => {
      debugSql('SELECT to_regclass(\'public.' + fsTable + '\');')
      return client.query('SELECT to_regclass(\'public.' + fsTable + '\');')
    })
    .then((res) => {
      if (!res.rows[0].to_regclass) {
        debug('_connect: Table ' + fsTable + ' not found. Creating ...')
        return client.query('CREATE TABLE ' + fsTable + ' (name varchar(1024), content text);')
          .then(() => Promise.resolve(client))
          .catch((error) => {
            debug('_connect: error creating table: ' + error)
            return Promise.reject(error)
          })
      } else {
        return Promise.resolve(client)
      }
    })
    .catch((error) => {
      debug('_connect: ' + error)
      return Promise.reject(error)
    })
}

function readFile (fileName) {
  debug('readFile: called ')
  return _connect()
    .then(client => {
      debugSql('SELECT * FROM ' + fsTable + ' WHERE name =\'' + fileName + '\';')
      return client.query('SELECT * FROM ' + fsTable + ' WHERE name =\'' + fileName + '\';')
    })
    .then(res => (res.rows.length === 1)
      ? Promise.resolve(res.rows[0].content)
      : Promise.reject(new Error('File not found'))
    )
    .catch((error) => {
      debug('readFile: ' + error)
      return Promise.reject(error)
    })
}

function writeFile (fileName, content) {
  var pgClient
  debug('writeFile: write to file ' + fileName)
  return _connect()
    .then((client) => {
      pgClient = client
      debugSql('SELECT * FROM ' + fsTable + ' WHERE name =\'' + fileName + '\';')
      return pgClient.query('SELECT * FROM ' + fsTable + ' WHERE name =\'' + fileName + '\';')
    })
    .then((res) => {
      let sqlQuery = ''
      debug(JSON.stringify(res))
      if (res.rowsCount === 1) {
        debug('writeFile: File ' + fileName + ' found')
        sqlQuery = 'UPDATE ' + fsTable + ' SET content=\'' + content.replace(/'/g, "''") + '\' WHERE name=\'' + fileName + '\';'
      } else {
        sqlQuery = 'INSERT INTO ' + fsTable + ' (name, content) VALUES (\'' + fileName + '\', \'' + content.replace(/'/g, "''") + '\');'
      }
      debugSql(sqlQuery)
      return pgClient.query(sqlQuery)
        .then(() => Promise.resolve(fileName))
    })
    .catch((error) => {
      debug('writeFile: ' + error)
      return Promise.reject(error)
    })
}

function resetFs () {
  var client = new Client({
    connectionString: dbConnectionString,
    ssl: true
  })
  debug('Resetting db')
  return client.connect()
    .then(() => client.query('DROP TABLE fs;'))
    .then(() => { debug('DB reset!') })
    .catch((error) => { debug('Error restting DB: ' + error) })
}

module.exports = {
  readFile: readFile,
  writeFile: writeFile,
  resetFs: resetFs
}
