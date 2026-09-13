import mongoose, { Document, Schema } from 'mongoose';

export type Gender = 'male' | 'female' | 'other';
export type LookingFor = 'male' | 'female' | 'other' | 'anyone';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  gender: Gender;
  lookingFor?: LookingFor;
  age?: number;
  bio?: string;
  interests: string[];
  photos: string[];
  profileComplete: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    lookingFor: {
      type: String,
      enum: ['male', 'female', 'other', 'anyone'],
    },
    age: {
      type: Number,
      min: 18,
      max: 100,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 150,
      default: '',
    },
    interests: {
      type: [String],
      default: [],
      validate: {
        validator: (arr: string[]) => arr.length <= 8,
        message: 'You can select up to 8 interests only',
      },
    },
    photos: {
      type: [String],
      default: [],
      validate: {
        validator: (arr: string[]) => arr.length <= 3,
        message: 'You can upload up to 3 photos only',
      },
    },
    profileComplete: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>('User', userSchema);

