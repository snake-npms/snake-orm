# snake-orm
Support `Sqlite`, `Mysql`

### Install 

```
$ npm install snake-orm -S
```

```bash
# And one of the following:
$ npm install --save mysql2
$ npm install --save sqlite3
```

### Usage
```base
let SnackeOrm = require('snake-orm')
SnakeOrm.getOrCreateSnakeOrmProxy(database, username, password, {
    dialect: ['mysql'|'sqlite3'], 
    host: 'localhost', 
    logger: true
  })

# Create Model
const { SnakeModel } = SnackeOrm
class User extends SnakeModel {
    # default SnakeOrmProxy database
	#static get database () {
	#    return 'database_test'
	#}
	
	# default class name plural
	# static get table () {
	# 	return 'users'
	# }
	
	constructor () {
		super(...arguments)
	}
}
module.exports = User
```

### Methods
> `Class` Methods
- find (valueOfPrimaryKey) -> it's `[Bomb Method]`
- findBy (options)
- where (options, ...args)
- select (fields) 
- order (options)
- group (fields)
- having (options, ...args) 
- limit (limit)
- offset (offset)
- count ()
- sum (field)
- avg (field)
- withTransaction(blockAfn)
- create(object, blockAfn)
> `Instance` Methods
- update(object, blockAfn)
- save()
### Log Sql
please set `debug` or `logger` -> `true`
