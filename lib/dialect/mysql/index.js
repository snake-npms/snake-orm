const Base = require('./Base')
class Mysql extends Base {
	constructor() {
		super(...arguments)
	}
  
  // cache table primaryKey, second in direct return
  // getPrimaryKeys (tableName) {
  //   this.tableInfo[tableName] = this.tableInfo[tableName] || {}
  //   if (this.tableInfo[tableName] && this.tableInfo[tableName]['primaryKeys'] && this.tableInfo[tableName]['primaryKeys'].length) {
  //     return this.tableInfo[tableName]['primaryKeys']
  //   }
  //   return []
  // }
  //
  // getDefaultValues (tableName) {
  //   this.tableInfo[tableName] = this.tableInfo[tableName] || {}
  //   return this.tableInfo[tableName]['defaultValues'] && this.tableInfo[tableName]['defaultValues'] || {}
  // }
  //
  // getSchema (tableName) {
  //   this.tableInfo[tableName] = this.tableInfo[tableName] || {}
  //   return this.tableInfo[tableName]['schema'] && this.tableInfo[tableName]['schema'] || {}
  // }
}
module.exports = Mysql