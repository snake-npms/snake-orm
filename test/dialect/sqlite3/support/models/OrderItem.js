const { SnakeModel } = require('../../../../../index')
class OrderItem extends SnakeModel {
	static get database () {
		return 'database_test.sqlite3'
	}
	
	// custom table name
	// static get table () {
	// 	return 'orders'
	// }
	
	static onRegister () {
		this.belongsTo('order')
	}
	
	constructor (values) {
		super(...arguments)
	}
}
module.exports = OrderItem