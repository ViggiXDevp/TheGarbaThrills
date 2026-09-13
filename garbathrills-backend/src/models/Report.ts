import mongoose, { Document, Schema, Types } from 'mongoose';

export type ReportReason =
  | 'harassment'
  | 'fake_profile'
  | 'inappropriate_content'
  | 'spam'
  | 'other';

export interface IReport extends Document {
  reporter: Types.ObjectId;
  reportedUser: Types.ObjectId;
  reason: ReportReason;
  details?: string;
  createdAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportedUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: {
      type: String,
      enum: ['harassment', 'fake_profile', 'inappropriate_content', 'spam', 'other'],
      required: true,
    },
    details: { type: String, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Report = mongoose.model<IReport>('Report', reportSchema);