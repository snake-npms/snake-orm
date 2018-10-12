const Base = require('./Base')
const TableDefinition = require('./helper/TableDefinition')
class Db extends Base {
	constructor () {
		super(...arguments)
	}
	
	async createTable (tableName, cb) {
		let td = new TableDefinition(tableName)
		cb && cb (td)
	}
}
module.exports = Db