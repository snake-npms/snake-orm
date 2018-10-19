var pluralize = require('pluralize')
class TableDefinition {
	
	static getSqlValue (value) {
		if (value === null || typeof value === 'number') {
			return value
		} else {
			return `'${value}'`
		}
	}
	
	static getSqlType (type) {
		if (type === 'string') {
			return `VARCHAR(255)`
		}
		return type
	}
	
	static getForeignKeyName (tableName, field) {
		if (Array.isArray(field)) {
			return `\`fk_${tableName}_on_${field.join('_and_')}\``
		} else {
			return `\`fk_${tableName}_on_${field}\``
		}
	}
	
	static getIndexName (tableName, field) {
		if (Array.isArray(field)) {
			return `\`idx_${tableName}_on_${field.join('_and_')}\``
		} else {
			return `\`idx_${tableName}_on_${field}\``
		}
	}
	
	constructor (dialectProxy) {
		this.dialectProxy = dialectProxy
		let connectOptions = dialectProxy && dialectProxy.dialect && dialectProxy.dialect.connectOptions || {}
		this.connectedOptions = Object.assign({engine: 'InnoDB', charset: 'utf8', collate: 'utf8_unicode_ci'}, connectOptions)
		// create update
		this.subSqlClause = []
		// subSqlClause some clause should put in last, use this
		this.subSqlClauseLast = []
		this.extraSqls = []
	}
	
	createTable (tableName, options, cb) {
		this.tableName = tableName
		if (this.connectedOptions.dialect === 'mysql') {
			this.subSqlClause.push(`\`id\` Integer PRIMARY KEY AUTO_INCREMENT`)
		} else {
			this.subSqlClause.push(`\`id\` Integer PRIMARY KEY AUTOINCREMENT`)
		}
		cb && cb (this)
		let sql =`CREATE TABLE IF NOT EXISTS \`${tableName}\` (${this.subSqlClause.concat(this.subSqlClauseLast).join(', ')})`
		switch (this.connectedOptions.dialect) {
			case 'mysql':
				sql = `${sql} ENGINE=${this.connectedOptions.engine} DEFAULT CHARSET=${this.connectedOptions.charset} COLLATE ${this.connectedOptions.collate}`
		}
		return [sql].concat(this.extraSqls)
	}
	
	addIndex (tableName, field, options) {
		this.tableName = tableName
		this._handleFieldColumn(field, undefined, Object.assign({index: true}, options))
		return this.extraSqls
	}
	
	addColumn (tableName, field, type, options) {
		this.tableName = tableName
		this._handleFieldColumn(field, type, options)
		let sql = `ALTER TABLE \`${tableName}\` ADD ${this.subSqlClause.concat(this.subSqlClauseLast).join(', ')}`
		return [sql].concat(this.extraSqls)
	}
	
