const DialectProxy = require('./dialect')
const createSnakeModel = require('./model')
const fs = require('fs')
const path = require('path')
let snakeOrms = {}
let lastSnakeOrm = null
class SnakeOrm {
	static get SnakeModel () {
		return createSnakeModel(SnakeOrm)
	}
	
	// create a new orm
	static getOrCreateSnakeOrmProxy (database, username, password, otherConnectOptions) {
		if (!snakeOrms[database]) {
			new SnakeOrm(database, username, password, otherConnectOptions)
		}
		return snakeOrms[database]
	}
	
	/**
	 * get have connected orm, if identity is null, will get last Create Orm
	 * identity is value you create Proxy pass, if not, the database name is identify
	 */
	static getOrmProxyByDatabase (database) {
		if (!database && lastSnakeOrm) {
			return lastSnakeOrm
		} else if (database && snakeOrms[database]) {
			return snakeOrms[database]
		} else {
			console.error(database, 'cannot get orm instance.')
		}
	}
	
	constructor (database, username, password, otherConnectOptions) {
		console.assert(database, 'database must exist!')
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
		
		Object.defineProperties(this, {
			_Models: {
				value: {},
				writable: false
			}
		})
	}
	
	get proxy () {
		return snakeOrms[this.connectOptions.database]
	}
	
	registerModelsWithPath (modelsPath, skipFiles = []) {
		fs.readdirSync(modelsPath).filter((file) => {
			let stats = fs.lstatSync(path.resolve(modelsPath, file))
			return file.indexOf('.') !== 0 && stats.isFile() && skipFiles.indexOf(file) === -1
		}).forEach((file) => {
			let Model = require(path.resolve(modelsPath, file))
			if (Model && Model.prototype instanceof this.constructor.SnakeModel && Model.database === this.connectOptions.database) {
				this._Models[Model.name] = Model
				
			}
		})
		for (let key in this._Models) {
			this._Models[key].onRegister()
		}
	}
}
module.exports = SnakeOrm