import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperAirplaneIcon, TrashIcon, SparklesIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import { chatAPI } from '../../services/api.js';
import { useChatStore, useDocumentStore } from '../../store/index.js';

export default function ChatInterface({ workspaceId }) {
  const { messages, chatId, isLoading, addMessage, setChatId, clearChat, setLoading } = useChatStore();
  const { documents } = useDocumentStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const indexedDocs = documents.filter(d => d.isIndexed);
  const processingDocs = documents.filter(d => d.indexingStatus === 'processing');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || isLoading) return;
    if (indexedDocs.length === 0) {
      toast.error('Please upload and wait for documents to finish indexing first.');
      return;
    }

    setInput('');
    addMessage({ role: 'user', content: msg, timestamp: new Date() });
    setLoading(true);

    try {
      const data = await chatAPI.sendMessage(workspaceId, { message: msg, chatId });
      if (!chatId) setChatId(data.chatId);
      addMessage({
        role: 'assistant',
        content: data.message,
        sources: data.sources,
        timestamp: new Date(),
      });
    } catch (err) {
      toast.error(err.message);
      addMessage({
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}`,
        isError: true,
        timestamp: new Date(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    clearChat();
    toast.success('Chat cleared');
  };

  const suggestions = [
    'Summarize the key points',
    'What are the main arguments?',
    'Explain the core concepts',
    'What are the conclusions?',
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 border-r border-white/5">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="w-6 h-6 text-brand-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">Chat with your documents</h3>
              <p className="text-slate-400 text-sm">
                {indexedDocs.length === 0
                  ? processingDocs.length > 0
                    ? `Processing ${processingDocs.length} document${processingDocs.length > 1 ? 's' : ''}...`
                    : 'Upload documents in the Sources tab to get started'
                  : `Ask anything about your ${indexedDocs.length} indexed document${indexedDocs.length > 1 ? 's' : ''}`
                }
              </p>
            </div>

            {indexedDocs.length > 0 && (
              <div className="grid grid-cols-2 gap-2 max-w-sm w-full">
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                    className="text-left px-3 py-2.5 rounded-xl bg-surface-800 border border-white/5 hover:border-brand-500/30 hover:bg-brand-600/5 text-slate-300 text-xs transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
                      <SparklesIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                    {msg.role === 'user' ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="prose-custom">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    )}

                    {/* Sources */}
                    {msg.sources?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-slate-500 mb-2 font-medium">Sources</p>
                        <div className="space-y-1.5">
                          {msg.sources.map((src, j) => (
                            <div key={j} className="bg-white/5 rounded-lg p-2">
                              <p className="text-xs font-medium text-brand-400">{src.documentName}</p>
                              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{src.excerpt}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-slate-600 mt-2">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0 mr-3">
                  <SparklesIcon className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="chat-bubble-ai">
                  <div className="dot-typing">
                    <span /><span /><span />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/5">
        {processingDocs.length > 0 && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-xs text-amber-400">
              Processing {processingDocs.length} document{processingDocs.length > 1 ? 's' : ''}...
            </p>
          </div>
        )}

        <div className="flex items-end gap-3">
          {messages.length > 0 && (
            <button onClick={handleClear} className="btn-ghost p-2.5 flex-shrink-0 mb-0.5" title="Clear chat">
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              className="input pr-12 resize-none min-h-[44px] max-h-32 py-3 text-sm"
              placeholder={indexedDocs.length === 0 ? 'Upload documents to start chatting...' : 'Ask a question about your documents...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || indexedDocs.length === 0}
              rows={1}
              style={{ height: 'auto' }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || indexedDocs.length === 0}
              className="absolute right-2 bottom-2 p-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-all"
            >
              <PaperAirplaneIcon className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-600 text-center mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
