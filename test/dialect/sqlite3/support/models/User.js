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
		this.hasMany('orderItems', {through: 'orders'})
    this.hasMany('friendShips')
    this.hasMany('friends', {through: 'friendShips', className: 'User', foreignKey: 'friendId'})
	}
	
	constructor (values) {
		super(...arguments)
	}
}
module.exports = User