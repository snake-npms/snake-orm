let TableDefinition = require('../migration/TableDefinition')
class DialectProxy {
	constructor (connectOptions) {
		this.connectOptions = connectOptions
		let Dialect = require(`./${connectOptions['dialect']}`)
		this.dialect = new Proxy(new Dialect(connectOptions), {
			get (target, prop) {
				if (target[prop]) {
					if (target.hasOwnProperty(prop)) {
						return target[prop]
					}
					return function () {
						return target[prop].apply(target, arguments)
					}
				}
			}
		})
	}
  
  // cache table primaryKey, second in direct return
  getPrimaryKeys (tableName) {
    this.dialect.tableInfo[tableName] = this.dialect.tableInfo[tableName] || {}
    if (this.dialect.tableInfo[tableName] && this.dialect.tableInfo[tableName]['primaryKeys']) {
      return this.dialect.tableInfo[tableName]['primaryKeys']
    }
    return []
  }
  
  getDefaultValues (tableName) {
    this.dialect.tableInfo[tableName] = this.dialect.tableInfo[tableName] || {}
    return this.dialect.tableInfo[tableName]['defaultValues'] || {}
  }
  
  getSchema (tableName) {
    this.dialect.tableInfo[tableName] = this.dialect.tableInfo[tableName] || {}
    return this.dialect.tableInfo[tableName]['schema'] || {}
  }
  
  async createDatabase (tableName, options) {
    let sqls = (new TableDefinition(this)).createDatabase(tableName, options)
    for (let sql of sqls) {
      await this.dialect.runSql(sql)
    }
  }
  
  async dropDatabase (tableName, options) {
    let sqls = (new TableDefinition(this)).dropDatabase(tableName, options)
    for (let sql of sqls) {
      await this.dialect.runSql(sql)
    }
  }
	
	async createTable (tableName, options, afn) {
		let sqls = (new TableDefinition(this)).createTable(tableName, options, afn)
		for (let sql of sqls) {
			await this.dialect.runSql(sql)
		}
	}
	
	async addIndex (tableName, field, options) {
		let sqls = (new TableDefinition(this)).addIndex(tableName, field, options)
		for (let sql of sqls) {
			await this.dialect.runSql(sql)
		}
	}
	
	async addColumn (tableName, field, type, options) {
		let sqls = (new TableDefinition(this)).addColumn(tableName, field, type, options)
		for (let sql of sqls) {
			await this.dialect.runSql(sql)
		}
	}
	
	// not support sqlite3
	async renameColumn (tableName, oldName, newName, type, options) {
		let sqls = await (new TableDefinition(this)).renameColumn(tableName, oldName, newName, type, options)
		for (let sql of sqls) {
			await this.dialect.runSql(sql)
		}
	}
	
	async removeColumn (tableName, field) {
		let sqls = await (new TableDefinition(this)).removeColumn(tableName, field)
		for (let sql of sqls) {
			await this.dialect.runSql(sql)
		}
	}
	
	async removeIndex (tableName, field) {
		let sqls = (new TableDefinition(this)).removeIndex(tableName, field)
		for (let sql of sqls) {
			await this.dialect.runSql(sql)
		}
	}
	
	async renameTable (tableName, newTableName) {
		let sqls = (new TableDefinition(this)).renameTable(tableName, newTableName)
		for (let sql of sqls) {
			await this.dialect.runSql(sql)
		}
	}
	
	async dropTable (tableName) {
		let sqls = (new TableDefinition(this)).dropTable(tableName)
		for (let sql of sqls) {
			await this.dialect.runSql(sql)
		}
	}
}
module.exports = DialectProxy