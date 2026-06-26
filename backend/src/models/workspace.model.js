import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workspace name is required'],
    trim: true,
    minlength: [1, 'Name must be at least 1 character'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: '',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  }],
  color: {
    type: String,
    default: '#6366f1',
  },
  icon: {
    type: String,
    default: 'book',
  },
  chromaCollectionId: {
    type: String,
    unique: true,
    sparse: true,
  },
  totalDocuments: {
    type: Number,
    default: 0,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

workspaceSchema.index({ owner: 1, createdAt: -1 });

workspaceSchema.pre('remove', async function (next) {
  await mongoose.model('Document').deleteMany({ workspace: this._id });
  await mongoose.model('ChatHistory').deleteMany({ workspace: this._id });
  next();
});

export default mongoose.model('Workspace', workspaceSchema);
