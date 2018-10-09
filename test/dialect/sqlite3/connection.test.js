const path = require('path')
const SnakeOrm = require('../../../index')
const expect = require('chai').expect
// let snakeOrm = new SnakeOrm('database_test.sqlite3', 'root', null, {dialect: 'sqlite3', host: 'localhost', debug: true})
let snakeOrmProxy = SnakeOrm.getOrCreateSnakeOrmProxy('database_test.sqlite3', 'root', null, {dialect: 'sqlite3', host: 'localhost', debug: true})
describe('Sqlite3 connect TEST', function() {
	before(async function() {
		// 在本区块的所有测试用例之前执行
		// both snakeOrm.proxy.runSql and snakeOrm.dialect.runSql are ok!
		await snakeOrmProxy.runSql(`DROP TABLE IF EXISTS users`)
		await snakeOrmProxy.runSql(`DROP TABLE IF EXISTS orders`)
		await snakeOrmProxy.runSql(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(20), age INTEGER)`)
		await snakeOrmProxy.runSql(`CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, oid VARCHAR(20), name VARCHAR(20), userId INTEGER)`)
		await snakeOrmProxy.runSql(`CREATE TABLE IF NOT EXISTS wallets (id INTEGER PRIMARY KEY AUTOINCREMENT, amount DECIMAL(10,5), userId INTEGER)`)
		await snakeOrmProxy.runSql(`INSERT INTO users(username, age) values('c1', 1)`)
		await snakeOrmProxy.runSql(`INSERT INTO orders(oid, name, userId) values('for1', 'o1', 1)`)
		await snakeOrmProxy.runSql(`INSERT INTO orders(oid, name, userId) values('for2', 'o2', 1)`)
		await snakeOrmProxy.runSql(`INSERT INTO wallets(amount, userId) values(10.5, 1)`)
	});
	
	it('should connect success', function() {
		let connectOptions = snakeOrmProxy.connectOptions
		// expect(snakeOrm.proxy).to.be.equal(snakeOrmProxy);
		expect(connectOptions).to.be.an('object');
		expect(connectOptions.dialect).to.be.equal('sqlite3');
		expect(snakeOrmProxy).to.be.equal(SnakeOrm.getOrmProxyByDatabase(connectOptions.database));
	});
	
	it('test hasOne', async function() {
		let snakeOrmProxy = SnakeOrm.getOrCreateSnakeOrmProxy('database_test.sqlite3', 'root', null, {dialect: 'sqlite3', host: 'localhost'})
		snakeOrmProxy.registerModelsWithPath(path.resolve(__dirname, './support/models'))
		let user = await snakeOrmProxy._Models.User.find(1)
		let wallet = await user.getWallet()
		expect(wallet.amount).to.be.equal(10.5)
	});
	
	it('test hasMany', async function() {
		let snakeOrmProxy = SnakeOrm.getOrCreateSnakeOrmProxy('database_test.sqlite3', 'root', null, {dialect: 'sqlite3', host: 'localhost'})
		snakeOrmProxy.registerModelsWithPath(path.resolve(__dirname, './support/models'))
		let user = await snakeOrmProxy._Models.User.find(1)
		let orders = await user.getOrders()
		expect(orders.length > 0).to.be.ok
		orders.forEach(order => {
			expect(order.userId).to.be.equal(user.id)
		})
	});
	
	it('test belongsTo', async function() {
		let snakeOrmProxy = SnakeOrm.getOrCreateSnakeOrmProxy('database_test.sqlite3', 'root', null, {dialect: 'sqlite3', host: 'localhost'})
		snakeOrmProxy.registerModelsWithPath(path.resolve(__dirname, './support/models'))
		let user = await snakeOrmProxy._Models.User.find(1)
		let wallet = await user.getWallet()
		let user2 = await wallet.getUser()
		expect(user2.id).to.be.equal(user.id)
		
		let orders = await user.getOrders()
		let user3 = await orders[0].getUser()
		expect(user3.id).to.be.equal(user.id)
	});
})