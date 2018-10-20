const MethodAssociation = require('./MethodAssociation')
var pluralize = require('pluralize')
let createdModel = null
module.exports = function (SnakeOrm) {
	if (createdModel) {
		return createdModel
	}
	class Model extends MethodAssociation {
    static get _snakeOrmProxy () {
      return SnakeOrm.getOrmProxyByDatabase(this.database)
    }
    
		static get database () {
			return SnakeOrm.getOrmProxyByDatabase().connectOptions.database
		}
		
		static get table () {
			let underscoreName = this.name.toUnderscore()
			return pluralize(underscoreName)
		}
  
		static get _schema () {
      return this._snakeOrmProxy.getSchema(this.table) || {}
		}
		
    static get _defaultValues () {
      return Object.assign({}, this._snakeOrmProxy.getDefaultValues(this.table))
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