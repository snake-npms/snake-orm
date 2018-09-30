let BridgeReflection = require('./BridgeReflection')
let SqlFormat = require('./Reflection/SqlFormatter')
class Action extends BridgeReflection {
	constructor () {
		super(...arguments)
	}
	
	async save () {
		if (this.validate()) {
			try {
				if (this._options.isNewRecord) {
					let idValue = await this.constructor._snakeOrmProxy.runSql(SqlFormat.createModelSql(this))
					this.id = idValue
				} else {
					await this.constructor._snakeOrmProxy.runSql(SqlFormat.updateModelSql(this, await this.constructor.getPrimaryKeys()))
				}
				this.__cleanChangedAttributes()
				return true
			} catch (err) {
				console.log(err)
			}
		}
		return false
	}
}
module.exports = Action