module.exports = {
  async up (orm) {
    await orm.createTable('friend_ships', {}, function (t) {
      t.references(`user`, {})
      t.integer(`friendId`, {})
      t.timestamps()
    })
  }
}