const SnakeOrm = require('../../../index')
const expect = require('chai').expect

describe('Mysql connect TEST', function() {
	it('should connect success', function() {
		let snakeOrm = new SnakeOrm('database_test', 'root', null, {dialect: 'mysql', host: 'localhost', logger: true})
		let snakeOrmProxy = SnakeOrm.getOrCreateSnakeOrmProxy('database_test', 'root', null, {dialect: 'mysql', host: 'localhost'})
		let connectOptions = snakeOrmProxy.proxy.connectOptions
		expect(snakeOrm.proxy).to.be.equal(snakeOrmProxy);
		expect(connectOptions).to.be.an('object');
		expect(connectOptions.dialect).to.be.equal('mysql');
		expect(snakeOrmProxy).to.be.equal(SnakeOrm.getOrmProxyByDatabase(connectOptions.database));
	});
})