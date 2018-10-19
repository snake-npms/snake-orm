const Base = require('./Base')
class Mysql extends Base {
	constructor() {
		super(...arguments)
	}
  
  // cache table primaryKey, second in direct return
  getPrimaryKeys (tableName) {
    this.tableInfo[tableName] = this.tableInfo[tableName] || {}
    if (this.tableInfo[tableName] && this.tableInfo[tableName]['primaryKeys'] && this.tableInfo[tableName]['primaryKeys'].length) {
      return this.tableInfo[tableName]['primaryKeys']
    }
    return []
    // this.tableInfo['tableName'] = {}
    // return await this.runSql(`SELECT column_name FROM information_schema.key_column_usage WHERE constraint_name = 'PRIMARY' AND table_schema = '${this.connectOptions.database}' AND table_name = '${tableName}' ORDER BY ordinal_position`).then(result => {
    // 	let keys = []
    // 	result.forEach(item => {
    // 		keys.push(...Object.values(item))
    // 	})
    // 	this.tableInfo['tableName']['primaryKeys'] = keys
    // 	return keys
    // }).catch(err => {
    // 	console.log(err)
    // })
  }
  
  getDefaultSchema (tableName) {
    this.tableInfo[tableName] = this.tableInfo[tableName] || {}
    return this.tableInfo[tableName]['defaultSchema'] && this.tableInfo[tableName]['defaultSchema'] || {}
  }
}
module.exports = Mysql