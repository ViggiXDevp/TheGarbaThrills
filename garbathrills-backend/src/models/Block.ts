import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBlock extends Document {
  blocker: Types.ObjectId;
  blocked: Types.ObjectId;
  createdAt: Date;
}

const blockSchema = new Schema<IBlock>(
  {
    blocker: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    blocked: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

blockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

export const Block = mongoose.model<IBlock>('Block', blockSchema);
