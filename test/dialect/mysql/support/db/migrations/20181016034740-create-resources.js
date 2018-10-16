module.exports = {
	async up (ormProxy) {
		// await ormProxy.runSql(`CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(20), age INTEGER)`)
		await ormProxy.createTable('resources', {}, function (t) {
			t.string('name', {unique: true})
			t.string('desc')
			t.timestamps()
		})
	}
}