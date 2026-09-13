import mongoose, { Document, Schema, Types } from 'mongoose';

export type MessageType = 'text' | 'sticker' | 'gif';

export interface IMessage extends Document {
  matchId: Types.ObjectId;
  senderId: Types.ObjectId;
  type: MessageType;
  content: string; // plain text, sticker id, or gif URL depending on type
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['text', 'sticker', 'gif'], required: true },
    content: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Message = mongoose.model<IMessage>('Message', messageSchema);
