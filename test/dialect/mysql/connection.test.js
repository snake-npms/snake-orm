const path = require('path')
const SnakeOrm = require('../../../index')
const expect = require('chai').expect
// let snakeOrmProxy = SnakeOrm.getOrCreateSnakeOrmProxy('database_test', 'root', null, {dialect: 'mysql', host: 'localhost', logger: true})
describe('Mysql connect TEST', function() {
	before(async function() {
		// await snakeOrmProxy.registerModelsWithPath(path.resolve(__dirname, './support/models'))
		let snakeOrmProxy = await SnakeOrm.initWithSnakeOrmRcFile(path.resolve(__dirname, 'support/.snakeormrc'))
		// 在本区块的所有测试用例之前执行
		// both snakeOrm.proxy.runSql and snakeOrm.dialect.runSql are ok!
		await snakeOrmProxy.runSql(`DROP TABLE IF EXISTS users`)
		await snakeOrmProxy.runSql(`DROP TABLE IF EXISTS wallets`)
		await snakeOrmProxy.runSql(`DROP TABLE IF EXISTS orders`)
		await snakeOrmProxy.runSql(`DROP TABLE IF EXISTS orderItems`)
		await snakeOrmProxy.runSql(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTO_INCREMENT, username VARCHAR(20), age INTEGER)`)
		await snakeOrmProxy.runSql(`CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTO_INCREMENT, oid VARCHAR(20), name VARCHAR(20), userId INTEGER)`)
		await snakeOrmProxy.runSql(`CREATE TABLE IF NOT EXISTS orderItems (id INTEGER PRIMARY KEY AUTO_INCREMENT, name VARCHAR(20), orderId INTEGER)`)
		await snakeOrmProxy.runSql(`CREATE TABLE IF NOT EXISTS wallets (id INTEGER PRIMARY KEY AUTO_INCREMENT, amount DECIMAL(10,5), userId INTEGER)`)
		await snakeOrmProxy.runSql(`INSERT INTO users(username, age) values('c1', 1)`)
		await snakeOrmProxy.runSql(`INSERT INTO users(username, age) values('c2', 2)`)
		await snakeOrmProxy.runSql(`INSERT INTO orders(oid, name, userId) values('for1', 'o1', 1)`)
		await snakeOrmProxy.runSql(`INSERT INTO orders(oid, name, userId) values('for2', 'o2', 1)`)
		await snakeOrmProxy.runSql(`INSERT INTO orderItems(name, orderId) values('for1-good1', 1)`)
		await snakeOrmProxy.runSql(`INSERT INTO orderItems(name, orderId) values('for1-good2', 1)`)
		await snakeOrmProxy.runSql(`INSERT INTO orderItems(name, orderId) values('for2-good1', 2)`)
		await snakeOrmProxy.runSql(`INSERT INTO orderItems(name, orderId) values('for2-good2', 2)`)
		await snakeOrmProxy.runSql(`INSERT INTO orderItems(name, orderId) values('for2-good3', 2)`)
		await snakeOrmProxy.runSql(`INSERT INTO wallets(amount, userId) values(10.5, 1)`)
	});
	
	it('should connect success', function() {
		let snakeOrmProxy = SnakeOrm.getOrmProxyByDatabase('database_test')
		let connectOptions = snakeOrmProxy.proxy.connectOptions
		expect(snakeOrmProxy.proxy).to.be.equal(snakeOrmProxy);
		expect(connectOptions).to.be.an('object');
		expect(connectOptions.dialect).to.be.equal('mysql');
		expect(snakeOrmProxy).to.be.equal(SnakeOrm.getOrmProxyByDatabase(connectOptions.database));
		
		require('../association')(snakeOrmProxy)
	});
})