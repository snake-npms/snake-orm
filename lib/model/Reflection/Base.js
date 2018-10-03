const SqlFormatter = require('./SqlFormatter')
class Base {
	static cloneReflection (relation) {
		let newRelation = new relation.constructor(relation._Model)
		// FIX ME: maybe performance can improve
		newRelation._sqlFormatter.sqlClause = JSON.parse(JSON.stringify(relation._sqlFormatter.sqlClause))
		newRelation._sqlFormatter.sqlClauseArgs = Object.assign({}, relation._sqlFormatter.sqlClauseArgs)
		return new Proxy(newRelation, {
			get (target, prop) {
				if (prop === 'then') {
					let promise = target.runSql()
					return promise.then.bind(promise)
				} else {
					return target[prop]
				}
			}
		})
	}
	
	constructor (Model) {
		this._Model = Model
		this._sqlFormatter = new SqlFormatter(Model)
		// 是否只查询一条记录
		this.isFindOne = false
	}
	
	get _sql () {
		return this._sqlFormatter.toSql()
	}
	
	async runSql (sql, ...args) {
		sql = sql || this._sql
		args = args.length && args || this._sqlFormatter.args
		return this._Model._snakeOrmProxy.runSql(sql, ...args).then((result) => {
			// insert return inserted id; update return affectedRowCount.
			if (/^(UPDATE|INSERT)/i.test(sql)) {
				return result
			} else if (/^SELECT (SUM|COUNT|AVG)\(/i.test(sql)) {
				return Object.values(result[0])[0] - 0
			}
			if (Array.isArray(result)) {
				result = result.map((item) => {
					return new this._Model(item, {isNewRecord: false})
				})
			}
			if (this.isFindOne) {
				if (result.length) {
					return result[0]
				}
				return null
			} else {
				let relation = this
				result = new Proxy(result, {
					get (target, prop) {
						if (target[prop]) {
							return target[prop]
						} else if (relation[prop]) {
							return function () {
								return relation[prop].apply(relation, arguments)
							}
						} else {
							return target[prop]
						}
					}
				})
				return result
			}
		}).catch(err => {
			console.log(err)
		})
	}
	
	_inNewReflectionDo (cb) {
		let newRelation = this.constructor.cloneReflection(this)
		return cb(newRelation) || newRelation
	}
	
	/*
	* Query
	*
	* */
	
	async find (valueOfPrimaryKey) {
		let primaryKey = await this._Model.getPrimaryKey()
		if (!primaryKey) {
			throw new Error('Primary Key Can not Get!')
		}
		let result = await this._inNewReflectionDo((newRelation) => {
			newRelation.isFindOne = true
			newRelation._sqlFormatter.sqlClause.limit = 1
			newRelation._sqlFormatter.addWhereClause({[primaryKey]: valueOfPrimaryKey})
		})
		if (!result) {
			throw  new Error(`Can not find {${primaryKey}: ${valueOfPrimaryKey}`)
		}
		return result
	}
	
	findBy (options, ...args) {
		return this._inNewReflectionDo((newRelation) => {
			newRelation.isFindOne = true
			newRelation._sqlFormatter.sqlClause.limit = 1
			newRelation._sqlFormatter.addWhereClause(options, ...args)
		})
	}
	
	where (options, ...args) {
		return this._inNewReflectionDo((newRelation) => {
			newRelation._sqlFormatter.addWhereClause(options, ...args)
		})
	}
	
	group (fields) {
		if (typeof fields === 'string') {
			fields = [...arguments]
		}
		return this._inNewReflectionDo((newRelation) => {
			newRelation._sqlFormatter.addGroupClause(fields)
		})
	}
	
	having (options, ...args) {
		return this._inNewReflectionDo((newRelation) => {
			newRelation._sqlFormatter.addHavingClause(options, ...args)
		})
	}
	
	order (options) {
		return this._inNewReflectionDo((newRelation) => {
			newRelation._sqlFormatter.addOrderClause(options)
		})
	}
	
	select (fields) {
		if (typeof fields === 'string') {
			fields = [...arguments]
		}
		return this._inNewReflectionDo((newRelation) => {
			newRelation._sqlFormatter.sqlClause.selectClause = fields
		})
	}
	
	limit (limit) {
		return this._inNewReflectionDo((newRelation) => {
			newRelation._sqlFormatter.sqlClause.limit = limit
		})
	}
	
	offset (offset) {
		return this._inNewReflectionDo((newRelation) => {
			newRelation._sqlFormatter.sqlClause.offset = offset
		})
	}
	
	count () {
		return this.runSql(this._sqlFormatter.toSql({opCount: true}))
	}
	
	sum (field) {
		return this.runSql(this._sqlFormatter.toSql({opSum: field}))
	}
	
	avg (field) {
		return this.runSql(this._sqlFormatter.toSql({opAvg: field}))
	}
	
	/*
	* Create
	*
	* */
	async create (object, blockAfn) {
		let model = new this._Model(object)
		if (blockAfn) {
			await blockAfn(model)
		}
		return await model.save() ? model : null
	}
	
	/*
	* Update
	*
	* */
	async updateAll (object) {
		console.assert(Object.isObject(object), 'updateAll params must an object')
		return this.runSql(this._sqlFormatter.toSql({opUpdate: object}))
	}
}
module.exports = Base