"use client";

import { useState, useEffect } from "react";
import { BookOpen, Target, TrendingUp, Users, Brain, Zap } from "lucide-react";
import Api from "@/lib/Api";
import { useSession } from "@clerk/nextjs";

interface Branch {
  id: string;
  key: string;
  name: string;
  order: number;
}

interface Subject {
  id: string;
  key: string;
  name: string;
  order: number;
  topicCount: number;
  topics: Topic[];
}

interface Topic {
  id: string;
  key: string;
  name: string;
  syllabusPath: string[];
  order: number;
}

interface Taxonomy {
  branch: Branch;
  subjects: Subject[];
}

export default function HomePage() {
  const [selectedBranch, setSelectedBranch] = useState<string>("JEE");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [taxonomy, setTaxonomy] = useState<Taxonomy | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const data = useSession();
  console.log({data})
  useEffect(() => {
    fetchTaxonomy(selectedBranch);
  }, [selectedBranch]);

  const fetchTaxonomy = async (branch: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/taxonomy?branch=${branch}`
      );
      if (response.ok) {
        const data = await response.json();
        setTaxonomy(data);
        setSelectedSubject("");
        setSelectedTopic("");
      }
    } catch (error) {
      console.error("Error fetching taxonomy:", error);
    } finally {
      setLoading(false);
    }
  };

  const startSession = async () => {
    try {
      const mode = selectedTopic
        ? "topic"
        : selectedSubject
        ? "subject"
        : "all";
      const requestBody: any = {
        mode,
        branchId: taxonomy?.branch.id,
      };

      if (selectedSubject) {
        requestBody.subjectId = selectedSubject;
      }
      if (selectedTopic) {
        requestBody.topicId = selectedTopic;
      }

      const response = await Api.createSession(requestBody);

      console.log("Session created:", response);
      // Navigate to test session
      alert("Session created! Redirecting to test...");
    } catch (error) {
      console.error("Error starting session:", error);
      alert("Failed to start session");
    }
  };

  const getSelectedSubjectName = () => {
    if (!selectedSubject || !taxonomy) return "";
    return taxonomy.subjects.find((s) => s.id === selectedSubject)?.name || "";
  };

  const getSelectedTopicName = () => {
    if (!selectedTopic || !taxonomy) return "";
    const subject = taxonomy.subjects.find((s) => s.id === selectedSubject);
    if (!subject) return "";
    return subject.topics.find((t) => t.id === selectedTopic)?.name || "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">LevelUp</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Target className="w-4 h-4" />
                <span>Level {currentLevel}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Zap className="w-4 h-4" />
                <span>{streak} day streak</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Master Your Skills with Adaptive Learning
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            LevelUp uses intelligent algorithms to create personalized learning
            experiences. Each level adapts to your performance, ensuring optimal
            challenge and growth.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Adaptive Intelligence
            </h3>
            <p className="text-gray-600">
              Questions automatically adjust to your skill level for optimal
              learning
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Infinite Progression
            </h3>
            <p className="text-gray-600">
              Unlimited levels that grow with you, never hitting a learning
              plateau
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Smart Analytics
            </h3>
            <p className="text-gray-600">
              Track your progress across subjects and topics with detailed
              insights
            </p>
          </div>
        </div>

        {/* Session Configuration */}
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Start Your Learning Session
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Branch Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Exam Branch
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="JEE">JEE (Joint Entrance Examination)</option>
                <option value="NEET">
                  NEET (National Eligibility cum Entrance Test)
                </option>
              </select>
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedTopic("");
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!taxonomy}
              >
                <option value="">All Subjects</option>
                {taxonomy?.subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Topic
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!selectedSubject || !taxonomy}
              >
                <option value="">All Topics</option>
                {taxonomy?.subjects
                  .find((s) => s.id === selectedSubject)
                  ?.topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <BookOpen className="w-4 h-4" />
              <span>Session Configuration:</span>
            </div>
            <div className="text-sm text-gray-700">
              <p>
                <strong>Mode:</strong>{" "}
                {selectedTopic
                  ? "Topic-specific"
                  : selectedSubject
                  ? "Subject-specific"
                  : "Branch-wide"}
              </p>
              <p>
                <strong>Scope:</strong>{" "}
                {selectedTopic
                  ? getSelectedTopicName()
                  : selectedSubject
                  ? getSelectedSubjectName()
                  : `${taxonomy?.branch.name} (All Subjects)`}
              </p>
              <p>
                <strong>Questions:</strong> 30 questions per session
              </p>
              <p>
                <strong>Difficulty:</strong> Adaptive to your current level
              </p>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startSession}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? "Loading..." : "Start Learning Session"}
          </button>
        </div>

        {/* How It Works */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            How LevelUp Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Choose Your Focus
              </h4>
              <p className="text-sm text-gray-600">
                Select exam branch, subject, or specific topic
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Get Smart Questions
              </h4>
              <p className="text-sm text-gray-600">
                AI selects 30 questions perfectly matched to your level
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Learn & Progress
              </h4>
              <p className="text-sm text-gray-600">
                Complete sessions and advance to higher levels
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Track Growth</h4>
              <p className="text-sm text-gray-600">
                Monitor your progress with detailed analytics
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
