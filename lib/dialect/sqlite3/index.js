let Base = require('./Base')
class Sqlite3 extends Base {
	constructor() {
		super(...arguments)
	}
  
  // cache table primaryKey, second in direct return
  getPrimaryKeys (tableName) {
    this.tableInfo[tableName] = this.tableInfo[tableName] || {}
    if (this.tableInfo[tableName]['primaryKeys'] && this.tableInfo[tableName]['primaryKeys'].length) {
      return this.tableInfo[tableName]['primaryKeys']
    }
    return []
    // this.tableInfo['tableName'] = {}
    // return await this.runSql(`PRAGMA table_info('${tableName}')`).then(result => {
    // 	let keys = []
    // 	result.forEach(item => {
    // 		if (item['pk']) {
    // 			keys.push(item['name'])
    // 		}
    // 	})
    // 	this.tableInfo['tableName']['primaryKeys'] = keys
    // 	return keys
    // })
  }
  
  getDefaultSchema (tableName) {
    this.tableInfo[tableName] = this.tableInfo[tableName] || {}
    return this.tableInfo[tableName]['defaultSchema'] && this.tableInfo[tableName]['defaultSchema'] || {}
  }
}
module.exports = Sqlite3