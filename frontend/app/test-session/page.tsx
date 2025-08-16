'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';

interface Question {
  questionId: string;
  stem: string;
  options: string[];
  difficulty: number;
}

interface TestSession {
  id: string;
  mode: string;
  levelNumber: number;
  questionItems: Question[];
  startedAt: string;
}

export default function TestSessionPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('id');
  
  const [session, setSession] = useState<TestSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Map<string, { selectedIndex: number; timeSec: number }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeSpent, setTimeSpent] = useState<Map<string, number>>(new Map());
  const [startTime] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  useEffect(() => {
    // Start timer for current question
    if (session && currentQuestionIndex < session.questionItems.length) {
      const questionId = session.questionItems[currentQuestionIndex].questionId;
      if (!startTime.has(questionId)) {
        startTime.set(questionId, Date.now());
      }
    }
  }, [currentQuestionIndex, session, startTime]);

  useEffect(() => {
    // Update time spent for current question
    const interval = setInterval(() => {
      if (session && currentQuestionIndex < session.questionItems.length) {
        const questionId = session.questionItems[currentQuestionIndex].questionId;
        const start = startTime.get(questionId) || Date.now();
        const elapsed = Math.floor((Date.now() - start) / 1000);
        setTimeSpent(prev => new Map(prev).set(questionId, elapsed));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestionIndex, session, startTime]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/sessions/${sessionId}`, {
        headers: {
          'Authorization': 'Bearer dummy-token' // Replace with real Clerk token
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
        
        // Initialize time tracking for all questions
        const newStartTime = new Map();
        const newTimeSpent = new Map();
        data.session.questionItems.forEach((q: Question) => {
          newStartTime.set(q.questionId, Date.now());
          newTimeSpent.set(q.questionId, 0);
        });
        setStartTime(newStartTime);
        setTimeSpent(newTimeSpent);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (questionId: string, optionIndex: number) => {
    const currentTime = Date.now();
    const start = startTime.get(questionId) || currentTime;
    const timeSec = Math.floor((currentTime - start) / 1000);
    
    setResponses(prev => new Map(prev).set(questionId, {
      selectedIndex: optionIndex,
      timeSec
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < (session?.questionItems.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const submitSession = async () => {
    if (!session) return;

    try {
      setSubmitting(true);
      
      // Convert responses map to array format
      const responsesArray = Array.from(responses.entries()).map(([questionId, response]) => ({
        questionId,
        selectedIndex: response.selectedIndex,
        timeSec: response.timeSec
      }));

      const response = await fetch(`http://localhost:3001/api/sessions/${session.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dummy-token' // Replace with real Clerk token
        },
        body: JSON.stringify({ responses: responsesArray })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Session submitted:', data);
        alert('Session completed! Your score: ' + Math.round((data.session.score || 0) * 100) + '%');
        // Redirect to results or dashboard
      }
    } catch (error) {
      console.error('Error submitting session:', error);
      alert('Failed to submit session');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Session not found</p>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questionItems[currentQuestionIndex];
  const currentResponse = responses.get(currentQuestion.questionId);
  const totalQuestions = session.questionItems.length;
  const answeredQuestions = responses.size;
  const progressPercentage = (answeredQuestions / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">LevelUp Test Session</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Level {session.levelNumber}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </div>
              <div className="text-sm text-gray-600">
                {answeredQuestions} answered
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border p-8">
              {/* Question Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                    Question {currentQuestionIndex + 1}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
                    Difficulty: {Math.round(currentQuestion.difficulty * 100)}%
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Time: {timeSpent.get(currentQuestion.questionId) || 0}s
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-8">
                <h2 className="text-xl font-medium text-gray-900 leading-relaxed">
                  {currentQuestion.stem}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      currentResponse?.selectedIndex === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.questionId}`}
                      value={index}
                      checked={currentResponse?.selectedIndex === index}
                      onChange={() => handleOptionSelect(currentQuestion.questionId, index)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                      currentResponse?.selectedIndex === index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {currentResponse?.selectedIndex === index && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-gray-900">{option}</span>
                  </label>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <button
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-2">
                  {currentResponse && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  <span className="text-sm text-gray-600">
                    {currentResponse ? 'Answered' : 'Not answered'}
                  </span>
                </div>

                <button
                  onClick={goToNextQuestion}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              {/* Progress */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress</h3>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {answeredQuestions} of {totalQuestions} questions answered
                </p>
              </div>

              {/* Question Navigation */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Questions</h3>
                <div className="grid grid-cols-5 gap-2">
                  {session.questionItems.map((_, index) => {
                    const questionId = session.questionItems[index].questionId;
                    const isAnswered = responses.has(questionId);
                    const isCurrent = index === currentQuestionIndex;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => goToQuestion(index)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isCurrent
                            ? 'bg-blue-600 text-white'
                            : isAnswered
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={submitSession}
                disabled={submitting || answeredQuestions < totalQuestions}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {submitting ? 'Submitting...' : 'Submit Session'}
              </button>

              {answeredQuestions < totalQuestions && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Answer all questions to submit
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
