const expect = require('chai').expect
module.exports = function (snakeOrmProxy) {
	describe('Relation test', function() {
		it('test hasOne', async function() {
			let user = await snakeOrmProxy._Models.User.find(1)
			let wallet = await user.getWallet()
			expect(wallet.amount == 10.5).to.be.ok
		});
		
		it('test hasMany', async function() {
			let user = await snakeOrmProxy._Models.User.find(1)
			let orders = await user.getOrders()
			expect(orders.length > 0).to.be.ok
			orders.forEach(order => {
				expect(order.userId).to.be.equal(user.id)
			})
		});
		
		it('test belongsTo', async function() {
			let user = await snakeOrmProxy._Models.User.find(1)
			let wallet = await user.getWallet()
			let user2 = await wallet.getUser()
			expect(user2.id).to.be.equal(user.id)
			
			let orders = await user.getOrders()
			let user3 = await orders[0].getUser()
			expect(user3.id).to.be.equal(user.id)
		});
	})
}