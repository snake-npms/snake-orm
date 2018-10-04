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
						if (Object.keys(this._changedAttributes).length) {
							this.id = await this.constructor._snakeOrmProxy.runSql(await SqlFormat.generateCreateModelSql(this, this._changedAttributes))
						}
					} else {
						if (Object.keys(this._changedAttributes).length) {
							await this.constructor._snakeOrmProxy.runSql(await SqlFormat.generateUpdateModelSql(this, this._changedAttributes))
						}
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

	async increment (field, by = 1) {
		this[field] = this[field] + by
		
		let value = `COALESCE(\`${field}\`, 0)`
		let updateSql = await SqlFormat.generateUpdateModelSql(this, {[field]: `${value} ${by >= 0 ? `+ ${by}` : `- ${-by}`}`})
		return await this.constructor._snakeOrmProxy.runSql(updateSql)
	}
	
	async decrement (field, by = 1) {
		return this.increment(field, -by)
	}
}
module.exports = Action