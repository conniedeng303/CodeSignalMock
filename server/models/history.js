import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  userId: String,
  title: String,
  difficulty: String,
  url: String,
  notes: String,
  openedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('History', historySchema);