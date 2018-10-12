let Db = require('./Db')
class Sqlite3 extends Db {
	constructor() {
		super(...arguments)
	}
}
module.exports = Sqlite3