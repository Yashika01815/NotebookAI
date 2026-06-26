import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Document name is required'],
    trim: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['pdf', 'docx', 'txt', 'md'],
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    default: '',
  },
  chunksCount: {
    type: Number,
    default: 0,
  },
  isIndexed: {
    type: Boolean,
    default: false,
  },
  indexingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  indexingError: {
    type: String,
    default: null,
  },
  metadata: {
    pageCount: Number,
    wordCount: Number,
    language: String,
    author: String,
  },
  summary: {
    short: String,
    detailed: String,
    keyInsights: [String],
    generatedAt: Date,
  },
}, { timestamps: true });

documentSchema.index({ workspace: 1, owner: 1 });
documentSchema.index({ isIndexed: 1, indexingStatus: 1 });

export default mongoose.model('Document', documentSchema);
