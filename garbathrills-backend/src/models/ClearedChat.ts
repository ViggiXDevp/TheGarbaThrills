import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IClearedChat extends Document {
  userId: Types.ObjectId;
  matchId: Types.ObjectId;
  clearedAt: Date;
}

const clearedChatSchema = new Schema<IClearedChat>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
  clearedAt: { type: Date, required: true, default: Date.now },
});

clearedChatSchema.index({ userId: 1, matchId: 1 }, { unique: true });

export const ClearedChat = mongoose.model<IClearedChat>('ClearedChat', clearedChatSchema);