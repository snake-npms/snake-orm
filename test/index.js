const SnakeOrm = require('../index')
const User = require('./dialect/sqlite3/support/models/User')
// new SnakeOrm('database_development', 'root', null, {dialect: 'mysql', host: 'localhost'})
let snakeOrm = new SnakeOrm('database_test.sqlite3', 'root', null, {dialect: 'sqlite3', host: 'localhost', debug: true})

// async function test() {
// 	// await snakeOrm.proxy.runSql(`DROP TABLE IF EXISTS users`)
// 	await snakeOrm.proxy.runSql(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(20), age INTEGER)`)
// 	let result = await User.where({username: 'create'}).order([{username: 'desc'}, 'age']).sum('age')
// 	console.log(result)
//
// 	var http = require("http");
// 	http.createServer(async function(request, response) {
// 		response.writeHead(200, {"Content-Type": "text/plain"});
// 		console.log(1)
// 		let u = await User.create({username: 'zhangsan3'})
// 		console.log(2)
// 		response.write(JSON.stringify(u))
// 		response.end();
// 	}).listen(8888);
// 	console.log("nodejs start listen 8888 port!");
// }
// test()

async function test() {
	// await snakeOrm.proxy.runSql(`DROP TABLE IF EXISTS users`)
	await snakeOrm.proxy.runSql(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(20), age INTEGER)`)
	await User.create({username: 'create'})
	await User.create({username: 'create2'})
	await User.create({username: 'create2'})
	console.log('--------')
	console.log(await User.group('username', 'age'))
}
test()