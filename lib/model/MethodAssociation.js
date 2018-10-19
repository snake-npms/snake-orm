const pluralize = require('pluralize')
const Method = require('./Method')
class MethodAssociation extends Method {
	/**
	 * AfterRegisterToSnakeOrmInstance
	 * @returns {Promise.<*>}
	 * @private
	 */
	static async __beforeOnRegisterInit () {
		Object.defineProperties(this, {
			__association: {
				value: {},
				writable: false
			}
		})
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
		/**
		 * eg: user.getOrders()
		 * @returns {*}
		 */
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
			items = items.map(item => {
				if (!(item instanceof CollectionModel)) {
					return new CollectionModel(item)
				}
				return item
			})
			let primaryKey = this.constructor.getPrimaryKey()
			let collectionPrimaryKey = CollectionModel.getPrimaryKey()
			if (options['through']) {
				let throughOptions = this.constructor.__association[options['through']]
				let throughOptionsInCollectionModel = CollectionModel.__association[throughOptions.className.toVarCase()]
				let throughCollectionModel = this.constructor._snakeOrmProxy._Models[throughOptions.className]
				let throughCollectionPrimaryKey = throughCollectionModel.getPrimaryKey()
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
							if (iItem.isNewRecord()) {
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
		/**
		 * eg: getWallet()
		 * @returns {*}
		 */
		this.prototype[`get${collection.toCapitalize()}`] = function () {
			let primaryKey = this.constructor._primaryKey
			return CollectionModel.findBy({[options.foreignKey]: this[primaryKey]})
		}
		/**
		 * eg: setWallet(wallet)
		 * @param object
		 */
		this.prototype[`set${collection.toCapitalize()}`] = async function (object) {
			if (object === undefined) {
				throw new Error('object must pass')
			}
			let primaryKey = this.constructor.getPrimaryKey()
			let collectionPrimaryKey = CollectionModel.getPrimaryKey()
			await this.constructor.withTransaction(async () => {
				let collectionItem = await this[`get${collection.toCapitalize()}`]()
				if (object && collectionItem && collectionItem[collectionPrimaryKey] === object[collectionPrimaryKey]) {
					await object.save()
				} else {
					if (collectionItem) {
						await collectionItem.destroy()
					}
					if (object) {
						if (!(object instanceof CollectionModel)) {
							object = new CollectionModel(object)
						}
						object.set([options.foreignKey], this[primaryKey])
						await object.save()
					}
				}
			})
			return object
		}
	}
	
	constructor () {
		super(...arguments)
	}
}
module.exports = MethodAssociation