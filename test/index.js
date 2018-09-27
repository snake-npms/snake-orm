const SnakeOrm = require('../index')
const User = require('./models/User')
new SnakeOrm('database_development', 'root', null, {dialect: 'mysql', host: 'localhost'})

async function test() {
	let result = await User.where({username: 'create'}).order([{username: 'desc'}, 'age']).sum('age')
	console.log(result)
}
test()