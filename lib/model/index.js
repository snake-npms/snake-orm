const SnakeOrm = require('../snake-orm')
const Action = require('./Action')
class Model extends Action {
	static get database () {
		return SnakeOrm.sharedSnakeOrmProxy().connectOptions.database
	}
	
	static get table () {
	}
	
	static get _snakeOrmProxy () {
		return SnakeOrm.sharedSnakeOrmProxy(this.database)
	}
	
	static async getPrimaryKeys () {
		return this._snakeOrmProxy.getPrimaryKeys(this.table)
	}
	
	static async getPrimaryKey () {
		let keys = await this.getPrimaryKeys()
		return keys.length && keys[0] || undefined
	}
	
	constructor () {
		super(...arguments)
	}
}
module.exports = Model