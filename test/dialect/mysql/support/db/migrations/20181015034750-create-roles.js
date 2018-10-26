module.exports = {
	async up (ormProxy) {
		// await ormProxy.runSql(`CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(20), age INTEGER)`)
		await ormProxy.createTable('roles', {}, function (t) {
			t.string('name')
			t.string('desc')
			t.integer('admin', {foreignKey: true})
			t.boolean('enabled', {default: false})
			t.timestamps()
		})
		await ormProxy.addIndex('roles', 'desc')
		await ormProxy.addIndex('roles', ['name', 'desc'])
	}
}