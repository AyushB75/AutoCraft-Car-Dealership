import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    make: {
      type: String,
      required: [true, 'Vehicle make is required'],
      trim: true
    },
    model: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Vehicle category is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Vehicle price is required'],
      min: [0, 'Price cannot be negative']
    },
    quantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Stock quantity must be an integer'
      }
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexes for fast searching
vehicleSchema.index({ make: 1 });
vehicleSchema.index({ model: 1 });
vehicleSchema.index({ category: 1 });
vehicleSchema.index({ price: 1 });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;
