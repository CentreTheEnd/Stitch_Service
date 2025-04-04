import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema({
  name: { type: String, enum: ['Free', 'Pro', 'Pro+', 'Vip'], default: 'Free' },
  price: { type: Number, default: 0 },
  description: { type: String },
  durationDays: { type: Number },
  startDate: { type: Date },
  endDate: { type: Date },
});

const UpdateSchema = new mongoose.Schema({
  first: { type: Date },
  last: { type: Date }
}, { _id: false });

const ApiUsageSchema = new mongoose.Schema({
  total: { type: Number, default: 0 },
  byCategory: {
    type: Map,
    of: Number,
    default: {}
  },
  byEndpoint: {
    type: Map,
    of: Number,
    default: {}
  }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String },
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: { type: String },
  avatar: { type: String },

  loginType: { type: String, enum: ['google', 'github', 'discord', 'email'], required: true },

  apiKey: { type: String, unique: true },
  token: { type: String },

  update: { type: UpdateSchema, default: {} },

  apiUse: { type: ApiUsageSchema, default: {} },

  role: { type: String, enum: ['user', 'admin', 'developer'], default: 'user' },

  plan: { type: PlanSchema, default: { name: 'Free' } },

  limited: { type: Number, default: 0 },
  coins: { type: Number, default: 0 }

}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
export default User;
