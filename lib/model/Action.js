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
			_collection: collection,
			foreignKey: `${collection.toVarCase()}Id`,
			className: pluralize.singular(collection).toCapitalize(),
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
			_collection: collection,
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
		// eg: user.getOrders()
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
		/**
		 * eg: user.setOrders([])
		 * @param items
		 * @returns {Promise.<*>}
		 */
		this.prototype[`set${collection.toCapitalize()}`] = async function (items) {
			let primaryKey = this.constructor._primaryKey
			let collectionPrimaryKey = await CollectionModel.getPrimaryKey()
			if (options['through']) {
				let throughOptions = this.constructor.__association[options['through']]
				let throughOptionsInCollectionModel = CollectionModel.__association[throughOptions.className.toVarCase()]
				let throughCollectionModel = this.constructor._snakeOrmProxy._Models[throughOptions.className]
				let throughCollectionPrimaryKey = await throughCollectionModel.getPrimaryKey()
				let collectionItems = await CollectionModel.joins(throughOptionsInCollectionModel['_collection']).where(`\`${throughCollectionModel.table}\`.\`${throughOptions.foreignKey}\` = ?`, this[primaryKey])
				let shouldInsertItems = items.filter(nItem => {
					let shouldInsert = true
					for (let cItem of collectionItems) {
						if (cItem[collectionPrimaryKey] === nItem[collectionPrimaryKey]) {
							shouldInsert = false
							break
						}
					}
					return shouldInsert
				})
				let shouldDeleteItems = collectionItems.filter(cItem => {
					let shouldDelete = true
					for (let nItem of items) {
						if (cItem[collectionPrimaryKey] === nItem[collectionPrimaryKey]) {
							shouldDelete = false
							break
						}
					}
					return shouldDelete
				})
				await this.constructor.withTransaction(async () => {
					if (shouldDeleteItems.length) {
						let where = {[collectionPrimaryKey]: shouldDeleteItems.map(item => item[collectionPrimaryKey])}
						await CollectionModel.where(where).updateAll({[throughOptionsInCollectionModel.foreignKey]: null})
					}
					if (shouldInsertItems.length) {
						for (let iItem of shouldInsertItems) {
							if (iItem.isNewRecord) {
								if (!iItem[throughOptionsInCollectionModel.foreignKey]) {
									let throughItem = await throughCollectionModel.create({[throughOptions.foreignKey]: this[primaryKey]})
									iItem.set(throughOptionsInCollectionModel.foreignKey, throughItem[throughCollectionPrimaryKey])
								}
								await iItem.save()
							} else {
								if (!iItem[throughOptionsInCollectionModel.foreignKey]) {
									let throughItem = await throughCollectionModel.create({[throughOptions.foreignKey]: this[primaryKey]})
									iItem.set(throughOptionsInCollectionModel.foreignKey, throughItem[throughCollectionPrimaryKey])
								} else {
									let throughItem = await iItem[`get${throughOptionsInCollectionModel['_collection'].toCapitalize()}`]()
									if (throughItem[throughOptions.foreignKey] !== this[primaryKey]) {
										await throughItem.update({[throughOptions.foreignKey]: this[primaryKey]})
									}
								}
							}
						}
					}
				})
			} else { // no through
				let collectionItems = await CollectionModel.where({[options.foreignKey]: this[primaryKey]})
				let shouldInsertItems = items.filter(nItem => {
					let shouldInsert = true
					for (let cItem of collectionItems) {
						if (cItem[collectionPrimaryKey] === nItem[collectionPrimaryKey]) {
							shouldInsert = false
							break
						}
					}
					return shouldInsert
				})
				let shouldDeleteItems = collectionItems.filter(cItem => {
					let shouldDelete = true
					for (let nItem of items) {
						if (cItem[collectionPrimaryKey] === nItem[collectionPrimaryKey]) {
							shouldDelete = false
							break
						}
					}
					return shouldDelete
				})
				await this.constructor.withTransaction(async () => {
					if (shouldDeleteItems.length) {
						let where = {[collectionPrimaryKey]: shouldDeleteItems.map(item => item[collectionPrimaryKey])}
						await CollectionModel.where(where).updateAll({[options.foreignKey]: null})
					}
					if (shouldInsertItems.length) {
						for (let iItem of shouldInsertItems) {
							await iItem.save()
							await iItem.update({[options.foreignKey]: this[primaryKey]})
						}
					}
				})
			}
			return true
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
			this.set(key, object[key])
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
	
	async destroy () {
		let primarKeys = await this.constructor.getPrimaryKeys()
		let where = this._record
		if (primarKeys.length) {
			where = {}
			primarKeys.forEach(key => {
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
		let updateSql = await SqlFormat.generateUpdateModelSql(this, {[field]: `${value} ${by >= 0 ? `+ ${by}` : `- ${-by}`}`})
		return await this.constructor._snakeOrmProxy.runSql(updateSql)
	}
	
	async decrement (field, by = 1) {
		return this.increment(field, -by)
	}
}
module.exports = Action