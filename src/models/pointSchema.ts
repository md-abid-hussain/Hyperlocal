import { Schema } from 'mongoose';

const PointSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
  crs: {
    type: String,
    name: String,
  },
});

export default PointSchema;
