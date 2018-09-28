const SnakeModel = require('../../../../../lib/model/index')
class User extends SnakeModel {
	static get database () {
		return 'database_test.sqlite3'
	}
	static get table () {
		return 'users'
	}
	
	constructor (values) {
		super(...arguments)
	}
}
module.exports = User