class Mysql {
	constructor (connectOptions) {
		this.connectOptions = Object.assign({user: connectOptions.username}, connectOptions)
		delete this.connectOptions.username
		delete this.connectOptions.dialect
		console.log(this.connectOptions)
		const mysql = require('mysql2')
		this.dbDrive = mysql.createPool(this.connectOptions).promise()
	}
	
	async runSql (sql, ...args) {
		if (this.connectOptions.debug || this.connectOptions.logger) {
			console.log(sql, args)
		}
		let result = await this.dbDrive.query(sql, args)
		return result[0]
	}
	
	async getPrimaryKeys (tableName) {
		return await this.runSql(`SELECT column_name FROM information_schema.key_column_usage WHERE constraint_name = 'PRIMARY' AND table_schema = '${this.connectOptions.database}' AND table_name = '${tableName}' ORDER BY ordinal_position`).then(result => {
			let keys = []
			result.forEach(item => {
				keys.push(...Object.values(item))
			})
			return keys
		}).catch(err => {
			console.log(err)
		})
	}
}
module.exports = Mysql