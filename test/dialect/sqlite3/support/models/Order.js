const { SnakeModel } = require('../../../../../index')
class Order extends SnakeModel {
	static get database () {
		return 'database_test.sqlite3'
	}
	
	// custom table name
	// static get table () {
	// 	return 'orders'
	// }
	
	constructor (values) {
		super(...arguments)
	}
}
module.exports = Order