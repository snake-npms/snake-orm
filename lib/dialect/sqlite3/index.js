const SnakeNamespace = require('snake-namespace')
class Sqlite3 {
	constructor (connectOptions) {
		connectOptions['storage'] = connectOptions['storage'] || connectOptions['database'] || ':memory:'
		this.connectOptions = connectOptions
		try {
			this.sqlite3 = require('sqlite3')
		} catch (err) {
			if (err.code === 'MODULE_NOT_FOUND') {
				throw new Error('Please install sqlite3 package manually')
			}
			throw err;
		}
		if (connectOptions.debug) {
			console.warn(`Sqlite3 will run in Debug Mode.`)
			this.sqlite3 = this.sqlite3.verbose()
		}
		this.dbDrive = new this.sqlite3.Database(connectOptions['storage'], (err) => {
			if (err) {
				throw err
			} else {
				// this.dbDrive.configure('busyTimeout', 2000)
				this.dbDrive.isLeisure = true
				console.log(`Sqlite3 db opened successfully`)
			}
		})
		this.tableInfo = {}
	}
	
	async runInSingleDbInstance (cb, finishSetLeisure = false) {
		
		if (this.dbDrive.isLeisure || SnakeNamespace.get('transaction')) {
			this.dbDrive.isLeisure = false
			let result = null
			try {
				result = await cb(this.dbDrive)
				if (finishSetLeisure) {
					this.dbDrive.isLeisure = true
				}
				return result
			} catch (err) {
				if (finishSetLeisure) {
					this.dbDrive.isLeisure = true
				}
				throw err
			}
		} else {
			await Promise.sleep()
			return await this.runInSingleDbInstance(cb, finishSetLeisure)
		}
	}
	
	
	log () {
		if (this.connectOptions.debug || this.connectOptions.logger) {
			let dbTransationId = SnakeNamespace.get('transaction-id')
			if (dbTransationId) {
				console.log(...arguments, 'transaction: ', dbTransationId)
			} else {
				console.log(...arguments)
			}
		}
	}
	
	async runSql (sql, ...args) {
		return await this.runInSingleDbInstance((db) => {
			return new Promise(async (resolve, reject) => {
				this.log(sql, args)
				db.serialize(async () => {
					if (/^(CREATE|INSERT|UPDATE)/i.test(sql)) {
						db.run(sql, args, function (err, result) {
							if (err) { reject(err) }
							if (/^INSERT/i.test(sql)) {
								// return insert row id
								result = this['lastID']
							} else if (/^UPDATE/i.test(sql)) {
								// return insert row id
								result = this['changes']
							}
							resolve(result)
						})
					} else {
						db.all(sql, args, function (err, rows) {
							if (err) { reject(err) }
							resolve(rows)
						})
					}
				})
			}).then(result => {
				return result
			})
		}, !SnakeNamespace.get('transaction'))
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
		})
	}
	
	async withTransaction (cb) {
		if (SnakeNamespace.get('transaction')) {
			return await cb()
		}
		return await this.runInSingleDbInstance((db) => {
			return new Promise(async (resolve, reject) => {
				db.serialize(async () => {
					return await SnakeNamespace.run(async () => {
						SnakeNamespace.set('transaction', db)
						let transactionId = Date.now().toString(36) + Math.random().toString(36)
						SnakeNamespace.set('transaction-id', transactionId)
						this.log(`Begin Transaction`)
						db.run("BEGIN;")
						try {
							let result = await cb()
							this.log(`Commit Transaction`)
							db.run("COMMIT;")
							resolve(result)
						} catch (err) {
							this.log(`Rollback Transaction`)
							db.run("ROLLBACK;")
							reject(err)
						}
					})
				})
			})
		}, true)
	}
}
module.exports = Sqlite3