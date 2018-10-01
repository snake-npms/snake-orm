const SnakeOrm = require('../../../index')
const expect = require('chai').expect

describe('Sqlite3 connect TEST', function() {
	it('should connect success', function() {
		let snakeOrmProxy = SnakeOrm.getOrCreateSnakeOrmProxy('database_test.sqlite3', 'root', null, {dialect: 'sqlite3', host: 'localhost'})
		let connectOptions = snakeOrmProxy.connectOptions
		expect(connectOptions).to.be.an('object');
		expect(connectOptions.dialect).to.be.equal('sqlite3');
		expect(snakeOrmProxy).to.be.equal(SnakeOrm.getOrmProxyByDatabase(connectOptions.database));
	});
})