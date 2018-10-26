const { SnakeModel } = require('../../../../../index')
class FriendShip extends SnakeModel {
  static get database () {
    return 'database_test.sqlite3'
  }
  static onRegister () {
    this.belongsTo('user')
    this.belongsTo('friend', {className: 'User', foreignKey: 'friendId'})
  }
  constructor () {
    super(...arguments)
  }
}
module.exports = FriendShip