import mongoose from 'mongoose';

const mirinaeSchema = new mongoose.Schema({
  textInput: { type: String, required: true },
  imageBuffer: { type: Buffer, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

export default mongoose.model('Mirinae', mirinaeSchema);
