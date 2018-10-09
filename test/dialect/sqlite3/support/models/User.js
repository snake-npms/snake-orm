const { SnakeModel } = require('../../../../../index')
class User extends SnakeModel {
	static get database () {
		return 'database_test.sqlite3'
	}
	
	// custom table name
	// static get table () {
	// 	return 'users'
	// }
	
	static onRegister () {
		this.hasOne('wallet')
		this.hasMany('orders')
	}
	
	constructor (values) {
		super(...arguments)
	}
}
module.exports = User