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
				console.log(err)
			} else {
				this.dbDrive.configure('busyTimeout', 2000)
				console.log(`Sqlite3 db opened successfully`)
			}
		})
		this.tableInfo = {}
		this.ns = createNamespace(`snake-orm-auto-transaction-for-sqlite3:${connectOptions.database}`)
	}
	
	newDb () {
		return new Promise((resolve, reject) => {
			let db = new this.sqlite3.Database(this.connectOptions['storage'], function (err) {
				if (err) {
					reject(err)
				} else {
					db.configure('busyTimeout', 2000)
					resolve(db)
				}
			})
		})
	}
	
	log () {
		if (this.connectOptions.debug || this.connectOptions.logger) {
			console.log(...arguments)
		}
	}
	
	runSql (sql, ...args) {
		let that = this
		return new Promise((resolve, reject) => {
			let db = this.ns.get('transaction') || this.dbDrive
			this.log(sql, args, db !== this.dbDrive ? `transaction: ${this.ns.get('transaction-id')}` : '')
			try {
				if (/^(CREATE|INSERT|UPDATE)/i.test(sql)) {
					db.run(sql, args, function (err, result) {
						if (err) {
							if (err.code !== 'SQLITE_BUSY') {
								reject(err)
							}
							// SQLITE_BUSY 重新调用自身
							return that.runSql(sql, ...args)
						}
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
						if (err) {
							if (err.code !== 'SQLITE_BUSY') {
								reject(err)
							}
							// SQLITE_BUSY 重新调用自身
							return that.runSql(sql, ...args)
						}
						resolve(rows)
						console.log('rows', rows)
					})
				}
			} catch (err) {
				if (err.code !== 'SQLITE_BUSY') throw err;
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
	
	async withTransaction (cb) {
		return new Promise(async (resolve, reject) => {
			let db = this.ns.get('transaction')
			if (db) {
				try {
					await cb()
					resolve()
				} catch (err) {
					reject(err)
				}
			} else {
				db = await this.newDb()
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
							resolve(result)
						} catch (err) {
							this.log(`Rollback Transaction: ${transactionId}`)
							db.run("ROLLBACK;")
							reject(err)
						} finally {
							db.close()
						}
					})
				})
			}
		})
	}
}
module.exports = Sqlite3