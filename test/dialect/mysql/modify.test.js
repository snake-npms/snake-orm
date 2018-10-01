const SnakeOrm = require('../../../index')
const expect = require('chai').expect
const User = require('./support/models/User')
describe('Mysql Modify test', function() {
	let snakeOrm = new SnakeOrm('database_test', 'root', null, {dialect: 'mysql', host: 'localhost'})
	before(async function() {
		// 在本区块的所有测试用例之前执行
		// both snakeOrm.proxy.runSql and snakeOrm.dialect.runSql are ok!
		await snakeOrm.proxy.runSql(`DROP TABLE IF EXISTS users`)
		await snakeOrm.proxy.runSql(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTO_INCREMENT, username VARCHAR(20), age INTEGER)`)
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
		let u2 = await User.create({username: 'zhangsan', age: 20})
		let u3 = await User.create({username: 'zhangsan', age: 20})
		expect(u1.id).to.be.equal(1)
		expect(u2.id).to.be.equal(2)
		expect(u3.id).to.be.equal(3)
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
			
			await u.update({username: 'zhangsi'})
			let uTransactionId2 = User._snakeOrmProxy.ns.get('transaction-id')
			expect(uTransactionId2).to.be.equal(transactionId)
		})
	})
})