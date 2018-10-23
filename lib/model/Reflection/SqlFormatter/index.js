class SqlFormatter {
	static getSqlValue (value) {
		if (value === null || typeof value === 'number' || /^COALESCE\(/i.test(value)) {
			return value
		} else {
			return `'${value}'`
		}
	}
	
	static async generateCreateModelSql (model, object) {
		console.assert(model && object, 'model && object must all exist')
		let keys = [], args = []
		Object.keys(object).forEach(key => {
      keys.push(`\`${key}\``)
      let value = object === model._changedAttributes ? object[key].newValue : object[key]
      args.push(value)
		})
		let replace = args.map(i => '?')
		return [`INSERT INTO \`${model.constructor.table}\` (${keys.join(', ')}) VALUES (${replace.join(', ')})`, args]
	}
	
	static async generateUpdateModelSql (model, object) {
		console.assert(model && object, 'model && object must all exist')
		let primaryKeys = model.constructor.getPrimaryKeys()
		let sqlChips = [], args = []
		Object.keys(object).forEach(key => {
			let value = object === model._changedAttributes ? object[key].newValue : object[key]
			if (/^COALESCE\(/i.test(value)) {
        sqlChips.push(`\`${key}\` = ${this.getSqlValue(value)}`)
			} else {
        sqlChips.push(`\`${key}\` = ?`)
        args.push(value)
			}
		})
		let whereChips = []
		primaryKeys.forEach(onePrimaryKey => {
			whereChips.push(`\`${model.constructor.table}\`.\`${onePrimaryKey}\` = ${this.getSqlValue(model[onePrimaryKey])}`)
		})
		return [`UPDATE \`${model.constructor.table}\` SET ${sqlChips.join(', ')} where ${whereChips.join(' and ')}`, args]
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
			distinct: undefined,
			limit: undefined,
			offset: undefined
		}
		this.sqlClauseArgs = {
			joinArgs: [],
			whereArgs: [],
			havingArgs: []
		}
	}
	
	get args () {
		const { joinArgs, whereArgs, havingArgs } = this.sqlClauseArgs
		return joinArgs.concat(whereArgs).concat(havingArgs)
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
	
	addJoinClause (clause, ...args) {
		if (typeof clause === 'string') {
			clause = clause.trim()
			if (clause.match(/ /gi)) { // custom joins
				this.sqlClause.joinClause.push(clause)
			} else if (Object.keys(this.Model.__association).indexOf(clause) !== -1) {
				let options = this.Model.__association[clause]
				let joinModel = this.Model._snakeOrmProxy._Models[options['className']]
				if (/belongs/gi.test(options['_mode'])) {
					this.sqlClause.joinClause.push(`INNER JOIN \`${joinModel.table}\` ON \`${joinModel.table}\`.\`${joinModel._primaryKey}\` = ${this.getSqlKey(options.foreignKey)}`)
				} else { // has
					this.sqlClause.joinClause.push(`INNER JOIN \`${joinModel.table}\` ON \`${joinModel.table}\`.\`${options.foreignKey}\` = ${this.getSqlKey(this.Model._primaryKey)}`)
				}
			}
			this.sqlClauseArgs.joinArgs = this.sqlClauseArgs.joinArgs.concat(args)
		} else if (clause instanceof Object) {
		}
	}
	
	addWhereClause (clause, ...args) {
		if (typeof clause === 'string') {
			this.sqlClause.whereClause.push(clause)
			this.sqlClauseArgs.whereArgs = this.sqlClauseArgs.whereArgs.concat(args)
		} else if (clause instanceof Object) {
			Object.keys(clause).forEach(key => {
        if (clause[key] === null) { // where is null
          this.sqlClause.whereClause.push(`${this.getSqlKey(key)} IS NULL`)
        } else {
          let fullKey = this.getSqlKey(key)
          if (Array.isArray(clause[key])) { // where in
            let values = clause[key].map(value => this.getSqlValue(value))
            this.sqlClause.whereClause.push(`${fullKey} IN (${values.join(', ')})`)
          } else { // where =
            this.sqlClause.whereClause.push(`${fullKey} = ${this.getSqlValue(clause[key])}`)
          }
        }
			})
		}
	}
	
	addNotWhereClause (clause) {
		Object.keys(clause).forEach(key => {
      if (clause[key] === null) { // where is not null
        this.sqlClause.whereClause.push(`${this.getSqlKey(key)} IS NOT NULL`)
      } else {
        let fullKey = this.getSqlKey(key)
        if (Array.isArray(clause[key])) { // where not in
          let values = clause[key].map(value => this.getSqlValue(value))
          this.sqlClause.whereClause.push(`${fullKey} NOT IN (${values.join(', ')})`)
        } else { // where !=
          this.sqlClause.whereClause.push(`${fullKey} != ${this.getSqlValue(clause[key])}`)
        }
      }
		})
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
			Object.keys(clause).forEach(key => {
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
			})
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
					Object.keys(order).forEach(key => {
            this.sqlClause.orderClause.push(`${this.getSqlKey(key)} ${/(desc)$/i.test(order[key]) ? 'DESC' : 'ASC'}`)
					})
				}
			}
		} else if (clause instanceof Object) {
			Object.keys(clause).forEach(key => {
        this.sqlClause.orderClause.push(`${this.getSqlKey(key)} ${/(desc)$/i.test(clause[key]) ? 'DESC' : 'ASC'}`)
			})
		}
	}
	
	toSql ({opCount, opSum, opAvg, opMin, opMax, opUpdate, opDelete, opDeleteAll} = {}) {
		let {selectClause, joinClause, whereClause, groupClause, havingClause, orderClause, distinct, limit, offset} = this.sqlClause
		let sqlChips = ['SELECT']
		
		if ([!!opCount, !!opSum, !!opAvg, !!opMin, !!opMax].indexOf(true) !== -1) {
			if (opCount) {
				sqlChips.push(`COUNT(*)`)
			} else if (opSum) {
				let field = /\./.test(opSum) ? opSum : this.getSqlKey(opSum)
				sqlChips.push(`SUM(${field})`)
			} else if (opAvg) {
				let field = /\./.test(opAvg) ? opAvg : this.getSqlKey(opAvg)
				sqlChips.push(`AVG(${field})`)
			} else if (opMin) {
				let field = /\./.test(opMin) ? opMin : this.getSqlKey(opMin)
				sqlChips.push(`MIN(${field})`)
			} else if (opMax) {
				let field = /\./.test(opMax) ? opMax : this.getSqlKey(opMax)
				sqlChips.push(`MAX(${field})`)
			}
			sqlChips.push(`FROM ${this.sqlTable}`)
		} else if (opUpdate) {
			sqlChips = [`UPDATE ${this.sqlTable} SET`]
			let updateClause = []
			Object.keys(opUpdate).forEach(key => {
        let fullKey = `\`${key}\``
        updateClause.push(`${fullKey} = ${this.getSqlValue(opUpdate[key])}`)
			})
			sqlChips.push(updateClause.join(', '))
		} else if (opDelete || opDeleteAll) {
			sqlChips = [`DELETE FROM ${this.sqlTable}`]
			if (opDelete && !whereClause.length) {
				throw new Error('destroyAll must use with where, if you want delete all data, please use destroyAllTableData()')
			}
		} else {
			// distinct ?
			if (distinct) {
				sqlChips.push('DISTINCT')
			}
			// selectClause
			sqlChips.push(selectClause.map(select => {
				if (select === '*') {
					return `${this.sqlTable}.${select}`
				}
				return this.getSqlKey(select)
			}).join(', '))
			sqlChips.push(`FROM ${this.sqlTable}`)
		}
		
		// joinClause
		if (joinClause.length && sqlChips[0].match(/^SELECT/gi)) {
			sqlChips.push(...joinClause)
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