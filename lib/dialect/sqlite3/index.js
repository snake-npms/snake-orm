class Sqlite3 {
	constructor (connectOptions) {
		this.connectOptions = connectOptions
		const sqlite3 = require('sqlite3').verbose();
		this.dbDrive = new sqlite3.Database(connectOptions['database'] || ':memory:')
	}
	
	runSql (sql, ...args) {
		return new Promise((resolve, reject) => {
			if (/^CREATE|INSERT|UPDATE/i.test(sql)) {
				this.dbDrive.run(sql, args, function (err) {
					if (err) {
						reject(err)
					}
					resolve()
				})
			} else {
				this.dbDrive.all(sql, args, function (err, rows) {
					if (err) {
						reject(err)
					}
					resolve(rows)
				})
			}
		})
	}
}
module.exports = Sqlite3