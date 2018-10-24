const expect = require('chai').expect
module.exports = function (snakeOrmProxy) {
	describe('Relation test', function() {
		it('test hasOne', async function() {
			let user = await snakeOrmProxy._Models.User.find(1)
			let wallet = await user.getWallet()
			expect(wallet.amount == 10.5).to.be.ok
			
			let u2 = await snakeOrmProxy._Models.User.find(2)
			let wallet2 = await u2.setWallet({amount: 2})
			expect(wallet2.amount == 2).to.be.ok
			
			let wallet3 = await u2.setWallet(null)
			expect(wallet3).to.be.equal(null)
		});

		it('test hasMany', async function() {
			let user = await snakeOrmProxy._Models.User.find(1)
			let orders = await user.getOrders()
			expect(orders.length > 0).to.be.ok
			orders.forEach(order => {
				expect(order.userId).to.be.equal(user.id)
			})

			let u2 = await snakeOrmProxy._Models.User.find(2)
			let order = new snakeOrmProxy._Models.Order({name: 'has-many-order'})
			await order.save()
			await u2.setOrders([order])
			let u2Orders = await u2.getOrders()
			expect(u2Orders.length === 1 && u2Orders[0].name === 'has-many-order').to.be.ok

			await u2.setOrders([{name: 'has-many-order2'}])
			let u22Orders = await u2.getOrders()
			expect(u22Orders.length === 1 && u22Orders[0].name === 'has-many-order2').to.be.ok
			
			let addedOrders = await u2.addOrders({name: 'has_many-order3'})
			let aU2Orders = await u2.getOrders()
			expect(aU2Orders.length).to.be.equal(u22Orders.length + 1)
			expect(addedOrders.length).to.be.equal(1)
			
      let droppedOrders = await u2.minusOrders(addedOrders)
      let mOrderItems = await u2.getOrders()
      expect(u22Orders.length).to.be.equal(mOrderItems.length)
      expect(droppedOrders.length).to.be.equal(1)
			
			await u2.setOrders([])
			let u222Orders = await u2.getOrders()
			expect(u222Orders.length).to.be.equal(0)
		});
		
		it('test hasMany through', async function() {
			let user = await snakeOrmProxy._Models.User.find(1)
			let orderItems = await user.getOrderItems()
			expect(orderItems.length > 0).to.be.ok
			for (let item of orderItems) {
				let order = await item.getOrder()
				expect(order.userId).to.be.equal(user.id)
			}
			
			let u2 = await snakeOrmProxy._Models.User.find(2)
			await u2.setOrderItems([new snakeOrmProxy._Models.OrderItem({name: 'has-many-through1'})])
			let orderItems1 = await u2.getOrderItems()
			expect(orderItems1.length).to.be.equal(1)
			
			await u2.setOrderItems([new snakeOrmProxy._Models.OrderItem({name: 'has-many-through2'})])
			let orderItems2 = await u2.getOrderItems()
			expect(orderItems2.length).to.be.equal(1)
			
			
			let insertedItems = await u2.addOrderItems({name: 'has-many-through3'})
      let aOrderItems2 = await u2.getOrderItems()
      expect(aOrderItems2.length).to.be.equal(orderItems2.length + 1)
      expect(insertedItems.length).to.be.equal(1)
			
			let droppedOrderItems = await u2.minusOrderItems(insertedItems)
			let mOrderItems = await u2.getOrderItems()
      expect(mOrderItems.length).to.be.equal(orderItems2.length)
      expect(droppedOrderItems.length).to.be.equal(1)
			
			await u2.setOrderItems([])
			let orderItems3 = await u2.getOrderItems()
			expect(orderItems3.length).to.be.equal(0)
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