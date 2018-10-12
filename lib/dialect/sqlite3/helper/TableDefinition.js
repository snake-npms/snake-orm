class TableDefinition {
	constructor (tableName) {
		this.tableName = tableName
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