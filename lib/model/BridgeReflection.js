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
	static all () { return this.newReflection.where({}) }
	static where (options, ...args) { return this.newReflection.where(...arguments) }
	static not (options) { return this.newReflection.not(...arguments) }
	static group (fields) { return this.newReflection.group(...arguments) }
	static having (options, ...args) { return this.newReflection.having(...arguments) }
	static order (options) { return this.newReflection.order(...arguments) }
	static select (fields) { return this.newReflection.select(...arguments) }
	static limit (limit) { return this.newReflection.limit(...arguments) }
	static offset (offset) { return this.newReflection.offset(...arguments) }
	static paginate (page = 1, perPage = 20) { return this.newReflection.paginate(...arguments) }
	static count () { return this.newReflection.count(...arguments) }
	static sum (field) { return this.newReflection.sum(...arguments) }
	static avg (field) { return this.newReflection.avg(...arguments) }
	static min (field) { return this.newReflection.min(...arguments) }
	static max (field) { return this.newReflection.max(...arguments) }
	
	static findOrCreateBy (object, blockAfn) { return this.newReflection.findOrCreateBy(...arguments) }
	
	// create
	static create(object, blockAfn) { return this.newReflection.create(...arguments) }
	
	// update
	static updateAll(object) { return this.newReflection.updateAll(...arguments) }
	
	// destroy
	constructor () {
		super(...arguments)
	}
}
module.exports = BridgeRelation