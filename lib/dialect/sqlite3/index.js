const createNamespace = require('cls-hooked').createNamespace
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
		this.ns = createNamespace(`snake-orm-auto-transaction-for-sqlite3:${connectOptions.database}`)
	}
	
	async newDb () {
		if (this.dbDrive.isLeisure) {
			this.dbDrive.isLeisure = false
			return this.dbDrive
		} else {
			await Promise.prototype.wait()
			return this.newDb()
		}
	}
	
	log () {
		if (this.connectOptions.debug || this.connectOptions.logger) {
			let dbTransationId = this.ns.get('transaction-id')
			if (dbTransationId) {
				console.log(...arguments, 'transaction: ', dbTransationId)
			} else {
				console.log(...arguments)
			}
		}
	}
	
	async runSql (sql, ...args) {
		let that = this
		let dbTransaction = this.ns.get('transaction')
		let db = dbTransaction || await this.newDb()
		this.log(sql, args)
		return new Promise(async (resolve, reject) => {
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
			if (!dbTransaction) {
				db.isLeisure = true
			}
			return result
		}).catch(err => {
			if (!dbTransaction) {
				db.isLeisure = true
			}
			throw err
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
		})
	}
	
	async withTransaction (cb) {
		if (this.ns.get('transaction')) {
			return await cb()
		}
		let db = await this.newDb()
		return new Promise(async (resolve, reject) => {
			this.ns.run(() => {
				this.ns.set('transaction', db)
				let transactionId = Date.now().toString(36) + Math.random().toString(36)
				this.ns.set('transaction-id', transactionId)
				return db.serialize(async () => {
					this.log(`Begin Transaction: ${transactionId}`)
					db.run("BEGIN;")
					try {
						let result = await cb()
						this.log(`Commit Transaction: ${transactionId}`)
						db.run("COMMIT;")
						this.dbDrive.isLeisure = true
						resolve(result)
					} catch (err) {
						this.log(`Rollback Transaction: ${transactionId}`)
						db.run("ROLLBACK;")
						this.dbDrive.isLeisure = true
						reject(err)
					}
				})
			})
		})
	}
}
module.exports = Sqlite3