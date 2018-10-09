const { SnakeModel }  = require('../../../../../index')
class User extends SnakeModel {
	static get database () {
		return 'database_test'
	}
	
	// custom table name
	// static get table () {
	// 	return 'users'
	// }
	
	static onRegister () {
		this.hasOne('wallet')
		this.hasMany('orders')
		this.hasMany('orderItems', {through: 'orders'})
	}
	
	constructor (values) {
		super(...arguments)
	}
}
module.exports = User