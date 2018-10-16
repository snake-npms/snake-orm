module.exports = {
	async up (ormProxy) {
		// await ormProxy.runSql(`CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(20), age INTEGER)`)
		await ormProxy.dropTable('resources')
	}
}