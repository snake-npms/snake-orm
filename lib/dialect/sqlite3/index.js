class Sqlite3 {
	constructor (connectOptions) {
		this.connectOptions = connectOptions
		const sqlite3 = require('sqlite3').verbose();
		this.dbDrive = new sqlite3.Database(connectOptions['database'] || ':memory:')
	}
}
module.exports = Sqlite3