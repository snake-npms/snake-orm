let BridgeReflection = require('./BridgeReflection')
let SqlFormat = require('./Reflection/SqlFormatter')
class Method extends BridgeReflection {
	
	static async withTransaction (cb) {
		return await this._snakeOrmProxy.withTransaction(cb)
	}
	
	constructor () {
		super(...arguments)
	}
	
	async update (object, blockAfn) {
    Object.keys(object).forEach((key) => {
      this.set(key, object[key])
    })
		if (blockAfn) {
			await blockAfn(this)
		}
		return this.save()
	}
	
	async save () {
		if (this.validate()) {
			try {
				await this.constructor._snakeOrmProxy.withTransaction(async () => {
          await this.__onBeforeSave()
					if (this._options.isNewRecord) {
            await this.__onBeforeCreate()
						if (Object.keys(this._changedAttributes).length) {
              let [sql, args] = await SqlFormat.generateCreateModelSql(this, this._changedAttributes)
							this.set('id', await this.constructor._snakeOrmProxy.runSql(sql, ...args))
						}
            await this.__onAfterCreate()
					} else {
            await this.__onBeforeUpdate()
						if (Object.keys(this._changedAttributes).length) {
              let [sql, args] = await SqlFormat.generateUpdateModelSql(this, this._changedAttributes)
							await this.constructor._snakeOrmProxy.runSql(sql, ...args)
						}
            await this.__onAfterUpdate()
					}
          await this.__onAfterSave()
					this.__resetDefaultRecord()
				})
				return true
			} catch (err) {
				console.log(err)
			}
		}
		return false
	}
	
	async destroy () {
		let primaryKeys = this.constructor.getPrimaryKeys()
		let where = this._record
		if (primaryKeys.length) {
			where = {}
      primaryKeys.forEach(key => {
				where[key] = this[key]
			})
		}
		let result = await this.constructor.where(where).destroyAll()
		if (result) {
			this.id = undefined
		}
		return result
	}

	async increment (field, by = 1) {
		this[field] = this[field] + by
		
		let value = `COALESCE(\`${field}\`, 0)`
		let [updateSql, args] = await SqlFormat.generateUpdateModelSql(this, {[field]: `${value} ${by >= 0 ? `+ ${by}` : `- ${-by}`}`})
		return await this.constructor._snakeOrmProxy.runSql(updateSql, ...args)
	}
	
	async decrement (field, by = 1) {
		return this.increment(field, -by)
	}
}
module.exports = Method