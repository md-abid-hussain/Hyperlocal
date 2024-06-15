import { Request, Response } from 'express';
import { BadRequestError } from '../errors/CustomError';
import { isValidObjectId } from 'mongoose';
import Review from '../models/Review';
import User from '../models/User';
import Task from '../models/Task';
import Helper from '../models/Helper';

// @desc GET ALL REVIEWS
// @route GET /review
// @access Private
const getAllReviews = async (req: Request, res: Response) => {
  const reviews = await Review.find();
  return res.json({ reviews });
};

// @desc CREATE REVIEW
// @route POST /review
// @access Private
const createReview = async (req: Request, res: Response) => {
  const { isHelper, revieweeId, taskId, rating, review } = req.body;

  if (!revieweeId || !taskId || !rating || !isValidObjectId(revieweeId) || !isValidObjectId(taskId)) {
    throw new BadRequestError({
      message: 'Please provide all required fields',
      context: { taskId, rating },
    });
  }

  const userId = isHelper ? revieweeId : res.locals.id;
  const helperId = isHelper ? res.locals.id : revieweeId;

  const userExists = await User.findById(userId);

  if (!userExists) {
    throw new BadRequestError({
      message: 'User not found',
      context: { userId },
    });
  }

  const taskExists = await Task.findById(taskId);

  if (!taskExists) {
    throw new BadRequestError({
      message: 'Task not found',
      context: { taskId },
    });
  }

  const helperExists = await Helper.findById(helperId);

  if (!helperExists) {
    throw new BadRequestError({
      message: 'Helper not found',
      context: { helperId },
    });
  }

  if (rating < 1 || rating > 5) {
    throw new BadRequestError({
      message: 'Rating must be between 1 and 5',
      context: { rating },
    });
  }

  const newReview = await Review.createReview(isHelper, userId, taskId, helperId, rating, review);

  return res.json({ review: newReview });
};

// @desc UPDATE REVIEW
// @route PATCH /review
// @access Private
const updateReview = async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { rating, review } = req.body;

  if (!reviewId || !isValidObjectId(reviewId)) {
    throw new BadRequestError({
      message: 'Please provide reviewId to update',
      context: { reviewId },
    });
  }

  const reviewExists = await Review.findById(reviewId);

  if (!reviewExists) {
    throw new BadRequestError({
      message: 'Review not found',
      context: { reviewId },
    });
  }

  const ratingDifference = rating - reviewExists.rating;

  if (rating) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestError({
        message: 'Rating must be between 1 and 5',
        context: { rating },
      });
    }
    reviewExists.rating = rating;
  }

  if (review) {
    reviewExists.review = review;
  }

  if (reviewExists.reviewerRole === 'HELPER') {
    await User.findByIdAndUpdate(reviewExists.userId, {
      $inc: { totalRating: ratingDifference },
    });
  } else {
    await Helper.findByIdAndUpdate(reviewExists.helperId, {
      $inc: { totalRating: ratingDifference },
    });
  }

  await reviewExists.save();
  return res.json({ review: reviewExists });
};

// @desc DELETE REVIEW
// @route DELETE /review
// @access Private
const deleteReview = async (req: Request, res: Response) => {
  const { reviewId } = req.body;

  if (!reviewId || !isValidObjectId(reviewId)) {
    throw new BadRequestError({
      message: 'Please provide reviewId to delete',
      context: { reviewId },
    });
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new BadRequestError({
      message: 'Review not found',
      context: { reviewId },
    });
  }

  const helperId = review.helperId;
  const userId = review.userId;

  if (res.locals.id !== userId && res.locals.id !== helperId) {
    throw new BadRequestError({
      message: 'You are not authorized to delete this review',
    });
  }

  if (review.reviewerRole === 'HELPER') {
    await Helper.findByIdAndUpdate(helperId, {
      $inc: { totalPeopleRated: -1, totalRating: -review.rating },
    });
  } else {
    await User.findByIdAndUpdate(userId, {
      $inc: { totalHelperRated: -1, totalRating: -review.rating },
    });
  }

  await review.deleteOne();
  return res.json({ message: 'Review deleted successfully' });
};

// @desc GET REVIEW
// @route GET /review/:reviewId
// @access Private
const getReview = async (req: Request, res: Response) => {
  const { reviewId } = req.params;

  if (!reviewId) {
    throw new BadRequestError({
      message: 'Please provide reviewId to get review',
      context: { reviewId },
    });
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new BadRequestError({
      message: 'Review not found',
      context: { reviewId },
    });
  }

  return res.json({ review });
};

export default { getAllReviews, createReview, updateReview, deleteReview, getReview };
