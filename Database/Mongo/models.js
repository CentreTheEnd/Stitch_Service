import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true
  },
  value: { 
    type: String, 
    required: true,
    unique: true
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  loginType: { type: String, required: true, enum: ['email', 'google', 'discord', 'github'] },
  
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'https://ui-avatars.com/api/?name=user' },
  
  apiKey: {
    type: [apiKeySchema],
    validate: [arrayLimit, 'Cannot have more than 5 API keys'],
    default: []
  },
  token: { type: String, required: true },
  
  role: { type: String, default: 'user', enum: ['user', 'admin', 'owner'] },
  
  plan: {
    name: { type: String, default: 'Free', enum: ['Free', 'Pro', 'Pro+', 'VIP'] },
    price: { type: Number, default: 0 },
    description: { type: String, default: 'Basic free plan' },
    durationDays: { type: Number, default: Infinity },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: Date.now },
    isSelected: { type: Boolean, default: false },
  },
  
  limited: { type: Number, default: 1000 },
  coins: { type: Number, default: 10 },
  
  lastLimitedUpdate: { type: Date, default: Date.now },

  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String, default: null },
  verificationExpires: { type: Date, default: null },
    
  registeredAt: { type: Date, default: Date.now },
  
  usage: {
    total: { type: Number, default: 0 },
    lastUse: { type: Date, default: Date.now },
    sections: {
      type: Map,
      of: new mongoose.Schema({
        api: {
          type: Map,
          of: new mongoose.Schema({
            type: { type: String, required: true },
            usage: { type: Number, default: 1 },
            lastUse: { type: Date, default: Date.now },
            lastRequest: { type: String, default: '' }
          }, { _id: false })
        },
        usage: { type: Number, default: 1 },
        lastUse: { type: Date, default: Date.now }
      }, { _id: false })
    }
  },
});

function arrayLimit(val) {
  return val.length <= 5;
}

export const User = mongoose.model('User', userSchema);
