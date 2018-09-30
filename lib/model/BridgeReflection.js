const Validation = require('./Validation')
const Reflection = require('./Reflection')
class BridgeRelation extends Validation {
	static get newReflection () {
		return Reflection.cloneReflection(new Reflection(this))
	}
	// query
	// static find (options) { return this.newRelation.find(...arguments) }
	static find (valueOfPrimaryKey) { return this.newReflection.find(...arguments) }
	static findBy (options) { return this.newReflection.findBy(...arguments) }
	static where (options) { return this.newReflection.where(...arguments) }
	static order (options) { return this.newReflection.order(...arguments) }
	static limit (limit) { return this.newReflection.limit(...arguments) }
	static offset (offset) { return this.newReflection.offset(...arguments) }
	static count () { return this.newReflection.count(...arguments) }
	static sum (field) { return this.newReflection.sum(...arguments) }
	static avg (field) { return this.newReflection.avg(...arguments) }
	
	// create
	static create(object, blockAfn) { return this.newReflection.create(...arguments) }
	
	// update
	
	// destroy
	constructor () {
		super(...arguments)
	}
}
module.exports = BridgeRelation