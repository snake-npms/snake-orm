const SnakeOrm = require('../../snake-orm')
const SqlFormatter = require('./SqlFormatter')
class Base {
	static get _snakeOrm () {
		return SnakeOrm.sharedSnakeOrmProxy()
	}
	
	constructor (Model) {
		this._Model = Model
		this._sqlFormatter = new SqlFormatter(Model)
	}
	
	get _sql () {
		return this._sqlFormatter.toSql()
	}
	
	async runSql (sql, options) {
		return this.constructor._snakeOrm.runSql(sql || this._sqlFormatter.toSql(options || {}))
	}
	
	where (options) {
		this._sqlFormatter.addWhereClause(options)
		return this
	}
	
	order (options) {
		this._sqlFormatter.addOrderClause(options)
		return this
	}
	
	limit (limit) {
		this._sqlFormatter.sqlClause.limit = limit
		return this
	}
	
	count () {
		return this.runSql(null, {opCount: true})
	}
	
	sum (field) {
		return this.runSql(null, {opSum: field})
	}
	
	offset (offset) {
		this._sqlFormatter.sqlClause.offset = offset
		return this
	}
}
module.exports = Base