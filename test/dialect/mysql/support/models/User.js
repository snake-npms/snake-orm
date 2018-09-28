const SnakeModel = require('../../../../../lib/model/index')
class User extends SnakeModel {
	static get database () {
		return 'database_test'
	}
	static get table () {
		return 'users'
	}
	
	constructor (values) {
		super(...arguments)
	}
}
module.exports = User