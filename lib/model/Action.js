const pluralize = require('pluralize')
let BridgeReflection = require('./BridgeReflection')
let SqlFormat = require('./Reflection/SqlFormatter')
class Action extends BridgeReflection {
	
	static async withTransaction (cb) {
		return await this._snakeOrmProxy.withTransaction(cb)
	}
	
	// AfterRegisterToSnakeOrmInstance
	static async __beforeOnRegisterInit () {
		Object.defineProperties(this, {
			__association: {
				value: {},
				writable: false
			},
			_primaryKeys: {
				value: [],
				writable: false
			},
			_primaryKey: {
				get () {
					let keys = this._primaryKeys
					if (keys.indexOf('id') !== -1) {
						return 'id'
					}
					return keys.length && keys[0] || undefined
				}
			}
		})
		await this.getPrimaryKeys()
	}
	
	/**
	 * @param collection
	 * @param options
	 * @returns {*}
	 * @private
	 */
	static _handleBelongsOptions (collection, options) {
		return Object.assign({
			_mode: 'belongs',
			foreignKey: `${collection.toVarCase()}Id`,
			className: pluralize.singular(collection).toCapitalize(),
			as: collection
		}, options)
	}
	
	/**
	 * @param collection
	 * @param options
	 */
	static belongsTo (collection, options) {
		options = this._handleBelongsOptions(collection, options)
		let CollectionModel = this._snakeOrmProxy._Models[options.className]
		this.__association[collection] = options
		this.prototype[`get${collection.toCapitalize()}`] = function () {
			let primaryKey = CollectionModel._primaryKey
			return CollectionModel.findBy({[primaryKey]: this[options['foreignKey']]})
		}
	}
	/**
	 * @param collection
	 * @param options
	 * @returns {*}
	 * @private
	 */
	static _handleHasOptions (collection, options) {
		return Object.assign({
			_mode: 'has',
			foreignKey: `${this.name.toVarCase()}Id`,
			className: pluralize.singular(collection).toCapitalize(),
		}, options)
	}
	/**
	 * @param collection
	 * @param options
	 */
	static hasMany (collection, options) {
		options = this._handleHasOptions(collection, options)
		let CollectionModel = this._snakeOrmProxy._Models[options.className]
		this.__association[collection] = options
		this.prototype[`get${collection.toCapitalize()}`] = function () {
			let primaryKey = this.constructor._primaryKey
			if (options['through']) {
				let throughOptions = this.constructor.__association[options['through']]
				let throughCollectionModel = this.constructor._snakeOrmProxy._Models[throughOptions.className]
				return CollectionModel.joins(pluralize.singular(throughCollectionModel.table)).where(`\`${throughCollectionModel.table}\`.\`${throughOptions.foreignKey}\` = ?`, this[primaryKey])
			} else {
				return CollectionModel.where({[options.foreignKey]: this[primaryKey]})
			}
		}
	}
	/**
	 * @param collection
	 * @param options
	 */
	static hasOne (collection, options) {
		options = this._handleHasOptions(collection, options)
		let CollectionModel = this._snakeOrmProxy._Models[options.className]
		this.__association[collection] = options
		this.prototype[`get${collection.toCapitalize()}`] = function () {
			let primaryKey = this.constructor._primaryKey
			return CollectionModel.findBy({[options.foreignKey]: this[primaryKey]})
		}
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
							this.set('id', await this.constructor._snakeOrmProxy.runSql(await SqlFormat.generateCreateModelSql(this, this._changedAttributes)))
						}
					} else {
						if (Object.keys(this._changedAttributes).length) {
							await this.constructor._snakeOrmProxy.runSql(await SqlFormat.generateUpdateModelSql(this, this._changedAttributes))
						}
					}
					this.__resetDefaultRecord()
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