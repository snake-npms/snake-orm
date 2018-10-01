# snake-orm
Support `Sqlite`, `Mysql`

```bash
# And one of the following:
$ npm install --save mysql2
$ npm install --save sqlite3
```

### Usage
```
let SnackeOrm = require('snake-orm')
new SnakeOrm(database, username, password, {dialect: ['mysql'|'sqlite3'], host: 'localhost', logger: true})
```

### Methods
> `Class` Methods
- find (valueOfPrimaryKey) -> it's `[Bomb Method]`
- findBy (options)
- where (options)
- order (options)
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
