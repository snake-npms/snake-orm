const { SnakeModel } = require('../../../../../index')
class Order extends SnakeModel {
	static get database () {
		return 'database_test'
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
module.exports = Order