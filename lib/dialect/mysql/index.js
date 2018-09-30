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
	
	async runSql (sql, ...args) {
		if (this.connectOptions.debug || this.connectOptions.logger) {
			console.log(sql, args)
		}
		let result = await this.dbDrive.query(sql, args)
		if (/^INSERT/.test(sql)) {
			// return insert row id
			if (result[0] && result[0].insertId) {
				return result[0] && result[0].insertId
			}
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
}
module.exports = Mysql