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
		let ModelCollection = this._snakeOrmProxy._Models[options.className]
		this.__association[collection] = options
		this.prototype[`get${collection.toCapitalize()}`] = function () {
			let primaryKey = ModelCollection._primaryKey
			return ModelCollection.findBy({[primaryKey]: this[options['foreignKey']]})
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
		let ModelCollection = this._snakeOrmProxy._Models[options.className]
		this.__association[collection] = options
		/**
		 * eg: user.getOrders()
		 * @returns {*}
		 */
		this.prototype[`get${collection.toCapitalize()}`] = function () {
			let primaryKey = this.constructor._primaryKey
			if (options['through']) {
				let throughOptions = this.constructor.__association[options['through']]
				let ModelThrough = this.constructor._snakeOrmProxy._Models[throughOptions.className]
				return ModelCollection.joins(pluralize.singular(ModelThrough.table)).where(`\`${ModelThrough.table}\`.\`${throughOptions.foreignKey}\` = ?`, this[primaryKey])
			} else {
				return ModelCollection.where({[options.foreignKey]: this[primaryKey]})
			}
		}
    /**
     * eg: user.addOrders([])
     * @param items
     * @returns {Promise.<*>}
     */
    this.prototype[`add${collection.toCapitalize()}`] = async function (items) {
			if (!Array.isArray(items)) {
				items = [items]
			}
      let shouldInsertItems = items.map(item => {
        if (!(item instanceof ModelCollection)) {
          return new ModelCollection(item)
        }
        return item
      })
      let primaryKey = this.constructor._primaryKey
	    if (options['through']) {
        let throughOptions = this.constructor.__association[options['through']]
        let ModelThrough = this.constructor._snakeOrmProxy._Models[throughOptions.className]
        let ModelCollection_throughOptions = null
        // Through also hasMany eg: (user.hasMany('orderItems')) User hasMany orders, Order hasMany orderItems
		    const hasHas = ModelThrough.__association[options['_collection']] && ModelThrough.__association[options['_collection']]['_mode'] === 'has'
        if (hasHas) {
          ModelCollection_throughOptions = ModelCollection.__association[pluralize.singular(throughOptions['_collection'])]
        } else { // Through is belongsTo eg: (user.hasMany('friends')) User hasMany FriendShip, FriendShip belongsTo Friend
          ModelCollection_throughOptions = ModelCollection.__association[throughOptions['_collection']]
        }
        
        if (shouldInsertItems.length) {
          for (let iItem of shouldInsertItems) {
          	if (hasHas) {
              if (iItem.isNewRecord()) {
                if (!iItem[ModelCollection_throughOptions.foreignKey]) {
                  let throughItem = await ModelThrough.create({[throughOptions.foreignKey]: this[primaryKey]})
                  iItem.set(ModelCollection_throughOptions.foreignKey, throughItem[ModelThrough._primaryKey])
                }
                await iItem.save()
              } else {
                if (!iItem[ModelCollection_throughOptions.foreignKey]) {
                  let throughItem = await ModelThrough.create({[throughOptions.foreignKey]: this[primaryKey]})
                  iItem.set(ModelCollection_throughOptions.foreignKey, throughItem[ModelThrough._primaryKey])
                } else {
                  let throughItem = await iItem[`get${ModelCollection_throughOptions['_collection'].toCapitalize()}`]()
                  if (throughItem[throughOptions.foreignKey] !== this[primaryKey]) {
                    await throughItem.update({[throughOptions.foreignKey]: this[primaryKey]})
                  }
                }
              }
	          } else {
              if (iItem.isNewRecord()) {
                await iItem.save()
              }
              await ModelThrough.findOrCreateBy({[throughOptions.foreignKey]: this[primaryKey], [options['foreignKey']]: iItem.id})
	          }
          }
        }
	    } else { // no through
        for (let iItem of shouldInsertItems) {
          await iItem.save()
          await iItem.update({[options.foreignKey]: this[primaryKey]})
        }
      }
      return shouldInsertItems
    }
    /**
     * eg: user.minusOrders([])
     * @param items
     * @returns {Promise.<*>}
     */
    this.prototype[`minus${collection.toCapitalize()}`] = async function (items) {
      if (!Array.isArray(items)) {
        items = [items]
      }
      let shouldDeleteItems = items.filter(item => {
        if (item instanceof ModelCollection) {
          return true
        }
        return false
      })
      if (options['through']) {
        let throughOptions = this.constructor.__association[options['through']]
        let ModelThrough = this.constructor._snakeOrmProxy._Models[throughOptions.className]
        let ModelCollection_throughOptions = null
        // Through also hasMany eg: (user.hasMany('orderItems')) User hasMany orders, Order hasMany orderItems
        const hasHas = ModelThrough.__association[options['_collection']] && ModelThrough.__association[options['_collection']]['_mode'] === 'has'
        if (hasHas) {
          ModelCollection_throughOptions = ModelCollection.__association[pluralize.singular(throughOptions['_collection'])]
        } else { // Through is belongsTo eg: (user.hasMany('friends')) User hasMany FriendShip, FriendShip belongsTo Friend
          ModelCollection_throughOptions = ModelCollection.__association[throughOptions['_collection']]
        }
        if (shouldDeleteItems.length) {
          await this.constructor.withTransaction(async () => {
            if (hasHas) {
              let where = {[ModelCollection._primaryKey]: shouldDeleteItems.map(item => item[ModelCollection._primaryKey])}
              await ModelCollection.where(where).updateAll({[ModelCollection_throughOptions.foreignKey]: null})
            } else {
              await ModelThrough.where({
	              [options['foreignKey']]: shouldDeleteItems.map(item => item[ModelCollection._primaryKey]),
	              [throughOptions.foreignKey]: this[this.constructor._primaryKey]
              }).destroyAll()
            }
          })
        }
      } else { // no through
        if (shouldDeleteItems.length) {
          await this.constructor.withTransaction(async () => {
            let where = {[ModelCollection._primaryKey]: shouldDeleteItems.map(item => item[ModelCollection._primaryKey])}
            await ModelCollection.where(where).updateAll({[options.foreignKey]: null})
          })
        }
      }
      return shouldDeleteItems
    }
		/**
		 * eg: user.setOrders([])
		 * @param items
		 * @returns {Promise.<*>}
		 */
		this.prototype[`set${collection.toCapitalize()}`] = async function (items) {
			items = items.map(item => {
				if (!(item instanceof ModelCollection)) {
					return new ModelCollection(item)
				}
				return item
			})
			let primaryKey = this.constructor._primaryKey
			if (options['through']) {
        let throughOptions = this.constructor.__association[options['through']]
        let ModelThrough = this.constructor._snakeOrmProxy._Models[throughOptions.className]
        let ModelCollection_throughOptions = null
        // Through also hasMany eg: (user.hasMany('orderItems')) User hasMany orders, Order hasMany orderItems
        const hasHas = ModelThrough.__association[options['_collection']] && ModelThrough.__association[options['_collection']]['_mode'] === 'has'
        if (hasHas) {
          ModelCollection_throughOptions = ModelCollection.__association[pluralize.singular(throughOptions['_collection'])]
        } else { // Through is belongsTo eg: (user.hasMany('friends')) User hasMany FriendShip, FriendShip belongsTo Friend
          ModelCollection_throughOptions = ModelCollection.__association[throughOptions['_collection']]
        }
        let collectionItems = []
        if (hasHas) {
          collectionItems = await ModelCollection.joins(ModelCollection_throughOptions['_collection']).where(`\`${ModelThrough.table}\`.\`${throughOptions.foreignKey}\` = ?`, this[primaryKey])
        } else {
          collectionItems = await ModelCollection.joins(`inner join \`${ModelThrough.table}\` on \`${ModelThrough.table}\`.\`${options.foreignKey}\` = \`${ModelCollection.table}\`.\`${ModelCollection._primaryKey}\``).where(`\`${ModelThrough.table}\`.\`${throughOptions.foreignKey}\` = ?`, this[primaryKey])
        }
				let shouldInsertItems = items.filter(nItem => {
					let shouldInsert = true
					for (let cItem of collectionItems) {
						if (cItem[ModelCollection._primaryKey] === nItem[ModelCollection._primaryKey]) {
							shouldInsert = false
							break
						}
					}
					return shouldInsert
				})
				let shouldDeleteItems = collectionItems.filter(cItem => {
					let shouldDelete = true
					for (let nItem of items) {
						if (cItem[ModelCollection._primaryKey] === nItem[ModelCollection._primaryKey]) {
							shouldDelete = false
							break
						}
					}
					return shouldDelete
				})
				await this.constructor.withTransaction(async () => {
					if (shouldDeleteItems.length) {
						await this[`minus${collection.toCapitalize()}`](shouldDeleteItems)
					}
					if (shouldInsertItems.length) {
            await this[`add${collection.toCapitalize()}`](shouldInsertItems)
					}
				})
			} else { // no through
				let collectionItems = await ModelCollection.where({[options.foreignKey]: this[primaryKey]})
				let shouldInsertItems = items.filter(nItem => {
					let shouldInsert = true
					for (let cItem of collectionItems) {
						if (cItem[ModelCollection._primaryKey] === nItem[ModelCollection._primaryKey]) {
							shouldInsert = false
							break
						}
					}
					return shouldInsert
				})
				let shouldDeleteItems = collectionItems.filter(cItem => {
					let shouldDelete = true
					for (let nItem of items) {
						if (cItem[ModelCollection._primaryKey] === nItem[ModelCollection._primaryKey]) {
							shouldDelete = false
							break
						}
					}
					return shouldDelete
				})
				await this.constructor.withTransaction(async () => {
					if (shouldDeleteItems.length) {
            await this[`minus${collection.toCapitalize()}`](shouldDeleteItems)
					}
					if (shouldInsertItems.length) {
            await this[`add${collection.toCapitalize()}`](shouldInsertItems)
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
		let ModelCollection = this._snakeOrmProxy._Models[options.className]
		this.__association[collection] = options
		/**
		 * eg: getWallet()
		 * @returns {*}
		 */
		this.prototype[`get${collection.toCapitalize()}`] = function () {
			let primaryKey = this.constructor._primaryKey
			return ModelCollection.findBy({[options.foreignKey]: this[primaryKey]})
		}
		/**
		 * eg: setWallet(wallet)
		 * @param object
		 */
		this.prototype[`set${collection.toCapitalize()}`] = async function (object) {
			if (object === undefined) {
				throw new Error('object must pass')
			}
			let primaryKey = this.constructor._primaryKey
			await this.constructor.withTransaction(async () => {
				let collectionItem = await this[`get${collection.toCapitalize()}`]()
				if (object && collectionItem && collectionItem[ModelCollection._primaryKey] === object[ModelCollection._primaryKey]) {
					await object.save()
				} else {
					if (collectionItem) {
						await collectionItem.destroy()
					}
					if (object) {
						if (!(object instanceof ModelCollection)) {
							object = new ModelCollection(object)
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