import { Schema, model } from 'mongoose';

interface IReview {
  userID: Schema.Types.ObjectId;
  taskID: Schema.Types.ObjectId;
  helperID: Schema.Types.ObjectId;
  rating: number;
  review: string;
}

const reviewSchema = new Schema<IReview>({
  userID: { type: Schema.Types.ObjectId, required: true },
  taskID: { type: Schema.Types.ObjectId, required: true },
  helperID: { type: Schema.Types.ObjectId, required: true },
  rating: { type: Number, required: true },
  review: { type: String },
});

const Review = model<IReview>('Review', reviewSchema);

export default Review;
