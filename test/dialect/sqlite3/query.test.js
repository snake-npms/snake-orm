const SnakeOrm = require('../../../index')
const User = require('./support/models/User')
let snakeOrmProxy = SnakeOrm.getOrCreateSnakeOrmProxy('database_test.sqlite3', 'root', null, {dialect: 'sqlite3', host: 'localhost', debug: true})
describe('Sqlite3 query test', function() {
	before(async function() {
		// 在本区块的所有测试用例之前执行
		// both snakeOrm.proxy.runSql and snakeOrm.dialect.runSql are ok!
		await snakeOrmProxy.runSql(`DROP TABLE IF EXISTS users`)
		await snakeOrmProxy.runSql(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(20), age INTEGER)`)
		await snakeOrmProxy.runSql(`INSERT INTO users(username, age) values('u1', 1)`)
		await snakeOrmProxy.runSql(`INSERT INTO users(username, age) values('u2', 2)`)
		await snakeOrmProxy.runSql(`INSERT INTO users(username, age) values('u3', 3)`)
		await snakeOrmProxy.runSql(`INSERT INTO users(username, age) values('u4', 4)`)
		await snakeOrmProxy.runSql(`INSERT INTO users(username, age) values('u0', 0)`)
		await snakeOrmProxy.dialect.runSql(`INSERT INTO users(username, age) values('u5', 5)`)
		await snakeOrmProxy.dialect.runSql(`INSERT INTO users(username, age) values('u6', null)`)
		await snakeOrmProxy.dialect.runSql(`INSERT INTO users(username, age) values('u7', 7)`)
		await snakeOrmProxy.dialect.runSql(`INSERT INTO users(username, age) values(null, 8)`)
		await snakeOrmProxy.dialect.runSql(`INSERT INTO users(username, age) values('u9', 9)`)
		await snakeOrmProxy.dialect.runSql(`INSERT INTO users(username, age) values('ua', 100)`)
		await snakeOrmProxy.dialect.runSql(`INSERT INTO users(username, age) values('ua', 100)`)
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
	require('../query')(snakeOrmProxy, User)
})