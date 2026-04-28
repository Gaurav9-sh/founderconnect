import { Schema, Types } from 'mongoose';

export const stringId = (): string => new Types.ObjectId().toHexString();

export function applyVirtuals(schema: Schema) {
  schema.set('toJSON', { virtuals: true, versionKey: false });
  schema.set('toObject', { virtuals: true, versionKey: false });
}
