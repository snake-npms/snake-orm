const SnakeOrm = require('../../../index')
const expect = require('chai').expect
const User = require('./support/models/User')
describe('Sqlite3 query test', function() {
	let snakeOrm = new SnakeOrm('database_test.sqlite3', 'root', null, {
		dialect: 'sqlite3',
		host: 'localhost',
		debug: true
	})
	before(async function () {
		// 在本区块的所有测试用例之前执行
		// both snakeOrm.proxy.runSql and snakeOrm.dialect.runSql are ok!
		await snakeOrm.proxy.runSql(`DROP TABLE IF EXISTS users`)
		await snakeOrm.proxy.runSql(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(20), age INTEGER)`)
	});
	// after(function() {
	// 	// 在本区块的所有测试用例之后执行
	// });
	//
	// beforeEach(function() {
	// 	// 在本区块的每个测试用例之前执行
	// });
	//
	// afterEach(function() {
	// 	// 在本区块的每个测试用例之后执行
	// });
	it('Create', async function () {
		let u1 = await User.create({username: 'zhangsan', age: 20})
		expect(u1.id && u1.username && u1.age).to.be.ok
	})
})