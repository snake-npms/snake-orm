class TableDefinition {
	constructor (tableName, options) {
		this.tableName = tableName
		this.options = options
	}
	
	string (field, options) {}
	text (field, options) {}
	integer (field, options) {}
	decimal (field, options) {}
	boolean (field, options) {}
	date (field, options) {}
	datetime (field, options) {}
	timestamps () {}
	
	references (field, options) {}
}
module.exports = TableDefinition