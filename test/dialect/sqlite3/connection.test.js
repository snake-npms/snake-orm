const path = require('path')
const SnakeOrm = require('../../../index')
const expect = require('chai').expect
// let snakeOrm = new SnakeOrm('database_test.sqlite3', 'root', null, {dialect: 'sqlite3', host: 'localhost', debug: true})
let snakeOrmProxy = SnakeOrm.getOrCreateSnakeOrmProxy('database_test.sqlite3', 'root', null, {dialect: 'sqlite3', host: 'localhost', debug: true})
describe('Sqlite3 connect TEST', function() {
	snakeOrmProxy.registerModelsWithPath(path.resolve(__dirname, './support/models'))
	before(async function() {
		// 在本区块的所有测试用例之前执行
		// both snakeOrm.proxy.runSql and snakeOrm.dialect.runSql are ok!
		await snakeOrmProxy.runSql(`DROP TABLE IF EXISTS users`)
		await snakeOrmProxy.runSql(`DROP TABLE IF EXISTS wallets`)
		await snakeOrmProxy.runSql(`DROP TABLE IF EXISTS orders`)
		await snakeOrmProxy.runSql(`DROP TABLE IF EXISTS order_items`)
		await snakeOrmProxy.runSql(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(20), age INTEGER)`)
		await snakeOrmProxy.runSql(`CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, oid VARCHAR(20), name VARCHAR(20), userId INTEGER)`)
		await snakeOrmProxy.runSql(`CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(20), orderId INTEGER)`)
		await snakeOrmProxy.runSql(`CREATE TABLE IF NOT EXISTS wallets (id INTEGER PRIMARY KEY AUTOINCREMENT, amount DECIMAL(10,5), userId INTEGER)`)
		await snakeOrmProxy.runSql(`INSERT INTO users(username, age) values('c1', 1)`)
		await snakeOrmProxy.runSql(`INSERT INTO users(username, age) values('c2', 2)`)
		await snakeOrmProxy.runSql(`INSERT INTO orders(oid, name, userId) values('for1', 'o1', 1)`)
		await snakeOrmProxy.runSql(`INSERT INTO orders(oid, name, userId) values('for2', 'o2', 1)`)
		await snakeOrmProxy.runSql(`INSERT INTO order_items(name, orderId) values('for1-good1', 1)`)
		await snakeOrmProxy.runSql(`INSERT INTO order_items(name, orderId) values('for1-good2', 1)`)
		await snakeOrmProxy.runSql(`INSERT INTO order_items(name, orderId) values('for2-good1', 2)`)
		await snakeOrmProxy.runSql(`INSERT INTO order_items(name, orderId) values('for2-good2', 2)`)
		await snakeOrmProxy.runSql(`INSERT INTO order_items(name, orderId) values('for2-good3', 2)`)
		await snakeOrmProxy.runSql(`INSERT INTO wallets(amount, userId) values(10.5, 1)`)
	});
	
	it('should connect success', function() {
		let connectOptions = snakeOrmProxy.connectOptions
		// expect(snakeOrm.proxy).to.be.equal(snakeOrmProxy);
		expect(connectOptions).to.be.an('object');
		expect(connectOptions.dialect).to.be.equal('sqlite3');
		expect(snakeOrmProxy).to.be.equal(SnakeOrm.getOrmProxyByDatabase(connectOptions.database));
	});
	
	require('../association')(snakeOrmProxy)
})