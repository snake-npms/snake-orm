const SnakeOrm = require('../../../index')
const expect = require('chai').expect
const User = require('./support/models/User')
describe('Mysql query test', function() {
	let snakeOrm = new SnakeOrm('database_test', 'root', null, {dialect: 'mysql', host: 'localhost'})
	before(async function() {
		// 在本区块的所有测试用例之前执行
		// both snakeOrm.proxy.runSql and snakeOrm.dialect.runSql are ok!
		await snakeOrm.proxy.runSql(`DROP TABLE IF EXISTS users`)
		await snakeOrm.proxy.runSql(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTO_INCREMENT, username VARCHAR(20), age INTEGER)`)
		await snakeOrm.proxy.runSql(`INSERT INTO users(username, age) values('u1', 1)`)
		await snakeOrm.proxy.runSql(`INSERT INTO users(username, age) values('u2', 2)`)
		await snakeOrm.proxy.runSql(`INSERT INTO users(username, age) values('u3', 3)`)
		await snakeOrm.proxy.runSql(`INSERT INTO users(username, age) values('u4', 4)`)
		await snakeOrm.proxy.runSql(`INSERT INTO users(username, age) values('u0', 0)`)
		await snakeOrm.dialect.runSql(`INSERT INTO users(username, age) values('u5', 5)`)
		await snakeOrm.dialect.runSql(`INSERT INTO users(username, age) values('u6', null)`)
		await snakeOrm.dialect.runSql(`INSERT INTO users(username, age) values('u7', 7)`)
		await snakeOrm.dialect.runSql(`INSERT INTO users(username, age) values(null, 8)`)
		await snakeOrm.dialect.runSql(`INSERT INTO users(username, age) values('u9', 9)`)
		await snakeOrm.dialect.runSql(`INSERT INTO users(username, age) values('ua', 100)`)
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
		let users1 = await User.where({username: 'u1'})
		console.log(users1)
		expect(users1.length).to.be.equal(1)
		expect(users1[0].username).to.be.equal('u1')
		
		let users2 = await User.where('username = ?', 'u1')
		expect(users2.length).to.be.equal(1)
		expect(users2[0].username).to.be.equal('u1')
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
	
	it('after result do', async function() {
		let users = await User.where('age > ?', 0)
		expect(users.length > 5).to.be.ok
		let users1 = await users.where({username: 'u1'})
		expect(users1.length).to.be.equal(1)
		let users2 = await users.where({username: 'u2'})
		expect(users2.length).to.be.equal(1)
	});
	
});