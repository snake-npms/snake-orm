let path = require('path')
module.exports = {
	"config": path.resolve(__dirname, 'config'),
	"models-path": path.resolve(__dirname, 'models'),
	"models-path-files-ignore": [],
	"migrations-path": path.resolve(__dirname, 'db/migrations')
}