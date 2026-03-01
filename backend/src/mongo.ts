import {Collection, Db, type Document, MongoClient, type WithId} from 'mongodb';
import {log} from './logger.js';
import {toError} from './utils.js';

export class MongoDatabase {
  private static _instance: MongoDatabase;
  private readonly _client: MongoClient;
  private readonly _db: Db;

  private constructor(client: MongoClient, dbName: string) {
    this._client = client;
    this._db = this._client.db(dbName);
  }

  public static get instance() {
    return MongoDatabase._instance;
  }

  public static async initialize() {
    const url = process.env['MONGO_URL'] || 'mongodb://localhost:27017';
    const dbName = process.env['MONGO_DB_NAME'] || 'test';
    const client = new MongoClient(url);
    client.on('error', err => {
      const error = toError(err);
      log.info(error)
    }).on('connectionReady', event => {
      log.info(event)
    }).on('commandSucceeded', event => {
      log.info(event)
    }).on('commandFailed', event => {
      log.info(event)
    });
    MongoDatabase._instance = new MongoDatabase(client, dbName);
    await MongoDatabase._instance._client.connect();
  }

  public collection<T extends WithId<Document> = WithId<Document>>(name: string): Collection<T> {
    return this._db.collection<T>(name);
  }


}
