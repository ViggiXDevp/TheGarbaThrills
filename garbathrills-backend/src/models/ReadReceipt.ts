import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReadReceipt extends Document {
  userId: Types.ObjectId;
  matchId: Types.ObjectId;
  lastReadAt: Date;
}

const readReceiptSchema = new Schema<IReadReceipt>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
  lastReadAt: { type: Date, required: true, default: Date.now },
});

readReceiptSchema.index({ userId: 1, matchId: 1 }, { unique: true });

export const ReadReceipt = mongoose.model<IReadReceipt>('ReadReceipt', readReceiptSchema);