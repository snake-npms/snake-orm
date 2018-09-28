let DialectProxy = require('./dialect')
let snakeOrms = {}
let lastSnakeOrm = null
class SnakeOrm {
	static sharedSnakeOrmProxy (database) {
		if (!database && lastSnakeOrm) {
			return lastSnakeOrm
		} else if (database && snakeOrms[database]) {
			return snakeOrms[database]
		} else {
			console.error(database, 'cannot get orm instance.')
		}
	}
	constructor (database, username, password, otherConnectOptions) {
		if (snakeOrms[database]) {
			return snakeOrms[database]
		}
		this.connectOptions = Object.assign({database, username, password, dialect: 'sqlite3'}, otherConnectOptions)
		this.dialect = new Proxy(new DialectProxy(this.connectOptions), {
			get (target, prop) {
				if (target[prop]) {
					return target[prop];
				} else {
					return target['dialect'][prop]
				}
			}
		})
		let snakeOrmProxy = new Proxy(this, {
			get (target, prop) {
				if (target[prop]) {
					return target[prop];
				} else {
					return target['dialect'][prop]
				}
			}
		})
		snakeOrms[database] = snakeOrmProxy
		lastSnakeOrm = snakeOrmProxy
	}
	
	get proxy () {
		return snakeOrms[this.connectOptions.database]
	}
}
module.exports = SnakeOrm