const MethodAssociation = require('./MethodAssociation')
var pluralize = require('pluralize')
let createdModel = null
module.exports = function (SnakeOrm) {
	if (createdModel) {
		return createdModel
	}
	class Model extends MethodAssociation {
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
			let keys =  await this._snakeOrmProxy.getPrimaryKeys(this.table)
			keys.forEach(key => {
				if (this._primaryKeys.indexOf(key) === -1) {
					this._primaryKeys.push(key)
				}
			})
			return keys
		}
		
		static async getPrimaryKey () {
			let keys = await this.getPrimaryKeys()
			if (keys.indexOf('id') !== -1) {
				return 'id'
			}
			return keys.length && keys[0] || undefined
		}
		
		constructor () {
			super(...arguments)
		}
	}
	createdModel = Model
	return createdModel
}