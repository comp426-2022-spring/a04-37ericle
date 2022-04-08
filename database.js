const database = require('better-sqlite3')

const logdb = new database('log.db')

const stat = logdb.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='accesslog'`)
let row = stat.get()
if (row === undefined) {
    console.log('Log database appears to be empty. Creating log database...')
    const sqlInit = `
        CREATE TABLE accesslog ( 
            id INTEGER PRIMARY KEY, 
            remoteaddr VARCHAR, 
            remoteuser VARCHAR, 
            datetime VARCHAR, 
            method VARCHAR, 
            url VARCHAR, 
            protocol VARCHAR, 
            httpversion NUMERIC, 
            secure INTEGER, 
            status INTEGER, 
            referer VARCHAR, 
            useragent VARCHAR
            )`
    logdb.exec(sqlInit)
} else {
    console.log('Log database exists')
}

module.exports = logdb