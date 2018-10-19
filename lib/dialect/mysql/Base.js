const SnakeNamespace = require('snake-namespace')
class Base {
	constructor (connectOptions) {
		this.connectOptions = Object.assign({user: connectOptions.username}, connectOptions)
		const mysql = require('mysql2')
		// filter connect options
		this.dbDrive = mysql.createPool(this.connectOptions.reject(['username', 'dialect', 'logger', 'autoMigrate'])).promise()
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
		} else if (/^[UPDATE|DELETE]/.test(sql)) {
			return result[0] && result[0].affectedRows
		} else {
			return result[0]
		}
	}
  
  async pragmaTableInfo (tableName) {
    this.tableInfo[tableName] = this.tableInfo[tableName] || {}
    return await this.runSql(`desc \`${tableName}\``).then(result => {
      let primaryKeys = []
      let defaultSchema = {}
      result.forEach(item => {
        if (/PRI/gi.test(item['Key'])) {
          primaryKeys.push(item['Field'])
        }
        defaultSchema[item['Field']] = item['Default']
      })
      this.tableInfo[tableName]['primaryKeys'] = primaryKeys
      this.tableInfo[tableName]['defaultSchema'] = defaultSchema
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
					this.log(`--- Begin Transaction: ${transactionId} ---`)
					await conn.beginTransaction()
					let result = await cb()
					this.log(`--- Commit Transaction: ${transactionId} ---`)
					await conn.commit()
					resolve(result)
				} catch (err) {
					this.log(`--- Rollback Transaction: ${transactionId} ---`)
					conn.rollback()
					reject(err)
				} finally {
					conn.release()
				}
			})
		})
	}
}
module.exports = Base