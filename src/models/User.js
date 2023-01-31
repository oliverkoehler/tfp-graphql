const mongoose = require('mongoose'),
  Schema = mongoose.Schema;
const { ObjectId } = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const userSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: String,
    wrongLoginCount: { type: Number, default: 0 },
    community: { type: ObjectId, ref: 'Community' },
    isActivated: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } },
);

userSchema.plugin(mongooseDelete, { deletedAt: true });

//Export function to create "User" model class
module.exports = mongoose.model('User', userSchema);
