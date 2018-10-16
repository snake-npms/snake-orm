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
	
	static async initWithSnakeOrmRcFile (rcFilePath) {
		rcFilePath = rcFilePath || path.resolve('.snakeormrc')
		let rcConfig = require(rcFilePath)
		let connectOptions = require(rcConfig['config'])
		let env = process.env.NODE_ENV || 'development'
		console.log(`snake-orm will init on ${env} environment`)
		connectOptions = Object.assignDeep(connectOptions, connectOptions[env])
		new SnakeOrm(connectOptions.database, connectOptions.username, connectOptions.password, connectOptions)
		let ormProxy = snakeOrms[connectOptions.database]
		// --- auto run migration
		if (connectOptions['autoMigrate']) {
			await ormProxy.withTransaction(async () => {
				await ormProxy.runMigrations(rcConfig['migrations-path'])
			})
		}
		await ormProxy.registerModelsWithPath(rcConfig['models-path'], rcConfig['models-path-files-ignore'] || [])
		return ormProxy
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
	
	async runMigrations (migrationPath) {
		await this.proxy.runSql(`CREATE TABLE IF NOT EXISTS schema_migrations (version VARCHAR(255))`)
		let files = fs.readdirSync(migrationPath).filter((file) => {
			let stats = fs.lstatSync(path.resolve(migrationPath, file))
			return file.indexOf('.') !== 0 && stats.isFile()
		})
		for (let file of files) {
			let result = await this.proxy.runSql(`SELECT \`schema_migrations\`.* from \`schema_migrations\` where \`version\` = ?`, file)
			if (result.length === 0) {
				await this.proxy.runSql(`INSERT INTO schema_migrations(version) values (?)`, file)
				let migration = require(path.resolve(migrationPath, file))
				await migration.up(this.proxy)
			}
		}
	}
	
	async registerModelsWithPath (modelsPath, skipFiles = []) {
		fs.readdirSync(modelsPath).filter((file) => {
			let stats = fs.lstatSync(path.resolve(modelsPath, file))
			return file.indexOf('.') !== 0 && stats.isFile() && skipFiles.indexOf(file) === -1
		}).forEach((file) => {
			let Model = require(path.resolve(modelsPath, file))
			if (Model && Model.prototype instanceof this.constructor.SnakeModel && Model.database === this.connectOptions.database) {
				this._Models[Model.name] = Model
			}
		})
		// model init data before onRegister
		for (let key in this._Models) {
			await this._Models[key]['__beforeOnRegisterInit']()
		}
		for (let key in this._Models) {
			this._Models[key]['onRegister'] && this._Models[key]['onRegister']()
		}
	}
}
module.exports = SnakeOrm