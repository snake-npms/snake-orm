const SnakeModel = require('../../lib/model')
class User extends SnakeModel {
	static get database () {
		return 'main'
	}
	static get name () {
		return 'users'
	}
	
	constructor () {
		super(...arguments)
	}
}
module.exports = User