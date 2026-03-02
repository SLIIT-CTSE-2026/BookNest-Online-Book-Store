import mongoose from 'mongoose';

const blacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // TTL index to auto-delete expired tokens
  }
});

const Blacklist = mongoose.model('Blacklist', blacklistSchema);
export default Blacklist;
