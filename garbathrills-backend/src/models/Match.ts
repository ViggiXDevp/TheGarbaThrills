import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMatch extends Document {
  userA: Types.ObjectId;
  userB: Types.ObjectId;
  createdAt: Date;
}

const matchSchema = new Schema<IMatch>(
  {
    userA: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userB: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

matchSchema.index({ userA: 1, userB: 1 }, { unique: true });
matchSchema.index({ userA: 1 }); 
matchSchema.index({ userB: 1 });

export const Match = mongoose.model<IMatch>('Match', matchSchema);

// Helper to always store the pair in a consistent order, so (A,B) and (B,A)
// never create two separate documents.
export const sortedPair = (idA: string, idB: string): [string, string] =>
  idA < idB ? [idA, idB] : [idB, idA];
