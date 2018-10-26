module.exports = {
  async up (orm) {
    await orm.createTable('friend_ships', {}, function (t) {
      t.integer(`userId`, {})
      t.integer(`friendId`, {})
      t.timestamps()
    })
  }
}