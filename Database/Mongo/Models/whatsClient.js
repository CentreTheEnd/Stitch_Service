import mongoose from 'mongoose';

// نموذج الجلسة
const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },  // معرف الجلسة (رقم الهاتف)
  creds: { type: Object, required: true },  // بيانات الجلسة
  keys: { type: Object, required: true }   // مفاتيح التشفير
});

const Session = mongoose.model('Session', sessionSchema);

// وظيفة لحفظ البيانات في MongoDB
const saveSession = async (sessionId, creds, keys) => {
  try {
    const session = new Session({ sessionId, creds, keys });
    await session.save();
    console.log('Session saved to MongoDB');
  } catch (err) {
    console.error('Error saving session:', err);
  }
  
};

// وظيفة لاسترجاع الجلسة من MongoDB
const getSession = async (sessionId) => {
  try {
    const session = await Session.findOne({ sessionId });
    return session;
  } catch (err) {
    console.error('Error retrieving session:', err);
    return null;
  }
};

// وظيفة لحذف الجلسة من MongoDB
const deleteSession = async (sessionId) => {
  try {
    await Session.deleteOne({ sessionId });
    console.log('Session deleted from MongoDB');
  } catch (err) {
    console.error('Error deleting session:', err);
  }
};

export { saveSession, getSession, deleteSession };
