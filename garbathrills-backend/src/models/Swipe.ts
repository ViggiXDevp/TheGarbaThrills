import mongoose, { Document, Schema, Types } from 'mongoose';

export type SwipeDirection = 'like' | 'pass';

export interface ISwipe extends Document {
  fromUser: Types.ObjectId;
  toUser: Types.ObjectId;
  direction: SwipeDirection;
  createdAt: Date;
}

const swipeSchema = new Schema<ISwipe>(
  {
    fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    direction: { type: String, enum: ['like', 'pass'], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// A user can only swipe on another user once
swipeSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

export const Swipe = mongoose.model<ISwipe>('Swipe', swipeSchema);
