import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  sources: [{
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    documentName: String,
    excerpt: String,
    pageNumber: Number,
    relevanceScore: Number,
  }],
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { _id: true });

const chatHistorySchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    default: 'New Chat',
  },
  messages: [messageSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

chatHistorySchema.index({ workspace: 1, user: 1, createdAt: -1 });

export default mongoose.model('ChatHistory', chatHistorySchema);
