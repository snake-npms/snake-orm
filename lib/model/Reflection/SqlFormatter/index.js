class SqlFormatter {
	static getSqlValue (value) {
		if (typeof value === 'number' || /^COALESCE\(/i.test(value)) {
			return value
		} else {
			return `'${value}'`
		}
	}
	
	static async generateCreateModelSql (model, object) {
		console.assert(model && object, 'model && object must all exist')
		let keys = [], values = []
		for (let key in object) {
			keys.push(`\`${key}\``)
			if (object === model._changedAttributes) {
				values.push(this.getSqlValue(object[key].newValue))
			} else {
				values.push(this.getSqlValue(object[key]))
			}
		}
		return `INSERT INTO \`${model.constructor.table}\` (${keys.join(', ')}) VALUES (${values.join(', ')})`
	}
	
	static async generateUpdateModelSql (model, object) {
		console.assert(model && object, 'model && object must all exist')
		let primaryKeys = await model.constructor.getPrimaryKeys()
		let sqlChips = []
		for (let key in object) {
			if (object === model._changedAttributes) {
				sqlChips.push(`\`${key}\` = ${this.getSqlValue(object[key].newValue)}`)
			} else {
				sqlChips.push(`\`${key}\` = ${this.getSqlValue(object[key])}`)
			}
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
			groupClause: [],
			havingClause: [],
			limit: undefined,
			offset: undefined
		}
		this.sqlClauseArgs = {
			whereArgs: [],
			havingArgs: []
		}
	}
	
	get args () {
		const { whereArgs, havingArgs } = this.sqlClauseArgs
		return whereArgs.concat(havingArgs)
	}
	
	get sqlTable () {
		return `\`${this.Model.table}\``
	}
	
	getSqlKey (key) {
		return `${this.sqlTable}.\`${key}\``
	}
	
	getSqlValue (value) {
		return this.constructor.getSqlValue(value)
	}
	
	addWhereClause (clause, ...args) {
		if (typeof clause === 'string') {
			this.sqlClause.whereClause.push(clause)
			this.sqlClauseArgs.whereArgs = this.sqlClauseArgs.whereArgs.concat(args)
		} else if (clause instanceof Object) {
			for (let key in clause) {
				if (clause[key] === null) { // where is null
					this.sqlClause.whereClause.push(`${this.getSqlKey(key)} IS NULL`)
				} else {
					let fullKey = this.getSqlKey(key)
					if (Array.isArray(clause[key])) { // where in
						let values = clause[key].map(value => this.getSqlValue(value))
						this.sqlClause.whereClause.push(`${fullKey} in (${values.join(', ')})`)
					} else { // where =
						this.sqlClause.whereClause.push(`${fullKey} = ${this.getSqlValue(clause[key])}`)
					}
				}
			}
		}
	}
	
	addGroupClause (clause) {
		for (let group of clause) {
			if (RegExp(this.Model.table).test(group)) {
				this.sqlClause.groupClause.push(group)
			} else {
				this.sqlClause.groupClause.push(`${this.getSqlKey(group)}`)
			}
		}
	}
	
	addHavingClause (clause, ...args) {
		if (typeof clause === 'string') {
			this.sqlClause.havingClause.push(clause)
			this.sqlClauseArgs.havingArgs = this.sqlClauseArgs.havingArgs.concat(args)
		} else if (clause instanceof Object) {
			for (let key in clause) {
				if (clause[key] === null) { // is null
					this.sqlClause.havingClause.push(`${this.getSqlKey(key)} IS NULL`)
				} else {
					let fullKey = this.getSqlKey(key)
					if (Array.isArray(clause[key])) { // in
						let values = clause[key].map(value => this.getSqlValue(value))
						this.sqlClause.havingClause.push(`${fullKey} in (${values.join(', ')})`)
					} else { // =
						this.sqlClause.havingClause.push(`${fullKey} = ${this.getSqlValue(clause[key])}`)
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
						this.sqlClause.orderClause.push(`${this.getSqlKey(key)} ${/(desc)$/i.test(order[key]) ? 'DESC' : 'ASC'}`)
					}
				}
			}
		} else if (clause instanceof Object) {
			for (let key in clause) {
				this.sqlClause.orderClause.push(`${this.getSqlKey(key)} ${/(desc)$/i.test(clause[key]) ? 'DESC' : 'ASC'}`)
			}
		}
	}
	
	toSql ({opCount, opSum, opAvg, opUpdate} = {}) {
		let {selectClause, whereClause, groupClause, havingClause, orderClause, limit, offset} = this.sqlClause
		let sqlChips = ['SELECT']
		
		if (opCount) {
			sqlChips.push(`COUNT(*)`)
			sqlChips.push(`FROM ${this.sqlTable}`)
		} else if (opSum) {
			let field = /\./.test(opSum) ? opSum : this.getSqlKey(opSum)
			sqlChips.push(`SUM(${field})`)
			sqlChips.push(`FROM ${this.sqlTable}`)
		} else if (opAvg) {
			let field = /\./.test(opAvg) ? opAvg : this.getSqlKey(opAvg)
			sqlChips.push(`AVG(${field})`)
			sqlChips.push(`FROM ${this.sqlTable}`)
		} else if (opUpdate) {
			sqlChips = [`UPDATE ${this.sqlTable} SET`]
			let updateClause = []
			for (let key in opUpdate) {
				let fullKey = `\`${key}\``
				updateClause.push(`${fullKey} = ${this.getSqlValue(opUpdate[key])}`)
			}
			sqlChips.push(updateClause.join(', '))
		} else {
			// selectClause
			sqlChips.push(selectClause.map(select => {
				if (select === '*') {
					return `${this.sqlTable}.${select}`
				}
				return this.getSqlKey(select)
			}).join(', '))
			sqlChips.push(`FROM ${this.sqlTable}`)
		}
		
		// whereClause
		if (whereClause.length) {
			sqlChips.push('WHERE')
			sqlChips.push(whereClause.join(' AND '))
		}
		
		// groupClause
		if (groupClause.length) {
			sqlChips.push('GROUP BY')
			sqlChips.push(groupClause.join(', '))
		}
		
		// havingClause
		if (havingClause.length) {
			console.assert(groupClause.length, 'having must use with group')
			sqlChips.push('HAVING')
			sqlChips.push(havingClause.join(' AND '))
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