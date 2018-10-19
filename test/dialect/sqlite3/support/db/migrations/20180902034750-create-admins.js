module.exports = {
	async up (ormProxy) {
		// await ormProxy.runSql(`CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(20), age INTEGER)`)
		await ormProxy.createTable('admins', {}, function (t) {
			t.string('username', {null: false, index: true})
			t.string('phone', {null: false, unique: true})
			t.string('email')
			t.integer('age', {default: 0})
			t.decimal('point', {precision: 10, scale: 2, default: 0})
			t.timestamps()
		})
		await ormProxy.addIndex('admins', 'email', {unique: true})
	}
}