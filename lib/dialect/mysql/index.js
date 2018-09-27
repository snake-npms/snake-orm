class Mysql {
	constructor (connectOptions) {
		this.connectOptions = Object.assign({user: connectOptions.username}, connectOptions)
		delete this.connectOptions.username
		delete this.connectOptions.dialect
		console.log(this.connectOptions)
		const mysql = require('mysql2')
		this.dbDrive = mysql.createPool(this.connectOptions).promise()
	}
	
	async runSql (sql, args) {
		return await this.dbDrive.query(sql, args)
	}
}
module.exports = Mysql