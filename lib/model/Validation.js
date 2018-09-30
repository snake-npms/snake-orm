let Assignment = require('./Assignment')
class Validation extends Assignment {
	constructor () {
		super(...arguments)
	}
	
	validate () {
		return true
	}
}
module.exports = Validation