const SnakeOrm = require('../../../index')
const expect = require('chai').expect

describe('Sqlite3 connect TEST', function() {
	it('should connect success', function() {
		let snakeOrm = new SnakeOrm('database_test.sqlite3', 'root', null, {dialect: 'sqlite3', host: 'localhost', debug: true})
		let snakeOrmProxy = SnakeOrm.getOrCreateSnakeOrmProxy('database_test.sqlite3', 'root', null, {dialect: 'sqlite3', host: 'localhost'})
		let connectOptions = snakeOrmProxy.connectOptions
		expect(snakeOrm.proxy).to.be.equal(snakeOrmProxy);
		expect(connectOptions).to.be.an('object');
		expect(connectOptions.dialect).to.be.equal('sqlite3');
		expect(snakeOrmProxy).to.be.equal(SnakeOrm.getOrmProxyByDatabase(connectOptions.database));
	});
})