const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');

class DBManager {
  constructor() {
    this.db = null;
    this.connection = null;
  }

  async start() {
    if(process.env.NODE_ENV == "test" ) {
        this.server = new MongoMemoryServer();
        const url = await this.server.getConnectionString();
        this.connection = await MongoClient.connect(url, { useNewUrlParser: true });
        this.db = this.connection.db(await this.server.getDbName());
    } else {
        this.connection = await MongoClient.connect(process.env.DATABASE_URL,{ useNewUrlParser: true });
        this.db = this.connection.db(process.env.DB_NAME);
    }
  }

  stop() {
    this.connection.close();
    return this.server.stop();
  }
}

module.exports = DBManager;