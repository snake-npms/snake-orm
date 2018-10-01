const Action = require('./Action')
var pluralize = require('pluralize')
let createdModel = null
module.exports = function (SnakeOrm) {
	if (createdModel) {
		return createdModel
	}
	class Model extends Action {
		static get database () {
			return SnakeOrm.getOrmProxyByDatabase().connectOptions.database
		}
		
		static get table () {
			let underscoreName = this.name.toUnderscore()
			return pluralize(underscoreName)
		}
		
		static get _snakeOrmProxy () {
			return SnakeOrm.getOrmProxyByDatabase(this.database)
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
	createdModel = Model
	return createdModel
}