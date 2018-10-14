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
	
	static getIndexName (field) {
		if (Array.isArray(field)) {
			return `\`idx_${field.join('_and_')}\``
		} else {
			return `\`idx_${field}\``
		}
	}
	
	constructor (options) {
		this.options = Object.assign({engine: 'InnoDB', charset: 'utf8', collate: 'utf8_unicode_ci'}, options)
		// create update
		this.subSqls = [`\`id\` Integer PRIMARY KEY AUTOINCREMENT`]
	}
	
	createTable (tableName, options, cb) {
		this.tableName = tableName
		cb (this)
		let sql =`CREATE TABLE IF NOT EXISTS \`${tableName}\` (${this.subSqls.join(', ')}) ENGINE=${this.options.engine} DEFAULT CHARSET=${this.options.charset} COLLATE ${this.options.collate};`
		console.log(sql)
	}
	
	dropTable (tableName) {
		let sql = `DROP TABLE \`${tableName};\``
		console.log(sql)
	}
	
	createColumn (tableName, field, type, options) {
		this._handleFieldColumn(field, type, options)
		let sql = `ALTER TABLE \`${tableName}\` ADD ${this.subSqls.join(', ')}`
		console.log(sql)
	}
	
	// only mysql
	renameColumn(tableName, oldName, newName, type, options) {
		this._handleFieldColumn(newName, type, options)
		let sql = `ALTER TABLE \`${tableName}\` CHANGE COLUMN \`${oldName}\` ${this.subSqls.join(',')}`
		console.log(sql)
	}
	
	removeColumn (tableName, field) {
		let sql = `ALTER TABLE \`${tableName}\` DROP \`${field}\``
		console.log(sql)
	}
	
	addIndex (tableName, field, options) {
		this._handleFieldColumn(field, undefined, Object.assign({index: true}, options))
		let sql = `CREATE ${this.subSqls.join(', ')} ON \`${tableName}\``
		console.log(sql)
	}
	
	removeIndex (tableName, field) {
		let sql = `ALTER TABLE \`${tableName}\` DROP INDEX ${this.constructor.getIndexName(field)};`
		console.log(sql)
	}
	
	_handleFieldColumn (field, type, options) {
		if (type) {
			let columnSqls = []
			if (type === 'string') {
				columnSqls.push(`\`${field}\` VARCHAR(255)`)
			}
			// options
			if (options['null'] === false) {
				columnSqls.push(`NOT NULL`)
			}
			if (options['default']) {
				columnSqls.push(`DEFAULT ${this.constructor.getSqlValue(options['default'])}`)
			}
			this.subSqls.push(columnSqls.join(' '))
		}
		// extra sub sql
		if (options['unique'] === true) {
			if (Array.isArray(field)) {
				this.subSqls.push(`UNIQUE INDEX ${this.constructor.getIndexName(field)}(${field.map(item => `\`${item}\``).join(', ')})`)
			} else {
				this.subSqls.push(`UNIQUE INDEX ${this.constructor.getIndexName(field)}(\`${field}\`)`)
			}
		} else if (options['index'] === true) {
			if (Array.isArray(field)) {
				this.subSqls.push(`INDEX ${this.constructor.getIndexName(field)}(${field.map(item => `\`${item}\``).join(', ')})`)
			} else {
				this.subSqls.push(`INDEX ${this.constructor.getIndexName(field)}(\`${field}\`)`)
			}
		}
	}
	
	string (field, options) {
		this._handleFieldColumn(field, 'string', options)
	}
	text (field, options) {
	}
	integer (field, options) {
	
	}
	decimal (field, options) {}
	boolean (field, options) {}
	date (field, options) {}
	datetime (field, options) {}
	timestamps () {}
	
	references (field, options) {}
}
module.exports = TableDefinition