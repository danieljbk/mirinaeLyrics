import mongoose from 'mongoose';

const mirinaeOutputSchema = new mongoose.Schema({
  textInput: { type: String, required: true },
  imageOutput: { type: Buffer, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

export default mongoose.model('MirinaeOutput', mirinaeOutputSchema);
