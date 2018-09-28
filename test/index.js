const SnakeOrm = require('../index')
const User = require('./models/User')
// new SnakeOrm('database_development', 'root', null, {dialect: 'mysql', host: 'localhost'})
new SnakeOrm('database_development.sqlite3', 'root', null, {dialect: 'sqlite3', host: 'localhost'})

async function test() {
	await SnakeOrm.sharedSnakeOrmProxy().runSql(`CREATE TABLE IF NOT EXISTS users (username VARCHAR(20), age INTEGER)`)
	let result = await User.where({username: 'create'}).order([{username: 'desc'}, 'age']).sum('age')
	console.log(result)
}
test()