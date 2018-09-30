const SnakeOrm = require('../index')
const User = require('./dialect/sqlite3/support/models/User')
// new SnakeOrm('database_development', 'root', null, {dialect: 'mysql', host: 'localhost'})
let snakeOrm = new SnakeOrm('database_test.sqlite3', 'root', null, {dialect: 'sqlite3', host: 'localhost', debug: true})

async function test() {
	// await snakeOrm.proxy.runSql(`DROP TABLE IF EXISTS users`)
	await snakeOrm.proxy.runSql(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(20), age INTEGER)`)
	let result = await User.where({username: 'create'}).order([{username: 'desc'}, 'age']).sum('age')
	console.log(result)
	console.log('==========')
	console.log('is', await User.create({username: 'zhangsan', age: 3}))
	console.log('-----------')
	// let u = await User.findBy({username: 'zhangsan'})
	// u.username = 'lisi'
	// console.log(u)
	// console.log(await u.save())
}
test()