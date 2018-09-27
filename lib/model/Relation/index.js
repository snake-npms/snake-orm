const Base = require('./Base')
class Relation extends Base {
	constructor (Model, sqlOptions) {
		super(Model, sqlOptions)
	}
}
module.exports = Relation