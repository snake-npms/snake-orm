class Assignment {
	constructor(object, options = {}) {
		let initRecord = Object.assign(this.constructor._defaultValues, object)
		this._record = initRecord
		Object.defineProperties(this, {
			_options: {
				value: Object.assign({isNewRecord: true}, options),
				writable: false
			},
			_record: {
				value: initRecord,
				writable: false
			},
			_defaultRecord: {
				value: this.constructor._defaultValues,
				writable: false
			},
			_changedAttributes: {
				value: {},
				writable: false
			}
		})
		Object.keys(this._record).forEach(key => {
      this.set(key, this._record[key], this.isNewRecord() ? null : this._record[key])
		})
	}
	
	isNewRecord () {
		return this._options.isNewRecord
	}
	
	set (key, value, defaultValue = null) {
		this._addGetSetAttribute(key, defaultValue)
		this[key] = value
		if (key === (this.constructor._primaryKey || 'id') && value) {
			this._options.isNewRecord = false
		}
	}
	
	_addGetSetAttribute (key, defaultValue = null) {
		if (this.hasOwnProperty(key)) {
			return
		}
		this['_defaultRecord'][key] = defaultValue
		Object.defineProperty(this, key, {
			get() {
				// date/datetime try transfer string to Date
				if (this._record[key] && /^date/gi.test(this.constructor._schema[key] && this.constructor._schema[key].type)) {
					return new Date(this._record[key])
				}
				return this._record[key]
			},
			set (val) {
				if (val === this['_defaultRecord'][key]) {
					if (this._changedAttributes[key]) {
						delete this._changedAttributes[key]
					}
				} else {
					this._changedAttributes[key] = {
						oldValue: defaultValue,
						newValue: val
					}
				}
				this._record[key] = val
			}
		})
	}
  
  async __resetDefaultRecord () {
		Object.keys(this['_changedAttributes']).forEach(key => {
      delete this['_changedAttributes'][key]
		})
		Object.assign(this['_defaultRecord'], this._record)
	}
 
  async __runCallback (funcs) {
	  for (let func of funcs) {
	    console.log(func)
	    await this[func]()
    }
	}
	
  async __onBeforeSave () {
		await this.__runCallback(this.constructor['beforeSave'])
  }
  async __onBeforeCreate () {
    if ('createdAt' in this) {
      this.createdAt = new Date()
    }
    if ('updatedAt' in this) {
      this.updatedAt = new Date()
    }
    await this.__runCallback(this.constructor['beforeCreate'])
  }
  async __onAfterCreate () {
    await this.__runCallback(this.constructor['afterCreate'])
  }
  async __onBeforeUpdate () {
    if ('updatedAt' in this) {
      this.updatedAt = new Date()
    }
    await this.__runCallback(this.constructor['beforeUpdate'])
  }
  async __onAfterUpdate () {
    await this.__runCallback(this.constructor['afterUpdate'])
  }
  async __onAfterSave () {
    await this.__runCallback(this.constructor['afterSave'])
  }
}
module.exports = Assignment