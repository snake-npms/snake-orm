class DialectProxy {
	constructor (connectOptions) {
		this.connectOptions = connectOptions
		let Dialect = require(`./${connectOptions['dialect']}`)
		this.dialect = new Proxy(new Dialect(connectOptions), {
			get (target, prop) {
				if (target[prop]) {
					return function () {
						return target[prop].apply(target, arguments)
					}
				}
			}
		})
	}
}
module.exports = DialectProxy