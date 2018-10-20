const createNamespace = require('cls-hooked').createNamespace
class Mysql {
	constructor (connectOptions) {
		this.connectOptions = Object.assign({user: connectOptions.username}, connectOptions)
		const mysql = require('mysql2')
		// filter connect options
		this.dbDrive = mysql.createPool(this.connectOptions.reject(['username', 'dialect', 'logger', 'autoMigrate'])).promise()
		this.tableInfo = {}
		this.ns = createNamespace(`snake-orm-auto-transaction-for-mysql:${connectOptions.database}`)
	}
	
	log () {
		if (this.connectOptions.debug || this.connectOptions.logger) {
			console.log(...arguments)
		}
	}
	
	async runSql (sql, ...args) {
		let db = this.ns.get('transaction') || this.dbDrive
		this.log(sql, args, db !== this.dbDrive ? `transaction: ${this.ns.get('transaction-id')}` : '')
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
      let defaultValues = {}
      let schema = {}
      result.forEach(item => {
        if (/PRI/gi.test(item['Key'])) {
          primaryKeys.push(item['Field'])
        }
        defaultValues[item['Field']] = item['Default']
        schema[item['Field']] = {
        	type: item['Type'],
	        null: item['Null'] === 'NO' ? false : true,
	        isPk: /PRI/gi.test(item['Key']) ? true : false,
	        default: item['Default'],
          _key: item['Key'],
	        _extra: item['Extra']
	      }
      })
      this.tableInfo[tableName]['primaryKeys'] = primaryKeys
      this.tableInfo[tableName]['defaultValues'] = defaultValues
      this.tableInfo[tableName]['schema'] = Object.freeze(schema || {})
    })
  }
	
	async withTransaction (cb) {
		if (this.ns.get('transaction')) {
			return await cb()
		}
		return new Promise(async (resolve, reject) => {
			this.ns.run(async () => {
				const conn = await this.dbDrive.getConnection()
				this.ns.set('transaction', conn)
				let transactionId = Date.now().toString(36) + Math.random().toString(36)
				this.ns.set('transaction-id', transactionId)
				try {
					this.log(`--- Begin Transaction ---: ${transactionId}`)
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
module.exports = Mysql