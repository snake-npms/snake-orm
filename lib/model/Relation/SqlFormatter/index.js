class SqlFormatter {
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
				if (clause[key] === null) {
					this.sqlClause.whereClause.push(`\`${this.Model.table}\`.\`${key}\` IS NULL`)
				} else {
					this.sqlClause.whereClause.push(`\`${this.Model.table}\`.\`${key}\` = ${typeof clause[key] === 'number' ? clause[key] : `'${clause[key]}'` }`)
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