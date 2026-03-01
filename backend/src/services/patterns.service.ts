import {type DeleteResult, ObjectId, type PushOperator, type UpdateFilter, type WithId} from 'mongodb';
import {MongoDatabase} from '../mongo.js';
import {log} from '../logger.js';
import type {DbPattern, UpdatePatternDto} from '../types.js';
import {ProgressService} from './progress.service.js';

export class PatternsService {
  public static async deletePattern(id: string): Promise<DeleteResult | undefined> {
    try {
      const deleteResult = await MongoDatabase.instance.patterns.deleteOne({_id: new ObjectId(id)});
      if (deleteResult.acknowledged && deleteResult.deletedCount) {
        // Cascade-delete the associated progress document (ignore errors — orphan is acceptable)
        await ProgressService.deleteByPatternId(id);
      }
      return deleteResult;
    } catch (error) {
      log.warn(error);
      return undefined;
    }
  }

  public static async getPatterns(): Promise<WithId<DbPattern>[]> {
    try {
      return await MongoDatabase.instance.patterns.find().toArray();
    } catch (error) {
      log.warn(error);
      return [];
    }
  }

  public static async patchPattern(id: string, pattern: UpdatePatternDto) {
    let $set: Partial<DbPattern> = {
      updatedAt: new Date(),
    }
    let $push: PushOperator<DbPattern> = {};
    if (pattern.name) {
      $set = {
        ...$set,
        name: pattern.name
      }
    }
    if (pattern.cells) {
      $set = {
        ...$set,
        cells: pattern.cells
      }
    }
    const update: UpdateFilter<DbPattern> = {
      $set,
      $push
    }
    try {
      const updateResult = await MongoDatabase.instance.patterns.updateOne(
        {_id: new ObjectId(id)},
        update
      );
      if (updateResult.acknowledged && updateResult.modifiedCount) {
        return await MongoDatabase.instance.patterns.findOne({_id: new ObjectId(id)});
      }
      return undefined;
    } catch(error) {
      log.warn(error);
      return undefined;
    }
  }

  public static async getPatternById(id: string) {
    try {
      return await MongoDatabase.instance.patterns.findOne({_id: new ObjectId(id)});
    } catch(error) {
      log.warn(error);
      return undefined;
    }
  }

  public static async createPattern(pattern: Omit<DbPattern, 'createdAt' | 'updatedAt'>) {
    try {
      const insertResult = await MongoDatabase.instance.patterns.insertOne({
        ...pattern,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      if (insertResult.acknowledged && insertResult.insertedId) {
        return await MongoDatabase.instance.patterns.findOne({_id: insertResult.insertedId});
      }
      return undefined;
    } catch(error) {
      log.warn(error);
      return undefined;
    }
  }
}
