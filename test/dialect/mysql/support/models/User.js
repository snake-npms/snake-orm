const { SnakeModel }  = require('../../../../../index')
class User extends SnakeModel {
	static get database () {
		return 'database_test'
	}
	
	// custom table name
	// static get table () {
	// 	return 'users'
	// }
	
	constructor (values) {
		super(...arguments)
	}
}
module.exports = User