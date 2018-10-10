const { SnakeModel } = require('../../../../../index')
class OrderItem extends SnakeModel {
	static get database () {
		return 'database_test'
	}
	
	// custom table name
	// static get table () {
	// 	return 'order_items'
	// }
	
	static onRegister () {
		this.belongsTo('order')
	}
	
	constructor (values) {
		super(...arguments)
	}
}
module.exports = OrderItem