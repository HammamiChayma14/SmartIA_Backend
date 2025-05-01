import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "Technicien", "Client"], default: "Client" },
  active: { type: Boolean, default: true },
  
  phone: { 
    type: String, 
    required: function() { return this.role !== 'admin'; } 
  },
  
  address: { 
    type: String, 
    required: function() { return this.role !== 'admin'; } 
  },
  
  specialty: { 
    type: String, 
    required: function() { return this.role === 'Technicien'; }
  },
  
  hireDate: { 
    type: Date, 
    required: function() { return this.role === 'Technicien'; } 
  },
  
  resetPasswordToken: { type: String }, 
  resetPasswordExpires: { type: Date }
});

// Export du modèle User
const User = mongoose.model('User', UserSchema);

export default User;
