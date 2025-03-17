import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 2
  },
  lastName: {
    type: String,
    required: true,
    minlength: 1
  },
  email: {
    type: String,
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  whatsappNumber: {
    type: String,
    required: true,
    match: [/^\d{8,15}$/, 'Please enter a valid phone number']
  },
  address: {
    type: String,
    required: true,
    minlength: 10
  },
  workPosition: {
    type: String,
    required: true,
    minlength: 2
  },
  frontId: {
    type: String, // Cloudinary URL
    required: true
  },
  backId: {
    type: String // Cloudinary URL
  },
  wantsNfcCard: {
    type: Boolean,
    default: false
  },
  acceptedTerms: {
    type: Boolean,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Contacts =  mongoose.model('Contact', contactSchema);
export default Contacts;