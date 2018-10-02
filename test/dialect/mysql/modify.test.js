const SnakeOrm = require('../../../index')
const User = require('./support/models/User')
// let snakeOrm = new SnakeOrm('database_test', 'root', null, {dialect: 'mysql', host: 'localhost'})
let snakeOrmProxy = SnakeOrm.getOrCreateSnakeOrmProxy('database_test', 'root', null, {dialect: 'mysql', host: 'localhost', logger: true})
describe('Mysql Modify test', function() {
	before(async function() {
		// 在本区块的所有测试用例之前执行
		// snakeOrm.proxy === snakeOrmProxy
		await snakeOrmProxy.runSql(`DROP TABLE IF EXISTS users`)
		await snakeOrmProxy.runSql(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTO_INCREMENT, username VARCHAR(20), age INTEGER)`)
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
	
	require('../modify')(snakeOrmProxy, User)
})