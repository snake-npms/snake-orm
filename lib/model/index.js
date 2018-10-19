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
			let underscoreName = this.name.toVarCase()
			return pluralize(underscoreName)
		}
		
		static get _snakeOrmProxy () {
			return SnakeOrm.getOrmProxyByDatabase(this.database)
		}
		
		static get _primaryKeys () {
			return this.getPrimaryKeys()
		}
		
		static get _primaryKey () {
      return this.getPrimaryKey()
		}
		
		static getPrimaryKeys () {
			return this._snakeOrmProxy.getPrimaryKeys(this.table)
		}
		
		static getPrimaryKey () {
			let keys = this.getPrimaryKeys()
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