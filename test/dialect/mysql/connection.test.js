const SnakeOrm = require('../../../index')
const expect = require('chai').expect

describe('Mysql connect TEST', function() {
	it('should connect success', function() {
		let snakeOrmProxy = SnakeOrm.getOrCreateSnakeOrmProxy('database_test', 'root', null, {dialect: 'mysql', host: 'localhost'})
		let connectOptions = snakeOrmProxy.proxy.connectOptions
		expect(connectOptions).to.be.an('object');
		expect(connectOptions.dialect).to.be.equal('mysql');
		expect(snakeOrmProxy).to.be.equal(SnakeOrm.getOrmProxyByDatabase(connectOptions.database));
	});
})