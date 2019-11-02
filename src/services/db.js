const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');

var DBManager = {}

DBManager.getDB = async () => {
  if (typeof DBManager.db === 'undefined') {
    await DBManager.start();
  }
  return DBManager.db;
}

DBManager.start = async () => {
  if (process.env.NODE_ENV === 'test') {
    DBManager.server = new MongoMemoryServer();
    const url = await DBManager.server.getConnectionString();
    DBManager.connection = await MongoClient.connect(url, {});
    DBManager.db = DBManager.connection.db(await DBManager.server.getDbName());
  } else {
    DBManager.connection = await MongoClient.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
    DBManager.db = DBManager.connection.db(process.env.DB_NAME);
  }
}

DBManager.stop = () => {
  DBManager.connection.close();
  if (process.env.NODE_ENV === 'test') {
    DBManager.server.stop();
  }
}

module.exports = DBManager;
