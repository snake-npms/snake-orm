const SnakeNamespace = require('snake-namespace')
class Mysql {
	constructor (connectOptions) {
		this.connectOptions = Object.assign({user: connectOptions.username}, connectOptions)
		delete this.connectOptions.username
		delete this.connectOptions.dialect
		console.log(this.connectOptions)
		const mysql = require('mysql2')
		this.dbDrive = mysql.createPool(this.connectOptions).promise()
		this.tableInfo = {}
	}
	
	log () {
		if (this.connectOptions.debug || this.connectOptions.logger) {
			console.log(...arguments)
		}
	}
	
	async runSql (sql, ...args) {
		let db = SnakeNamespace.get('transaction') || this.dbDrive
		this.log(sql, args, db !== this.dbDrive ? `transaction: ${SnakeNamespace.get('transaction-id')}` : '')
		let result = await db.query(sql, args)
		if (/^INSERT/.test(sql)) {
			// return insert row id
			return result[0] && result[0].insertId
		} else if (/^UPDATE/.test(sql)) {
			return result[0] && result[0].affectedRows
		} else {
			return result[0]
		}
	}
	
	// cache table primaryKey, second in direct return
	async getPrimaryKeys (tableName) {
		if (this.tableInfo['tableName'] && this.tableInfo['tableName']['primaryKeys']) {
			return this.tableInfo['tableName']['primaryKeys']
		}
		this.tableInfo['tableName'] = {}
		return await this.runSql(`SELECT column_name FROM information_schema.key_column_usage WHERE constraint_name = 'PRIMARY' AND table_schema = '${this.connectOptions.database}' AND table_name = '${tableName}' ORDER BY ordinal_position`).then(result => {
			let keys = []
			result.forEach(item => {
				keys.push(...Object.values(item))
			})
			this.tableInfo['tableName']['primaryKeys'] = keys
			return keys
		}).catch(err => {
			console.log(err)
		})
	}
	
	async withTransaction (cb) {
		if (SnakeNamespace.get('transaction')) {
			return await cb()
		}
		return await SnakeNamespace.run(async () => {
			const conn = await this.dbDrive.getConnection()
			SnakeNamespace.set('transaction', conn)
			let transactionId = Date.now().toString(36) + Math.random().toString(36)
			SnakeNamespace.set('transaction-id', transactionId)
			return new Promise(async (resolve, reject) => {
				try {
					this.log(`Begin Transaction: ${transactionId}`)
					await conn.beginTransaction()
					let result = await cb()
					this.log(`Commit Transaction: ${transactionId}`)
					await conn.commit()
					resolve(result)
				} catch (err) {
					this.log(`Rollback Transaction: ${transactionId}`)
					conn.rollback()
					reject(err)
				} finally {
					conn.release()
				}
			})
		})
	}
}
module.exports = Mysql