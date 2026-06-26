import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentTextIcon, TrashIcon, ArrowPathIcon,
  CloudArrowUpIcon, CheckCircleIcon, XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { documentAPI } from '../../services/api.js';
import { useDocumentStore } from '../../store/index.js';

const FILE_ICONS = {
  pdf: '📄', docx: '📝', txt: '📃', md: '📋',
};

const STATUS_CONFIG = {
  completed: { label: 'Indexed', className: 'badge-green', Icon: CheckCircleIcon },
  processing: { label: 'Processing', className: 'badge-yellow', Icon: ClockIcon },
  pending: { label: 'Pending', className: 'badge-yellow', Icon: ClockIcon },
  failed: { label: 'Failed', className: 'badge-red', Icon: XCircleIcon },
};

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SourcesPanel({ workspaceId }) {
  const { documents, addDocument, removeDocument, uploading, setUploading, updateDocument } = useDocumentStore();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  const onDrop = useCallback(async (accepted) => {
    if (!accepted.length) return;
    const file = accepted[0];

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await documentAPI.upload(workspaceId, formData, setUploadProgress);
      addDocument(data.document);
      toast.success(`"${file.name}" uploaded! Processing...`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [workspaceId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
    onDropRejected: (files) => {
      const err = files[0]?.errors[0];
      if (err?.code === 'file-too-large') toast.error('File too large. Max 10MB.');
      else toast.error('Invalid file type. Use PDF, DOCX, TXT, or MD.');
    },
  });

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.name}"?`)) return;
    setDeletingId(doc._id);
    try {
      await documentAPI.delete(doc._id);
      removeDocument(doc._id);
      toast.success('Document deleted');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleReindex = async (doc) => {
    try {
      await documentAPI.reindex(doc._id);
      updateDocument(doc._id, { indexingStatus: 'processing', isIndexed: false });
      toast.success('Re-indexing started');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">Sources</h3>
        <p className="text-xs text-slate-400">{documents.length} document{documents.length !== 1 ? 's' : ''} in workspace</p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-brand-500/50 bg-brand-600/5'
            : 'border-white/10 hover:border-brand-500/30 hover:bg-white/2'
        }`}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className={`w-8 h-8 mx-auto mb-2 ${isDragActive ? 'text-brand-400' : 'text-slate-500'}`} />
        <p className="text-sm text-slate-300 font-medium">
          {isDragActive ? 'Drop to upload' : 'Drop a file or click to upload'}
        </p>
        <p className="text-xs text-slate-500 mt-1">PDF, DOCX, TXT, MD · Max 10MB</p>

        {uploading && (
          <div className="mt-3">
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-brand-400 mt-1">{uploadProgress}% uploaded</p>
          </div>
        )}
      </div>

      {/* Document List */}
      <AnimatePresence>
        {documents.map(doc => {
          const status = STATUS_CONFIG[doc.indexingStatus] || STATUS_CONFIG.pending;
          const StatusIcon = status.Icon;

          return (
            <motion.div
              key={doc._id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-surface-800 border border-white/5 rounded-xl p-3 group"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{FILE_ICONS[doc.type] || '📄'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{doc.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{formatSize(doc.size)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`badge ${status.className} flex items-center gap-1`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                    {doc.chunksCount > 0 && (
                      <span className="text-xs text-slate-500">{doc.chunksCount} chunks</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {doc.indexingStatus === 'failed' && (
                    <button
                      onClick={() => handleReindex(doc)}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
                      title="Re-index"
                    >
                      <ArrowPathIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(doc)}
                    disabled={deletingId === doc._id}
                    className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-all"
                    title="Delete"
                  >
                    {deletingId === doc._id
                      ? <div className="w-3.5 h-3.5 border border-slate-400 border-t-transparent rounded-full animate-spin" />
                      : <TrashIcon className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>
              </div>

              {doc.indexingStatus === 'processing' && (
                <div className="mt-2 h-0.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full animate-pulse w-2/3" />
                </div>
              )}

              {doc.indexingError && (
                <p className="text-xs text-red-400 mt-2 bg-red-500/10 rounded-lg px-2 py-1">
                  {doc.indexingError}
                </p>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
