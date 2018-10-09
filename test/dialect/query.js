const expect = require('chai').expect
module.exports = function (snakeOrmProxy, User) {
	describe('modify test', function() {
		it('PrimaryKey', async function() {
			let primaryKeys = await User.getPrimaryKeys()
			expect(primaryKeys.length > 0).to.be.ok
			
			let primaryKey = await User.getPrimaryKey()
			expect(primaryKey).to.be.equal('id')
		});
		
		it('find', async function() {
			let u1 = await User.find(1)
			expect(u1.id).to.be.equal(1)
			
			let errThrow = null
			try {
				await User.find(999999999)
			} catch (err) {
				errThrow = err
			}
			expect(errThrow).to.be.ok
		});
		
		it('findBy', async function() {
			let u1 = await User.findBy({username: 'u1', age: 1})
			expect(u1.username).to.be.equal('u1')
			
			let u2 = await User.findBy('username = ? AND age = ?', 'u2', 2)
			expect(u2.username).to.be.equal('u2')
			
			let users3 = await User.findBy({username: 'u--u'})
			expect(!users3).to.be.ok
		});
		
		it('where', async function() {
			let users = await User.where({age: 1})
			
			let users1 = await User.where({username: 'u1', age: 1})
			expect(users1.length).to.be.equal(1)
			expect(users1[0].username).to.be.equal('u1')
			
			let users2 = await User.where('username = ?', 'u1')
			expect(users2.length).to.be.equal(1)
			expect(users2[0].username).to.be.equal('u1')
			
			let users3 = await User.where({username: ['u1', 'u2']})
			expect(users3.length).to.be.equal(2)
			
			let users5 = await User.where('age > 0')
			let users6 = await users5.where({username: 'ua'})
			expect(users6[0].username).to.be.equal('ua')
		});
		
		it('not where', async function() {
			let users = await User.not({username: 'u1'})
			let exist = false
			users.forEach(u => {
				if (u.username === 'u1') {
					exist = true
				}
			})
			expect(exist).to.be.equal(false)
			
			users = await User.not({username: ['u1', 'u2']})
			exist = false
			users.forEach(u => {
				if (u.username === 'u1' || u.username === 'u2') {
					exist = true
				}
			})
			expect(exist).to.be.equal(false)
			
			let allCount = await User.count()
			let users2 = await User.not({username: null})
			expect(allCount > users2.length && users2.length).to.be.ok
		});
		
		it('joins', async function() {
			let users0 = await User.joins('inner join orders on orders.userId = users.id').joins('inner join wallets on wallets.userId = users.id')
			expect(users0.length > 0).to.be.ok
			
			let users1 = await User.joins('inner join orders on orders.userId = users.id')
			expect(users1.length > 0).to.be.ok
			
			let users2 = await User.joins('inner join orders on orders.userId = users.id').distinct()
			expect(users2.length > 0 && users2.length < users1.length).to.be.ok
		})
		
		it('select', async function() {
			let users1 = await User.where({username: 'ua'}).select('username')
			expect(users1[0].username).to.be.equal('ua')
			expect(users1[0].id).to.be.equal(undefined)
			expect(users1[0].age).to.be.equal(undefined)
			
			let users2 = await User.where({username: 'ua'}).select('username', 'age')
			expect(users2[0].username).to.be.equal('ua')
			expect(users2[0].id).to.be.equal(undefined)
			expect(users2[0].age).to.be.equal(100)
			
			let users3 = await User.where({username: 'ua'}).select(['username', 'age'])
			expect(users3[0].username).to.be.equal('ua')
			expect(users3[0].id).to.be.equal(undefined)
			expect(users3[0].age).to.be.equal(100)
		});
		
		it('group', async function() {
			let users1 = await User.where({username: 'ua'}).group('username').select('username')
			expect(users1.length).to.be.equal(1)
			expect(users1[0].username).to.be.equal('ua')
		});
		
		it('having', async function() {
			let users1 = await User.group('username').select('username')
			let users2 = await User.group('username', 'age').having('age > 10').select('username', 'age')
			expect(users1.length > users2.length).to.be.ok
			let users21 = await User.group('username', 'age').having('age > ?', 10).select('username', 'age')
			expect(users2.length).to.be.equal(users21.length)
			
			
			let users3 = await User.group('username', 'age').having({age: 100, username: 'ua'}).select('username', 'age')
			expect(users3.length).to.be.equal(1)
			expect(users3[0].username).to.be.equal('ua')
		});
		
		it('order', async function() {
			let users1 = await User.order('username')
			expect(users1[0].username).to.be.equal(null)
			users1 = await User.order('username asc')
			expect(users1[0].username).to.be.equal(null)
			users1 = await User.order('age desc')
			expect(users1[0].age).to.be.equal(100)
			
			let users2 = await User.where('username is not null').order('username')
			expect(users2[0].username).to.be.equal('u0')
			
			let users3 = await User.order(['age desc', 'username'])
			expect(users3[0].age).to.be.equal(100)
			
			let users4 = await User.order([{age: 'desc'}, 'username'])
			expect(users4[0].age).to.be.equal(100)
		});
		
		it('count', async function() {
			let countUser = await User.count()
			expect(countUser).to.be.a('number');
			expect(countUser > 5).to.be.ok
		});
		
		it('sum', async function() {
			let sumAge = await User.sum('age')
			expect(sumAge > 100).to.be.ok;
			expect(sumAge).to.be.a('number');
			
			let sumUsername = await User.sum('username')
			expect(sumUsername === 0).to.be.ok;
			expect(sumUsername).to.be.a('number');
		});
		
		it('avg', async function() {
			let avgAge = await User.avg('age')
			expect(avgAge > 1).to.be.ok;
			expect(avgAge).to.be.a('number');
		});
		
		it('min', async function() {
			let minAge = await User.min('age')
			expect(minAge).to.be.equal(0);
		});
		
		it('max', async function() {
			let maxAge = await User.max('age')
			expect(maxAge > 99).to.be.ok;
		});
		
		it('limit', async function() {
			let users1 = await User.limit(1)
			expect(users1.length).to.be.equal(1);
			let users2 = await User.limit(5)
			expect(users2.length).to.be.equal(5);
		});
		
		it('offset', async function() {
			let users1 = await User.limit(5)
			let users2 = await User.limit(5).offset(1)
			expect(users1[1].id).to.be.equal(users2[0].id)
		});
		
		it('paginate', async function() {
			let users1 = await User.paginate(1, 2)
			let users2 = await User.paginate(2, 2)
			let users3 = await User.paginate(3, 2)
			let allUsers = await User.all()
			expect(users1[0].id == allUsers[0].id).to.be.ok
			expect(users1[0].id + 2 == users2[0].id).to.be.ok
			expect(users2[0].id + 2 == users3[0].id).to.be.ok
		});
		
		it('after result do', async function() {
			let users = await User.where('age > ?', 0)
			expect(users.length > 5).to.be.ok
			let users1 = await users.where({username: 'u1'})
			expect(users1.length).to.be.equal(1)
			let users2 = await users.where({username: 'u2'})
			expect(users2.length).to.be.equal(1)
		});
	})
}
