const Relation = require('./Relation')
class BridgeRelation {
	static get newRelation () {
		return new Proxy(new Relation(this), {
			get (target, prop) {
				if (target[prop]) {
					return target[prop];
				} else if (prop === 'then') {
					let promise = target.runSql()
					return promise.then.bind(promise)
				}
			}
		})
	}
	// query
	static where (options) { return this.newRelation.where(...arguments) }
	static limit (limit) { return this.newRelation.limit(...arguments) }
	static offset (offset) { return this.newRelation.offset(...arguments) }
	
	// create
	
	// update
	
	// destroy
	constructor () {
	}
}
module.exports = BridgeRelation