// schema HR Admin
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type:     String,
    required: [true, 'Nama wajib diisi'],
    trim:     true,
  },
  email: {
    type:      String,
    required:  [true, 'Email wajib diisi'],
    unique:    true,
    lowercase: true,
    trim:      true,
  },
  password: {
    type:     String,
    required: [true, 'Password wajib diisi'],
    minlength: 6,
  },
  role: {
    type:    String,
    default: 'admin',
  },
}, { timestamps: true });

// Hash password sebelum disimpan
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method untuk cek password saat login
userSchema.methods.comparePassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);