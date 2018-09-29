class Sqlite3 {
	constructor (connectOptions) {
		this.connectOptions = connectOptions
		let sqlite3 = require('sqlite3');
		if (connectOptions.debug) {
			console.warn(`Sqlite3 will run in Debug Mode.`)
		 	sqlite3 = sqlite3.verbose()
		}
		this.dbDrive = new sqlite3.Database(connectOptions['database'] || ':memory:', function (err) {
			if (err) {
				console.log(err)
			} else {
				console.log(`Sqlite3 db opened successfully`)
			}
		})
	}
	
	runSql (sql, ...args) {
		if (this.connectOptions.debug || this.connectOptions.logger) {
			console.log(sql, args)
		}
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
	
	async getPrimaryKeys (tableName) {
		return await this.runSql(`PRAGMA table_info('${tableName}')`).then(result => {
			let keys = []
			result.forEach(item => {
				if (item['pk']) {
					keys.push(item['name'])
				}
			})
			return keys
		}).catch(err => {
			console.log(err)
		})
	}
}
module.exports = Sqlite3