const SqlFormatter = require('./SqlFormatter')
class Base {
	static cloneRelation (relation) {
		let newRelation = new relation.constructor(relation._Model)
		// FIX ME: maybe performance can improve
		newRelation._sqlFormatter.sqlClause = JSON.parse(JSON.stringify(relation._sqlFormatter.sqlClause))
		newRelation._sqlFormatter.args = relation._sqlFormatter.args
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
			if (/^SELECT (SUM|COUNT|AVG)\(/i.test(sql)) {
				return Object.values(result[0])[0] - 0
			}
			if (Array.isArray(result)) {
				result = result.map((item) => {
					return new this._Model(item)
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
	
	_inNewRelationDo (cb) {
		let newRelation = this.constructor.cloneRelation(this)
		return cb(newRelation) || newRelation
	}
	
	findBy (options, ...args) {
		return this._inNewRelationDo((newRelation) => {
			newRelation.isFindOne = true
			newRelation._sqlFormatter.sqlClause.limit = 1
			newRelation._sqlFormatter.addWhereClause(options, ...args)
		})
	}
	
	where (options, ...args) {
		return this._inNewRelationDo((newRelation) => {
			newRelation._sqlFormatter.addWhereClause(options, ...args)
		})
	}
	
	order (options) {
		return this._inNewRelationDo((newRelation) => {
			newRelation._sqlFormatter.addOrderClause(options)
		})
	}
	
	limit (limit) {
		return this._inNewRelationDo((newRelation) => {
			newRelation._sqlFormatter.sqlClause.limit = limit
		})
	}
	
	offset (offset) {
		return this._inNewRelationDo((newRelation) => {
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
}
module.exports = Base