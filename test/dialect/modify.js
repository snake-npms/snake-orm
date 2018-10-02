const expect = require('chai').expect
module.exports = function (snakeOrmProxy, User) {
	describe('Modify test', function() {
		it('Create', async function () {
			let u1 = await User.create({username: 'zhangsan', age: 20})
			let u2 = await User.create({username: 'zhangsan', age: 20})
			let u3 = await User.create({username: 'zhangsan', age: 20})
			expect(u1.id).to.be.equal(1)
			expect(u2.id).to.be.equal(2)
			expect(u3.id).to.be.equal(3)
		})
		
		// it('Update', async function () {
		// 	let u1 = await User.create({username: 'zhangsan', age: 20})
		// 	await u1.update({username: 'lisi2'})
		// 	expect(u1.username).to.be.equal('lisi2')
		// })
		//
		// it('withTransaction', async function () {
		// 	await User.withTransaction(async () => {
		// 		let transaction = User._snakeOrmProxy.ns.get('transaction')
		// 		let transactionId = User._snakeOrmProxy.ns.get('transaction-id')
		// 		expect(transaction && transactionId).to.be.ok
		//
		// 		let u = await User.create({username: 'zhangsi', age: 3})
		// 		let uTransactionId = User._snakeOrmProxy.ns.get('transaction-id')
		// 		expect(uTransactionId).to.be.equal(transactionId)
		//
		// 		await u.update({username: 'zhangsi'})
		// 		let uTransactionId2 = User._snakeOrmProxy.ns.get('transaction-id')
		// 		expect(uTransactionId2).to.be.equal(transactionId)
		// 	})
		// })
		
	})
}