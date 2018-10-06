const SnakeNamespace = require('snake-namespace')
const expect = require('chai').expect
module.exports = function (snakeOrmProxy, User) {
	describe('Modify test', function() {
		it('FindOrCreateBy', async function () {
			let u1 = await User.findOrCreateBy({username: 'find-or-create-by'}, (u) => {u.age = 21})
			expect(u1.age).to.be.equal(21)
			
			let u2 = await User.findOrCreateBy({username: 'find-or-create-by'}, (u) => {u.age = 22})
			expect(u2.age).to.be.equal(21)
		})
		
		it('Create', async function () {
			let u1 = await User.create({username: 'zhangsan', age: 20})
			let u2 = await User.create({username: 'zhangsan', age: 20})
			let u3 = await User.create({username: 'zhangsan'}, (u) => {
				u.age = 21
			})
			expect(u1.id).to.be.ok
			expect(u2.id).to.be.equal(u1.id + 1)
			expect(u3.age).to.be.equal(21)
		})
		
		it('Update', async function () {
			let u1 = await User.create({username: 'zhangsan', age: 20})
			let count1 = await User.count()
			await u1.update({username: 'lisi2'}, (u) => {u.age = 21})
			let count2 = await User.count()
			expect(u1.username).to.be.equal('lisi2')
			expect(u1.age).to.be.equal(21)
			// 测试更新不会创建新数据
			expect(count1).to.be.equal(count2)
		})
		
		
		it('Increment/Decrement', async function () {
			let u1 = await User.create({username: 'zhangsan', age: 20})
			await u1.increment('age', 10)
			expect(u1.age).to.be.equal(30)
			await u1.decrement('age', 5)
			expect(u1.age).to.be.equal(25)
		})
		
		it('UpdateAll', async function () {
			await User.create({username: 'update-all', age: 18})
			await User.create({username: 'update-all', age: 19})
			await User.where({username: 'update-all'}).updateAll({age: 20})
			let users = await User.where({username: 'update-all'})
			expect(users[0].age).to.be.equal(20)
			expect(users[1].age).to.be.equal(20)
		})
		
		it('Save', async function () {
			let u1 = await User.create({username: 'zhangsan', age: 20})
			u1.username = 'lisi'
			await u1.save()
			expect(u1.username).to.be.equal('lisi')
		})

		it('withTransaction', async function () {
			await User.withTransaction(async () => {
				let transaction = SnakeNamespace.get('transaction')
				let transactionId = SnakeNamespace.get('transaction-id')
				expect(transaction && transactionId).to.be.ok

				let u = await User.create({username: 'zhangsi', age: 3})
				let uTransactionId = SnakeNamespace.get('transaction-id')
				expect(uTransactionId).to.be.equal(transactionId)

				await u.update({username: 'zhangsi'})
				await u.update({username: 'zhangsi2'})
				let uTransactionId2 = SnakeNamespace.get('transaction-id')
				expect(uTransactionId2).to.be.equal(transactionId)
			})
		})
		
		it('snake-namespace must blank Object', async function() {
			let namespace = SnakeNamespace._namesapce
			expect(Object.keys(namespace).length).to.be.equal(0)
		});
		
	})
}