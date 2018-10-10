let Assignment = require('./Assignment')
class AssignmentValidation extends Assignment {
	constructor () {
		super(...arguments)
	}
	
	validate () {
		return true
	}
}
module.exports = AssignmentValidation