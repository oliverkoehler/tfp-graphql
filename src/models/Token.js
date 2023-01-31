const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.Types.ObjectId;

const tokenSchema = new Schema(
  {
    user: { type: ObjectId, required: true, ref: 'User' },
    token: { type: String, required: true },
    platform: { type: String, default: 'unknown' },
    usage: { type: Date, default: Date.now },
    history: { type: [Date] },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } },
);

tokenSchema.index({ user: 1 });

//Export function to create "Token" model class
module.exports = mongoose.model('Token', tokenSchema);
