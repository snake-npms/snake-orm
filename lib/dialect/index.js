class DialectProxy {
	constructor (connectOptions) {
		this.connectOptions = connectOptions
		let Dialect = require(`./${connectOptions['dialect']}`)
		this.dialect = new Proxy(new Dialect(connectOptions), {
			get (target, prop) {
				if (target[prop]) {
					return async function () {
						console.info(prop, ...arguments)
						return await target[prop].apply(target, arguments)
					}
				} else {
					return async function () {
						throw new Error(`Method ${prop} Not in Dialect, arguments: ${arguments}`)
					}
				}
			}
		})
	}
}
module.exports = DialectProxy