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
		
    // this.beforeSave = ['testBeforeSave']
    // this.beforeCreate = ['testBeforeCreate']
    // this.afterCreate = ['testAfterCreate']
    // this.beforeUpdate = ['testBeforeUpdate']
    // this.afterUpdate = ['testAfterUpdate']
    // this.afterSave = ['testAfterSave']
	}
	
	constructor (values) {
		super(...arguments)
	}
  
  testBeforeSave () {
		console.log('==========================testBeforeSave')
  }
  testBeforeCreate () {
    console.log('==========================testBeforeCreate')
  }
  
  testAfterCreate () {
    console.log('==========================testAfterCreate')
  }
  testBeforeUpdate () {
    console.log('==========================testBeforeUpdate')
  }
  testAfterUpdate () {
    console.log('==========================testAfterUpdate')
  }
  testAfterSave () {
    console.log('==========================testAfterSave')
  }
}
module.exports = User