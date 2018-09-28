class Assignment {
	constructor(values) {
		this._record = values || {}
		Object.defineProperty(this, '_record', {
			value: values || {},
			writable: false
		})
		for (let key in this._record) {
			this.set(key, this._record[key])
		}
	}
	
	set (key, value) {
		this._record[key] = value
		this[key] = value
		Object.defineProperty(this, key, {
			get() {
				return this._record[key]
			},
			set (val) {
				this._record[key] = val
			}
		})
	}
}
module.exports = Assignment