import { Schema, model, Document, Model } from 'mongoose';
import User from './User';
import Helper from './Helper';

interface IReview extends Document {
  _id: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  taskId: Schema.Types.ObjectId;
  helperId: Schema.Types.ObjectId;
  rating: number;
  review: string | null;
  reviewerRole: 'USER' | 'HELPER';
  revieweeRole: 'USER' | 'HELPER';
  createdAt: Date;
  updatedAt: Date;
  createReview(
    isHelper: boolean,
    userId: Schema.Types.ObjectId,
    taskId: Schema.Types.ObjectId,
    helperId: Schema.Types.ObjectId,
    rating: number,
    review: string,
  ): Promise<IReview>;
}

interface IReviewModel extends Model<IReview> {
  createReview: (
    isHelper: boolean,
    userId: Schema.Types.ObjectId,
    taskId: Schema.Types.ObjectId,
    helperId: Schema.Types.ObjectId,
    rating: number,
    review: string,
  ) => Promise<IReview>;
}

const reviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    helperId: { type: Schema.Types.ObjectId, ref: 'Helper', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String },
    reviewerRole: { type: String, enum: ['USER', 'HELPER'], required: true },
    revieweeRole: { type: String, enum: ['USER', 'HELPER'], required: true },
  },
  {
    timestamps: true,
  },
);

reviewSchema.statics.createReview = async function (
  isHelper: boolean,
  userId: Schema.Types.ObjectId,
  taskId: Schema.Types.ObjectId,
  helperId: Schema.Types.ObjectId,
  rating: number,
  review: string,
) {
  const newReview = await this.create({
    userId: userId,
    taskId: taskId,
    helperId: helperId,
    rating,
    review,
    reviewerRole: isHelper ? 'HELPER' : 'USER',
    revieweeRole: isHelper ? 'USER' : 'HELPER',
  });

  if (isHelper) {
    await User.findByIdAndUpdate(userId, {
      $inc: { totalHelperRated: 1, totalRating: rating },
    });
  } else {
    await Helper.findByIdAndUpdate(helperId, {
      $inc: { totalPeopleRated: 1, totalRating: rating },
    });
  }

  return newReview;
};

const Review = model<IReview, IReviewModel>('Review', reviewSchema);

export default Review;
