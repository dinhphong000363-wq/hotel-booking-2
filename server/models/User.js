import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  password: {
    type: String,
    required: function () {
      return this.provider === 'local';
    }
  },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  providerId: {
    type: String,
    sparse: true
  },
  avatar: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'hotelOwner', 'admin'],
    default: 'user'
  },
  recentSearchedCities: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ providerId: 1, provider: 1 });

const User = mongoose.model('User', userSchema);

export default User;
