import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, CheckIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { aiAPI } from '../../services/api.js';

export default function QuizPanel({ workspaceId }) {
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const data = await aiAPI.getQuiz(workspaceId);
      setQuiz(data.quiz);
      setAnswers({});
      setSubmitted(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (qIndex, optIndex) => {
    if (submitted) return;
    setAnswers(p => ({ ...p, [qIndex]: optIndex }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < quiz.length) {
      toast.error('Please answer all questions first');
      return;
    }
    setSubmitted(true);
  };

  const score = submitted
    ? quiz.filter((q, i) => answers[i] === q.correctAnswer).length
    : null;

  if (!quiz.length) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full min-h-64">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-amber-400">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">Quiz</h3>
          <p className="text-xs text-slate-400 mb-4">Test your understanding with an AI quiz</p>
          <button onClick={generate} disabled={loading} className="btn-primary">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>
              : <><SparklesIcon className="w-4 h-4" />Generate Quiz</>
            }
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Quiz</h3>
        <button onClick={generate} disabled={loading} className="btn-ghost text-xs py-1.5 px-2.5">
          <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          New Quiz
        </button>
      </div>

      {/* Score banner */}
      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-4 text-center border ${
            score / quiz.length >= 0.7
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : score / quiz.length >= 0.5
              ? 'bg-amber-500/10 border-amber-500/20'
              : 'bg-red-500/10 border-red-500/20'
          }`}
        >
          <p className="text-2xl font-bold text-white">{score}/{quiz.length}</p>
          <p className="text-sm text-slate-300 mt-1">
            {score / quiz.length >= 0.8 ? '🎉 Excellent!' : score / quiz.length >= 0.6 ? '👍 Good job!' : '📚 Keep studying!'}
          </p>
        </motion.div>
      )}

      {/* Questions */}
      <div className="space-y-5">
        {quiz.map((q, qi) => {
          const userAnswer = answers[qi];
          const isCorrect = userAnswer === q.correctAnswer;

          return (
            <div key={qi} className="space-y-2">
              <div className="flex gap-2">
                <span className="badge badge-purple flex-shrink-0 mt-0.5">Q{qi + 1}</span>
                <p className="text-sm text-white leading-relaxed">{q.question}</p>
              </div>

              <div className="space-y-1.5 pl-2">
                {q.options.map((opt, oi) => {
                  let optClass = 'bg-surface-800 border-white/5 text-slate-300 hover:border-brand-500/30 hover:bg-brand-600/5';
                  if (userAnswer === oi && !submitted) optClass = 'bg-brand-600/20 border-brand-500/30 text-white';
                  if (submitted && oi === q.correctAnswer) optClass = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
                  if (submitted && userAnswer === oi && oi !== q.correctAnswer) optClass = 'bg-red-500/10 border-red-500/30 text-red-300';

                  return (
                    <button
                      key={oi}
                      onClick={() => handleAnswer(qi, oi)}
                      disabled={submitted}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-all flex items-center gap-2 ${optClass}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-current flex-shrink-0 flex items-center justify-center text-xs font-bold">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span>{opt}</span>
                      {submitted && oi === q.correctAnswer && <CheckIcon className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                      {submitted && userAnswer === oi && oi !== q.correctAnswer && <XMarkIcon className="w-3.5 h-3.5 text-red-400 ml-auto" />}
                    </button>
                  );
                })}
              </div>

              {submitted && q.explanation && (
                <div className="ml-2 bg-surface-800 rounded-lg px-3 py-2 border border-white/5">
                  <p className="text-xs text-slate-400"><span className="text-brand-400 font-medium">Explanation:</span> {q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          className="btn-primary w-full justify-center"
          disabled={Object.keys(answers).length < quiz.length}
        >
          Submit Quiz ({Object.keys(answers).length}/{quiz.length} answered)
        </button>
      )}
    </div>
  );
}
