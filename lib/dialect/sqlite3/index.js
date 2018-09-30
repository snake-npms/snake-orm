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
		this.tableInfo = {}
	}
	
	runSql (sql, ...args) {
		let that = this
		return new Promise((resolve, reject) => {
			if (/^CREATE|INSERT|UPDATE/i.test(sql)) {
				this.dbDrive.run(sql, args, function (err, result) {
					if (that.connectOptions.debug || that.connectOptions.logger) {
						console.log(JSON.stringify(this))
					}
					if (err) {
						reject(err)
					}
					if (/^INSERT/.test(sql)) {
						// return insert row id
						result = this['lastID']
					}
					resolve(result)
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
	
	// cache table primaryKey, second in direct return
	async getPrimaryKeys (tableName) {
		if (this.tableInfo['tableName'] && this.tableInfo['tableName']['primaryKeys']) {
			return this.tableInfo['tableName']['primaryKeys']
		}
		this.tableInfo['tableName'] = {}
		return await this.runSql(`PRAGMA table_info('${tableName}')`).then(result => {
			let keys = []
			result.forEach(item => {
				if (item['pk']) {
					keys.push(item['name'])
				}
			})
			this.tableInfo['tableName']['primaryKeys'] = keys
			return keys
		}).catch(err => {
			console.log(err)
		})
	}
}
module.exports = Sqlite3