# snake-orm
Support `Sqlite`, `Mysql`

More Info Please Look the [Doc](https://github.com/snake-npms/snake-orm/wiki)

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
```bash
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
- not (options)
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
- findOrCreateBy (object, blockAfn)
- create(object, blockAfn)
- updateAll(object)
> `Instance` Methods
- update(object, blockAfn)
- save()
- increment(field, value)
- decrement(field, value)
### Log Sql
please set `debug` or `logger` -> `true`