	// not support sqlite3
	async renameColumn(tableName, oldName, newName, type, options) {
		this.tableName = tableName
		this._handleFieldColumn(newName, type, options)
		let sql = `ALTER TABLE \`${tableName}\` CHANGE COLUMN \`${oldName}\` ${this.subSqlClause.join(',')}`
		if (this.connectedOptions.dialect === 'sqlite3') {
			let tableInfo = await this.dialectProxy.runSql(`PRAGMA table_info('${tableName}')`)
			let fields = tableInfo.map(fieldInfo => fieldInfo.name)
			fields.splice(fields.indexOf(oldName), 1, `${oldName} as ${newName}`)
			let tmpTableName = `temporary_${tableName}_backup`
			let createSql = (await this.dialectProxy.runSql(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}'`))[0].sql
			let createTmpTableSql = createSql.replace(`\`${tableName}\``, `\`${tmpTableName}\``).replace(`\"${tableName}\"`, `\`${tmpTableName}\``).replace(`\`${oldName}\``, `\`${newName}\``)
			await this.dialectProxy.runSql(createTmpTableSql)
			await this.dialectProxy.runSql(`INSERT INTO \`${tmpTableName}\` SELECT ${fields.join(', ')} FROM ${tableName}`)
			await this.dialectProxy.runSql(this.dropTable(tableName)[0])
			await this.dialectProxy.runSql(this.renameTable(tmpTableName, tableName)[0])
			return []
		}
		return [sql].concat(this.extraSqls)
	}
	
	async removeColumn (tableName, field) {
		this.tableName = tableName
		let sql = `ALTER TABLE \`${tableName}\` DROP COLUMN \`${field}\``
		if (this.connectedOptions.dialect === 'sqlite3') {
			let tableInfo = await this.dialectProxy.runSql(`PRAGMA table_info('${tableName}')`)
			let fields = tableInfo.map(fieldInfo => fieldInfo.name)
			fields.splice(fields.indexOf(field), 1)
			let tmpTableName = `temporary_${tableName}_backup`
			let createSql = (await this.dialectProxy.runSql(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}'`))[0].sql
			let createTmpTableSql = createSql.replace(`\`${tableName}\``, `\`${tmpTableName}\``)
				.replace(`\"${tableName}\"`, `\`${tmpTableName}\``)
				.replace(new RegExp(`\`${field}.*?,`, '')).replace('undefined ', '')
			await this.dialectProxy.runSql(createTmpTableSql)
			await this.dialectProxy.runSql(`INSERT INTO \`${tmpTableName}\` SELECT ${fields.join(', ')} FROM ${tableName}`)
			await this.dialectProxy.runSql(this.dropTable(tableName)[0])
			await this.dialectProxy.runSql(this.renameTable(tmpTableName, tableName)[0])
			return []
		}
		return [sql]
	}
	
	renameTable (tableName, newTableName) {
		this.tableName = tableName
	 	let sql = `ALTER TABLE \`${tableName}\` RENAME TO \`${newTableName}\``
		return [sql].concat(this.extraSqls)
	}
	
	dropTable (tableName) {
		this.tableName = tableName
		let sql = `DROP TABLE \`${tableName}\``
		return [sql]
	}
	
	
	removeIndex (tableName, field) {
		this.tableName = tableName
		let sql = `DROP INDEX ${this.constructor.getIndexName(tableName, field)}`
		if (this.connectedOptions.dialect === 'mysql') {
			sql = `ALTER TABLE \`${tableName}\` DROP INDEX ${this.constructor.getIndexName(tableName, field)};`
		}
		return [sql]
	}
	
	_handleFieldColumn (field, type, options) {
		options = options || {}
		if (type) {
			let columnSqls = []
			if (type === 'string') {
				columnSqls.push(`\`${field}\` VARCHAR(255)`)
			} else if (type === 'text') {
				columnSqls.push(`\`${field}\` text`)
			} else if (type === 'integer') {
				columnSqls.push(`\`${field}\` int(${options['limit'] || 11})`)
			} else if (type === 'decimal') {
				columnSqls.push(`\`${field}\` decimal(${options['precision'] || 10}, ${options['scale'] || 2})`)
			} else if (type === 'boolean') {
				if (this.connectedOptions.dialect === 'mysql') {
					columnSqls.push(`\`${field}\` tinyint(1)`)
				} else {
					columnSqls.push(`\`${field}\` boolean`)
				}
			} else if (type === 'date') {
				columnSqls.push(`\`${field}\` date`)
			} else if (type === 'datetime') {
				columnSqls.push(`\`${field}\` datetime`)
			}
			// options
			if (options['null'] === false) {
				columnSqls.push(`NOT NULL`)
			}
			if ('default' in options) {
				columnSqls.push(`DEFAULT ${this.constructor.getSqlValue(options['default'])}`)
			}
			this.subSqlClause.push(columnSqls.join(' '))
		}
		// extra sub sql
		if (options['unique']) {
			let sort = ''
			if (/DESC/gi.test(options['unique'])) {
				sort = 'DESC'
			} else if (/ASC/gi.test(options['unique'])) {
				sort = 'ASC'
			}
			if (Array.isArray(field)) {
				this.extraSqls.push(`CREATE UNIQUE INDEX ${this.constructor.getIndexName(this.tableName, field)} ON \`${this.tableName}\`(${field.map(item => `\`${item}\` ${sort}`).join(', ')})`)
			} else {
				this.extraSqls.push(`CREATE UNIQUE INDEX ${this.constructor.getIndexName(this.tableName, field)} ON \`${this.tableName}\`(\`${field}\` ${sort})`)
			}
		} else if (options['index'] === true) {
			let sort = ''
			if (/DESC/gi.test(options['unique'])) {
				sort = 'DESC'
			} else if (/ASC/gi.test(options['unique'])) {
				sort = 'ASC'
			}
			if (Array.isArray(field)) {
				this.extraSqls.push(`CREATE INDEX ${this.constructor.getIndexName(this.tableName, field)} ON \`${this.tableName}\`(${field.map(item => `\`${item}\` ${sort}`).join(', ')})`)
			} else {
				this.extraSqls.push(`CREATE INDEX ${this.constructor.getIndexName(this.tableName, field)} ON \`${this.tableName}\`(\`${field}\` ${sort})`)
			}
		} else if (options['foreignKey']) {
			let table = pluralize.plural(field.replace(/id$/gi, '')).toVarCase()
			let subClause = `FOREIGN KEY (\`${field}\`) REFERENCES ${table}(\`id\`)`
			if (this.connectedOptions.dialect === 'mysql') {
				subClause = `${subClause} ON DELETE CASCADE ON UPDATE CASCADE`
			}
			this.subSqlClauseLast.push(subClause)
			// this.extraSqls.push(`ALTER TABLE \`${this.tableName}\` ADD CONSTRAINT ${this.constructor.getForeignKeyName(field)} FOREIGN KEY(\`${field}\`) REFERENCES \`${table}\`(\`id\`)`)
		}
	}
	
	string (field, options) {
		this._handleFieldColumn(field, 'string', options)
	}
	text (field, options) {
		this._handleFieldColumn(field, 'text', options)
	}
	integer (field, options) {
		this._handleFieldColumn(field, 'integer', options)
	}
	decimal (field, options) {
		this._handleFieldColumn(field, 'decimal', options)
	}
	boolean (field, options) {
		this._handleFieldColumn(field, 'boolean', options)
	}
	date (field, options) {
		this._handleFieldColumn(field, 'date', options)
	}
	datetime (field, options) {
		this._handleFieldColumn(field, 'datetime', options)
	}
	timestamps (fields, options) {
		options = Object.assign({null: false}, options)
		fields = fields || ['createdAt', 'updatedAt']
		fields.forEach(field => {
			this._handleFieldColumn(field, 'datetime', options)
		})
	}
	references (model, options) {
		this._handleFieldColumn(`${model}Id`, 'integer', options)
	}
}
module.exports = TableDefinition