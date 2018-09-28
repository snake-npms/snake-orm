const Assignment = require('./Assignment')
const Relation = require('./Relation')
class BridgeRelation extends Assignment {
	static get newRelation () {
		return Relation.cloneRelation(new Relation(this))
	}
	// query
	// static find (options) { return this.newRelation.find(...arguments) }
	static findBy (options) { return this.newRelation.findBy(...arguments) }
	static where (options) { return this.newRelation.where(...arguments) }
	static order (options) { return this.newRelation.order(...arguments) }
	static limit (limit) { return this.newRelation.limit(...arguments) }
	static offset (offset) { return this.newRelation.offset(...arguments) }
	static count () { return this.newRelation.count(...arguments) }
	static sum (field) { return this.newRelation.sum(...arguments) }
	static avg (field) { return this.newRelation.avg(...arguments) }
	
	// create
	
	// update
	
	// destroy
	constructor () {
		super(...arguments)
	}
}
module.exports = BridgeRelation