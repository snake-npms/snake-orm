class SqlFormatter {
	
	static getSqlValue (value) {
		if (typeof value === 'number') {
			return value
		} else {
			return `'${value}'`
		}
	}
	
	static createModelSql (model) {
		let keys = [], values = []
		for (let key in model._changedAttributes) {
			keys.push(`\`${key}\``)
			values.push(this.getSqlValue(model._changedAttributes[key].newValue))
		}
		return `INSERT INTO \`${model.constructor.table}\` (${keys.join(', ')}) VALUES (${values.join(', ')})`
	}
	
	static updateModelSql (model, primaryKeys) {
		console.assert(model && primaryKeys, 'model && whereKey must all exist')
		let sqlChips = []
		for (let key in model._changedAttributes) {
			sqlChips.push(`\`${key}\` = ${this.getSqlValue(model._changedAttributes[key].newValue)}`)
		}
		let whereChips = []
		primaryKeys.forEach(onePrimaryKey => {
			whereChips.push(`\`${model.constructor.table}\`.\`${onePrimaryKey}\` = ${this.getSqlValue(model[onePrimaryKey])}`)
		})
		return `UPDATE \`${model.constructor.table}\` SET ${sqlChips.join(', ')} where ${whereChips.join(' and ')}`
	}
	
	constructor (Model) {
		this.Model = Model
		this.sqlClause = {
			selectClause: ['*'],
			fromClause: [],
			joinClause: [],
			whereClause: [],
			orderClause: [],
			havingClause: [],
			limit: undefined,
			offset: undefined
		}
		this.args = []
	}
	
	addWhereClause (clause, ...args) {
		if (typeof clause === 'string') {
			this.sqlClause.whereClause.push(clause)
			this.args = this.args.concat(args)
		} else if (clause instanceof Object) {
			for (let key in clause) {
				if (clause[key] === null) { // where is null
					this.sqlClause.whereClause.push(`\`${this.Model.table}\`.\`${key}\` IS NULL`)
				} else {
					let fullKey = `\`${this.Model.table}\`.\`${key}\``
					if (Array.isArray(clause[key])) { // where in
						let values = clause[key].map(value => this.constructor.getSqlValue(value))
						this.sqlClause.whereClause.push(`${fullKey} in (${values.join(', ')})`)
					} else { // where =
						this.sqlClause.whereClause.push(`${fullKey} = ${this.constructor.getSqlValue(clause[key])}`)
					}
				}
			}
		}
	}
	
	addOrderClause (clause) {
		if (typeof clause === 'string') {
			if (/(asc|desc)$/i.test(clause)) {
				this.sqlClause.orderClause.push(clause)
			} else {
				this.sqlClause.orderClause.push(`${clause} ASC`)
			}
		} else if (clause instanceof Array) {
			for (let order of clause) {
				if (typeof order === 'string') {
					if (/(asc|desc)$/i.test(order)) {
						this.sqlClause.orderClause.push(order)
					} else {
						this.sqlClause.orderClause.push(`${order} ASC`)
					}
				} else if (order instanceof Object){
					for (let key in order) {
						this.sqlClause.orderClause.push(`\`${this.Model.table}\`.\`${key}\` ${/(desc)$/i.test(order[key]) ? 'DESC' : 'ASC'}`)
					}
				}
			}
		} else if (clause instanceof Object) {
			for (let key in clause) {
				this.sqlClause.orderClause.push(`\`${this.Model.table}\`.\`${key}\` ${/(desc)$/i.test(clause[key]) ? 'DESC' : 'ASC'}`)
			}
		}
	}
	
	toSql ({opCount, opSum, opAvg} = {}) {
		let {selectClause, whereClause, orderClause, limit, offset} = this.sqlClause
		let sqlChips = ['SELECT']
		
		if (opCount) {
			sqlChips.push(`COUNT(*)`)
		} else if (opSum) {
			let field = /\./.test(opSum) ? opSum : `\`${this.Model.table}\`.\`${opSum}\``
			sqlChips.push(`SUM(${field})`)
		} else if (opAvg) {
			let field = /\./.test(opAvg) ? opAvg : `\`${this.Model.table}\`.\`${opAvg}\``
			sqlChips.push(`AVG(${field})`)
		} else {
			sqlChips.push(...selectClause.map(select => {
				if (select === '*') {
					return `\`${this.Model.table}\`.${select}`
				}
				return `\`${this.Model.table}\`.\`${select}\``
			}))
		}
		sqlChips.push(`FROM \`${this.Model.table}\``)
		
		// whereClause
		if (whereClause.length) {
			sqlChips.push('WHERE')
			sqlChips.push(whereClause.join(' AND '))
		}
		
		if (orderClause.length) {
			sqlChips.push(`ORDER BY`)
			sqlChips.push(orderClause.join(', '))
		}
		
		if (limit) {
			sqlChips.push(`limit ${limit}`)
		}
		
		if (offset) {
			sqlChips.push(`offset ${offset}`)
		}
		return sqlChips.join(' ')
	}
}
module.exports = SqlFormatter