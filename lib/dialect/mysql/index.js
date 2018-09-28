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
}
module.exports = Mysql