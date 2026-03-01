import { type DeleteResult, ObjectId, type WithId } from 'mongodb';
import { MongoDatabase } from '../mongo.js';
import { log } from '../logger.js';
import type { DbProgress, UpsertProgressDto } from '../types.js';

export class ProgressService {
  public static async getByPatternId(patternId: string): Promise<WithId<DbProgress> | null> {
    try {
      return await MongoDatabase.instance.progress.findOne({ _id: new ObjectId(patternId) });
    } catch (error) {
      log.warn(error);
      return null;
    }
  }

  public static async upsertByPatternId(
    patternId: string,
    dto: UpsertProgressDto,
  ): Promise<WithId<DbProgress> | undefined> {
    try {
      // Replacement body must NOT include _id — MongoDB sets it from the filter on upsert
      const replacement: DbProgress = {
        highlightedCells: dto.highlightedCells,
        updatedAt: new Date(),
      };
      await MongoDatabase.instance.progress.replaceOne(
        { _id: new ObjectId(patternId) },
        replacement,
        { upsert: true },
      );
      return await MongoDatabase.instance.progress.findOne({ _id: new ObjectId(patternId) }) ?? undefined;
    } catch (error) {
      log.warn(error);
      return undefined;
    }
  }

  public static async deleteByPatternId(patternId: string): Promise<DeleteResult | undefined> {
    try {
      return await MongoDatabase.instance.progress.deleteOne({ _id: new ObjectId(patternId) });
    } catch (error) {
      log.warn(error);
      return undefined;
    }
  }
}

