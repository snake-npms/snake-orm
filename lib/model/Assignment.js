class Assignment {
	constructor(object, options = {}) {
		let initRecord = Object.assign(this.constructor._defaultSchema, object)
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
				value: {},
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
	
	__resetDefaultRecord () {
		Object.keys(this['_changedAttributes']).forEach(key => {
      delete this['_changedAttributes'][key]
		})
		Object.assign(this['_defaultRecord'], this._record)
	}
}
module.exports = Assignment