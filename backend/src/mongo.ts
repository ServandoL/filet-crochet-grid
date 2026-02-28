import {Collection, Db, type Document, MongoClient} from 'mongodb';

export class MongoDatabase {
  private static instance: MongoDatabase;
  private _client: MongoClient;
  private _db: Db;

  private constructor() {
  }

  public static initialize() {
    const url = process.env['MONGO_URL'] || 'mongodb://localhost:27017';
    const dbName = process.env['MONGO_DB_NAME'] || 'test';
    const client = new MongoClient(url);
    client.on('error', err => {

    })
  }

  public collection<T extends Document = Document>(name: string): Collection<T> {
    return this._db.collection<T>(name);
  }


}
