const { SnakeModel } = require('../../../../../index')
class Wallet extends SnakeModel {
	static get database () {
		return 'database_test.sqlite3'
	}
	
	// custom table name
	// static get table () {
	// 	return 'orders'
	// }
	
	static onRegister () {
		this.belongsTo('user')
	}
	
	constructor (values) {
		super(...arguments)
	}
}
module.exports = Wallet