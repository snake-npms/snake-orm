class Assignment {
	static get defaultRecordObject () {
		let defaultObject = {}
		if (this.schema) {
		}
		return defaultObject
	}
	
	constructor(object, options = {}) {
		let record = this.constructor.defaultRecordObject
		Object.defineProperty(this, '_options', {
			value: Object.assign({isNewRecord: true}, options),
			writable: false
		})
		if (!this._options.isNewRecord) {
			record = Object.assign(record, object)
		}
		this._record = record
		Object.defineProperties(this, {
			_record: {
				value: record,
				writable: false
			},
			_changedAttributes: {
				value: {},
				writable: false
			}
		})
		for (let key in Object.assign({}, this._record, object)) {
			this.addGetSetAttribute(key)
		}
		if (this._options.isNewRecord) {
			for (let key in object) {
				this[key] = object[key]
			}
		}
	}
	
	addGetSetAttribute (key) {
		Object.defineProperty(this, key, {
			get() {
				return this._record[key]
			},
			set (val) {
				if (this._record[key] !== val) {
					if (this._changedAttributes[key]) {
						if (this._changedAttributes[key].oldValue === val) {
							delete this._changedAttributes[key]
						} else {
							this._changedAttributes[key].newValue = val
						}
					} else {
						this._changedAttributes[key] = {
							oldValue: this._record[key],
							newValue: val
						}
					}
				}
				this._record[key] = val
			}
		})
	}
	
	__cleanChangedAttributes () {
		for (let key in this._changedAttributes) {
			delete this._changedAttributes[key]
		}
	}
}
module.exports = Assignment