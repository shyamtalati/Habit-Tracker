import React, { useState, useEffect } from 'react';
import { PlusCircle, Clock, BookOpen, BarChart, Save } from 'lucide-react';
import './App.css';

// Main App Component
export default function HabitTracker() {
  // State for topics/subjects
  const [topics, setTopics] = useState([]);
  // State for the active view
  const [activeView, setActiveView] = useState('dashboard');
  // State for new topic form
  const [newTopic, setNewTopic] = useState('');
  // States for logging time
  const [selectedTopic, setSelectedTopic] = useState('');
  const [hoursSpent, setHoursSpent] = useState('');
  const [studyDate, setStudyDate] = useState('');
  const [studyNotes, setStudyNotes] = useState('');
  // States for logging grades
  const [gradeValue, setGradeValue] = useState('');
  const [gradeDate, setGradeDate] = useState('');
  const [gradeNotes, setGradeNotes] = useState('');

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTopics = localStorage.getItem('habitTrackerTopics');
    if (savedTopics) {
      setTopics(JSON.parse(savedTopics));
    }
    
    // Set today's date as default for forms
    const today = new Date().toISOString().split('T')[0];
    setStudyDate(today);
    setGradeDate(today);
  }, []);

  // Save topics to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('habitTrackerTopics', JSON.stringify(topics));
  }, [topics]);

  // Add a new topic
  const handleAddTopic = (e) => {
    e.preventDefault();
    if (!newTopic.trim()) return;
    
    const newTopicObj = {
      id: Date.now(),
      name: newTopic,
      timeEntries: [],
      grades: [],
    };
    
    setTopics([...topics, newTopicObj]);
    setNewTopic('');
  };

  // Log study time for a topic
  const handleLogTime = (e) => {
    e.preventDefault();
    if (!selectedTopic || !hoursSpent || !studyDate) return;
    
    const updatedTopics = topics.map(topic => {
      if (topic.id === parseInt(selectedTopic)) {
        return {
          ...topic,
          timeEntries: [
            ...topic.timeEntries,
            {
              id: Date.now(),
              hours: parseFloat(hoursSpent),
              date: studyDate,
              notes: studyNotes
            }
          ]
        };
      }
      return topic;
    });
    
    setTopics(updatedTopics);
    setHoursSpent('');
    setStudyNotes('');
  };

  // Add a grade for a topic
  const handleAddGrade = (e) => {
    e.preventDefault();
    if (!selectedTopic || !gradeValue || !gradeDate) return;
    
    const updatedTopics = topics.map(topic => {
      if (topic.id === parseInt(selectedTopic)) {
        return {
          ...topic,
          grades: [
            ...topic.grades,
            {
              id: Date.now(),
              value: parseFloat(gradeValue),
              date: gradeDate,
              notes: gradeNotes
            }
          ]
        };
      }
      return topic;
    });
    
    setTopics(updatedTopics);
    setGradeValue('');
    setGradeNotes('');
  };

  // Calculate total hours for a topic
  const getTotalHours = (topic) => {
    return topic.timeEntries.reduce((total, entry) => total + entry.hours, 0);
  };

  // Get latest grade for a topic
  const getLatestGrade = (topic) => {
    if (topic.grades.length === 0) return 'N/A';
    
    const latestGrade = topic.grades.reduce((latest, grade) => {
      return new Date(grade.date) > new Date(latest.date) ? grade : latest;
    }, topic.grades[0]);
    
    return latestGrade.value;
  };

  // Calculate study efficiency (simple algorithm)
  const getEfficiency = (topic) => {
    if (topic.grades.length === 0 || topic.timeEntries.length === 0) return 'N/A';
    
    const avgGrade = topic.grades.reduce((sum, grade) => sum + grade.value, 0) / topic.grades.length;
    const totalHours = getTotalHours(topic);
    
    // Simple formula: grade per hour (higher is better)
    const efficiency = avgGrade / totalHours;
    
    return efficiency.toFixed(2);
  };

  // Generate recommendations based on data
  const getRecommendation = (topic) => {
    if (topic.grades.length === 0 || topic.timeEntries.length === 0) {
      return "Log more data to get recommendations";
    }
    
    const avgGrade = topic.grades.reduce((sum, grade) => sum + grade.value, 0) / topic.grades.length;
    const efficiency = parseFloat(getEfficiency(topic));
    
    if (avgGrade < 70) {
      return "Consider increasing study time for this topic";
    } else if (efficiency < 5) {
      return "Try different study techniques to improve efficiency";
    } else {
      return "You're doing well! Maintain your current approach";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Habit Tracker</h1>
        <p className="text-sm">Track your study hours and performance</p>
      </header>
      
      {/* Navigation */}
      <nav className="bg-white shadow p-2">
        <div className="flex justify-around">
          <button 
            onClick={() => setActiveView('dashboard')}
            className={`flex items-center p-2 ${activeView === 'dashboard' ? 'text-blue-600 font-bold' : 'text-gray-600'}`}
          >
            <BarChart className="w-5 h-5 mr-1" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveView('logTime')}
            className={`flex items-center p-2 ${activeView === 'logTime' ? 'text-blue-600 font-bold' : 'text-gray-600'}`}
          >
            <Clock className="w-5 h-5 mr-1" />
            Log Time
          </button>
          <button 
            onClick={() => setActiveView('logGrade')}
            className={`flex items-center p-2 ${activeView === 'logGrade' ? 'text-blue-600 font-bold' : 'text-gray-600'}`}
          >
            <BookOpen className="w-5 h-5 mr-1" />
            Log Grade
          </button>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Add New Topic</h2>
              <form onSubmit={handleAddTopic} className="flex items-center">
                <input
                  type="text"
                  placeholder="Enter topic name (e.g., Math, Piano, Running)"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="flex-1 p-2 border rounded mr-2"
                />
                <button type="submit" className="bg-blue-600 text-white p-2 rounded flex items-center">
                  <PlusCircle className="w-5 h-5 mr-1" />
                  Add
                </button>
              </form>
            </div>
            
            <h2 className="text-xl font-semibold mb-4">Your Topics</h2>
            
            {topics.length === 0 ? (
              <p className="text-gray-500">No topics added yet. Add a topic to get started!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topics.map(topic => (
                  <div key={topic.id} className="bg-white p-4 rounded shadow">
                    <h3 className="text-lg font-semibold mb-2">{topic.name}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div className="bg-gray-100 p-2 rounded">
                        <p className="text-gray-500">Total Hours</p>
                        <p className="font-bold">{getTotalHours(topic)}</p>
                      </div>
                      <div className="bg-gray-100 p-2 rounded">
                        <p className="text-gray-500">Latest Grade</p>
                        <p className="font-bold">{getLatestGrade(topic)}</p>
                      </div>
                      <div className="bg-gray-100 p-2 rounded">
                        <p className="text-gray-500">Efficiency</p>
                        <p className="font-bold">{getEfficiency(topic)}</p>
                      </div>
                      <div className="bg-gray-100 p-2 rounded">
                        <p className="text-gray-500">Sessions</p>
                        <p className="font-bold">{topic.timeEntries.length}</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded text-sm">
                      <p className="text-gray-700 font-semibold">Recommendation:</p>
                      <p>{getRecommendation(topic)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Log Time View */}
        {activeView === 'logTime' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Log Study Time</h2>
            
            {topics.length === 0 ? (
              <p className="text-gray-500">Add a topic first before logging time.</p>
            ) : (
              <form onSubmit={handleLogTime} className="bg-white p-4 rounded shadow">
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Select Topic</label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">-- Select a topic --</option>
                    {topics.map(topic => (
                      <option key={topic.id} value={topic.id}>{topic.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Hours Spent</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.25"
                    value={hoursSpent}
                    onChange={(e) => setHoursSpent(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="e.g., 1.5"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={studyDate}
                    onChange={(e) => setStudyDate(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={studyNotes}
                    onChange={(e) => setStudyNotes(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="What did you work on?"
                    rows="3"
                  />
                </div>
                
                <button type="submit" className="bg-blue-600 text-white p-2 rounded flex items-center justify-center w-full">
                  <Save className="w-5 h-5 mr-1" />
                  Save Time Entry
                </button>
              </form>
            )}
          </div>
        )}
        
        {/* Log Grade View */}
        {activeView === 'logGrade' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Log Grade/Assessment</h2>
            
            {topics.length === 0 ? (
              <p className="text-gray-500">Add a topic first before logging grades.</p>
            ) : (
              <form onSubmit={handleAddGrade} className="bg-white p-4 rounded shadow">
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Select Topic</label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">-- Select a topic --</option>
                    {topics.map(topic => (
                      <option key={topic.id} value={topic.id}>{topic.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Grade/Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gradeValue}
                    onChange={(e) => setGradeValue(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="e.g., 85"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={gradeDate}
                    onChange={(e) => setGradeDate(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={gradeNotes}
                    onChange={(e) => setGradeNotes(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="What was this assessment for?"
                    rows="3"
                  />
                </div>
                
                <button type="submit" className="bg-blue-600 text-white p-2 rounded flex items-center justify-center w-full">
                  <Save className="w-5 h-5 mr-1" />
                  Save Grade
                </button>
              </form>
            )}
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-100 p-4 text-center text-gray-500 text-sm">
        Habit Tracker App © 2025
      </footer>
    </div>
  );
}