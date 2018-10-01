const SnakeOrm = require('../../../index')
const expect = require('chai').expect
const User = require('./support/models/User')
describe('Sqlite3 Modify test', function() {
	let snakeOrmProxy = SnakeOrm.getOrCreateSnakeOrmProxy('database_test.sqlite3', 'root', null, {
		dialect: 'sqlite3',
		host: 'localhost',
		debug: true
	})
	before(async function () {
		// 在本区块的所有测试用例之前执行
		// both snakeOrm.proxy.runSql and snakeOrm.dialect.runSql are ok!
		await snakeOrmProxy.proxy.runSql(`DROP TABLE IF EXISTS users`)
		await snakeOrmProxy.proxy.runSql(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(20), age INTEGER)`)
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
	
	it('Update', async function () {
		let u1 = await User.create({username: 'zhangsan', age: 20})
		await u1.update({username: 'lisi2'})
		expect(u1.username).to.be.equal('lisi2')
	})
	
	it('withTransaction', async function () {
		await User.withTransaction(async () => {
			let transaction = User._snakeOrmProxy.ns.get('transaction')
			let transactionId = User._snakeOrmProxy.ns.get('transaction-id')
			expect(transaction && transactionId).to.be.ok
			
			let u = await User.create({username: 'zhangsi', age: 3})
			let uTransactionId = User._snakeOrmProxy.ns.get('transaction-id')
			expect(uTransactionId).to.be.equal(transactionId)
			
			await u.update({username: 'zhangwu'})
			let uTransactionId2 = User._snakeOrmProxy.ns.get('transaction-id')
			expect(uTransactionId2).to.be.equal(transactionId)
		})
	})
})