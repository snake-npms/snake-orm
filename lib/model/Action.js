let BridgeReflection = require('./BridgeReflection')
let SqlFormat = require('./Reflection/SqlFormatter')
class Action extends BridgeReflection {
	
	static async withTransaction (cb) {
		return await this._snakeOrmProxy.withTransaction(cb)
	}
	
	constructor () {
		super(...arguments)
	}
	
	async update (object, blockAfn) {
		for (let key in object) {
			this[key] = object[key]
		}
		if (blockAfn) {
			await blockAfn(this)
		}
		return this.save()
	}
	
	async save () {
		if (this.validate()) {
			try {
				await this.constructor._snakeOrmProxy.withTransaction(async () => {
					if (this._options.isNewRecord) {
						let idValue = await this.constructor._snakeOrmProxy.runSql(SqlFormat.createModelSql(this))
						this.id = idValue
					} else {
						await this.constructor._snakeOrmProxy.runSql(SqlFormat.updateModelSql(this, await this.constructor.getPrimaryKeys()))
					}
					this.__cleanChangedAttributes()
				})
				return true
			} catch (err) {
				console.log(err)
			}
		}
		return false
	}
}
module.exports = Action