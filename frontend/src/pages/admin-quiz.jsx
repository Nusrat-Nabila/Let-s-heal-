import React, { useState, useEffect } from 'react';
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const AdminQuiz = () => {
    const [questions, setQuestions] = useState([]);
    const [resultRanges, setResultRanges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('questions');
    
    // API base URL
    const API_BASE_URL = 'http://localhost:8000';
    
    // Form states with proper initial values
    const [questionForm, setQuestionForm] = useState({
        order: '',
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        score_a: '',
        score_b: '',
        score_c: '',
        score_d: '',
        is_required: false
    });
    
    const [resultRangeForm, setResultRangeForm] = useState({
        min_score: '',
        max_score: '',
        result_text: ''
    });
    
    const [editingQuestion, setEditingQuestion] = useState(null);

    // Clear messages after 5 seconds
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError('');
                setSuccess('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    // Fetch questions
    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/view_all_questions/`);
            
            if (response.ok) {
                const data = await response.json();
                setQuestions(data);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to fetch questions');
            }
        } catch (err) {
            setError('Error fetching questions: ' + err.message);
        }
        setLoading(false);
    };

    // Add question
    const addQuestion = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            // Prepare data
            const formData = {
                order: parseInt(questionForm.order) || 1,
                question_text: questionForm.question_text || '',
                option_a: questionForm.option_a || '',
                option_b: questionForm.option_b || '',
                option_c: questionForm.option_c || '',
                option_d: questionForm.option_d || '',
                score_a: parseInt(questionForm.score_a) || 0,
                score_b: parseInt(questionForm.score_b) || 0,
                score_c: parseInt(questionForm.score_c) || 0,
                score_d: parseInt(questionForm.score_d) || 0,
                is_required: questionForm.is_required || true
            };

            console.log('📤 Sending question data:', formData);

            const response = await fetch(`${API_BASE_URL}/api/admin/add_question/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            console.log('📥 Response:', response.status, result);
            
            if (response.ok) {
                setQuestions([...questions, result]);
                resetQuestionForm();
                setSuccess('Question added successfully!');
            } else {
                throw new Error(result.error || `HTTP error! status: ${response.status}`);
            }
            
        } catch (err) {
            console.error('❌ Add question exception:', err);
            setError('Error adding question: ' + err.message);
        }
        setLoading(false);
    };

    // Update question
    const updateQuestion = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const formData = {
                order: parseInt(questionForm.order) || 0,
                question_text: questionForm.question_text,
                option_a: questionForm.option_a,
                option_b: questionForm.option_b,
                option_c: questionForm.option_c,
                option_d: questionForm.option_d,
                score_a: parseInt(questionForm.score_a) || 0,
                score_b: parseInt(questionForm.score_b) || 0,
                score_c: parseInt(questionForm.score_c) || 0,
                score_d: parseInt(questionForm.score_d) || 0,
                is_required: questionForm.is_required
            };

            const response = await fetch(`${API_BASE_URL}/api/admin/update_question/${editingQuestion.id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            setQuestions(questions.map(q => q.id === editingQuestion.id ? responseData : q));
            setEditingQuestion(null);
            resetQuestionForm();
            setSuccess('Question updated successfully');
            
        } catch (err) {
            setError('Error updating question: ' + err.message);
        }
        setLoading(false);
    };

    // Delete question
    const deleteQuestion = async (questionId) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;
        
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/delete_question/${questionId}/`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                setQuestions(questions.filter(q => q.id !== questionId));
                setSuccess('Question deleted successfully');
            } else if (response.status === 404) {
                setError('Question not found');
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to delete question');
            }
        } catch (err) {
            setError('Error deleting question: ' + err.message);
        }
        setLoading(false);
    };

    // Add result range
    const addResultRange = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const formData = {
                min_score: parseInt(resultRangeForm.min_score) || 0,
                max_score: parseInt(resultRangeForm.max_score) || 0,
                result_text: resultRangeForm.result_text || ''
            };

            const response = await fetch(`${API_BASE_URL}/api/admin/add_result_range/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            setResultRangeForm({
                min_score: '',
                max_score: '',
                result_text: ''
            });
            setSuccess('Result range added successfully');
            
        } catch (err) {
            setError('Error adding result range: ' + err.message);
        }
        setLoading(false);
    };

    // Reset question form
    const resetQuestionForm = () => {
        setQuestionForm({
            order: '',
            question_text: '',
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            score_a: '',
            score_b: '',
            score_c: '',
            score_d: '',
            is_required: false
        });
    };

    // Start editing question
    const startEditQuestion = (question) => {
        setEditingQuestion(question);
        setQuestionForm({
            order: question.order?.toString() || '',
            question_text: question.question_text || '',
            option_a: question.option_a || '',
            option_b: question.option_b || '',
            option_c: question.option_c || '',
            option_d: question.option_d || '',
            score_a: question.score_a?.toString() || '',
            score_b: question.score_b?.toString() || '',
            score_c: question.score_c?.toString() || '',
            score_d: question.score_d?.toString() || '',
            is_required: question.is_required || false
        });
    };

    // Cancel edit
    const cancelEdit = () => {
        setEditingQuestion(null);
        resetQuestionForm();
    };

    // Handle input changes for question form
    const handleQuestionInputChange = (field, value) => {
        setQuestionForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle input changes for result range form
    const handleResultRangeInputChange = (field, value) => {
        setResultRangeForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    // Refresh data when tab changes
    useEffect(() => {
        if (activeTab === 'questions') {
            fetchQuestions();
        }
    }, [activeTab]);

    return (
        <div id="admin-quiz">
            <Navbar />
            
            <div className="min-h-screen bg-purple-200 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section with Background Card */}
                    <div className="relative mb-8">
                        <div className="bg-gradient-to-r from-purple-800 to-purple-900 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-300 rounded-full -translate-y-32 translate-x-32"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-300 rounded-full translate-y-24 -translate-x-24"></div>
                            </div>
                            
                            {/* Content */}
                            <div className="relative z-10">
                                <h1 className="text-4xl font-bold mb-3">Quiz Management</h1>
                                <p className="text-purple-100 text-lg mb-4 max-w-2xl">
                                    Manage questions and result ranges for your quiz. Create engaging quizzes with customizable questions and scoring systems.
                                </p>
                                <div className="flex items-center space-x-6 text-purple-200">
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                        </svg>
                                        <span>Add Questions</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <span>Manage Results</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                        <span>Real-time Updates</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                            {success}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="mb-6 border-b border-purple-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('questions')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'questions'
                                        ? 'border-purple-800 text-purple-800'
                                        : 'border-transparent text-purple-600 hover:text-purple-800 hover:border-purple-400'
                                }`}
                            >
                                Questions
                            </button>
                            <button
                                onClick={() => setActiveTab('resultRanges')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'resultRanges'
                                        ? 'border-purple-800 text-purple-800'
                                        : 'border-transparent text-purple-600 hover:text-purple-800 hover:border-purple-400'
                                }`}
                            >
                                Add Result Range
                            </button>
                        </nav>
                    </div>

                    {/* Questions Tab */}
                    {activeTab === 'questions' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Question Form */}
                            <div className="lg:col-span-1">
                                <div className="bg-white shadow-lg rounded-lg p-6 border border-purple-100">
                                    <h2 className="text-lg font-medium text-purple-800 mb-4">
                                        {editingQuestion ? 'Edit Question' : 'Add New Question'}
                                    </h2>
                                    <form onSubmit={editingQuestion ? updateQuestion : addQuestion}>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-purple-800">Order *</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    value={questionForm.order}
                                                    onChange={(e) => handleQuestionInputChange('order', e.target.value)}
                                                    className="mt-1 block w-full border border-purple-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-800 focus:border-purple-800"
                                                    placeholder="Question order number"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-purple-800">Question Text *</label>
                                                <textarea
                                                    required
                                                    value={questionForm.question_text}
                                                    onChange={(e) => handleQuestionInputChange('question_text', e.target.value)}
                                                    rows="3"
                                                    className="mt-1 block w-full border border-purple-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-800 focus:border-purple-800"
                                                    placeholder="Enter your question here"
                                                />
                                            </div>

                                            {/* Options */}
                                            {['a', 'b', 'c', 'd'].map((option) => (
                                                <div key={option} className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-sm font-medium text-purple-800">
                                                            Option {option.toUpperCase()} *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={questionForm[`option_${option}`]}
                                                            onChange={(e) => handleQuestionInputChange(`option_${option}`, e.target.value)}
                                                            className="mt-1 block w-full border border-purple-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-800 focus:border-purple-800"
                                                            placeholder={`Option ${option.toUpperCase()}`}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-purple-800">
                                                            Score *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            required
                                                            value={questionForm[`score_${option}`]}
                                                            onChange={(e) => handleQuestionInputChange(`score_${option}`, e.target.value)}
                                                            className="mt-1 block w-full border border-purple-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-800 focus:border-purple-800"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={questionForm.is_required}
                                                    onChange={(e) => handleQuestionInputChange('is_required', e.target.checked)}
                                                    className="h-4 w-4 text-purple-800 focus:ring-purple-800 border-purple-300 rounded"
                                                />
                                                <label className="ml-2 block text-sm text-purple-800">
                                                    Required question
                                                </label>
                                            </div>

                                            <div className="flex space-x-3">
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="flex-1 bg-purple-800 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-800 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
                                                >
                                                    {loading ? 'Saving...' : (editingQuestion ? 'Update Question' : 'Add Question')}
                                                </button>
                                                {editingQuestion && (
                                                    <button
                                                        type="button"
                                                        onClick={cancelEdit}
                                                        disabled={loading}
                                                        className="flex-1 bg-purple-200 border-purple-800 border-1 text-purple-800 py-2 px-4 rounded-md hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-800 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Questions List */}
                            <div className="lg:col-span-2">
                                <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-purple-100">
                                    <div className="px-6 py-4 border-b border-purple-200 bg-purple-50">
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-lg font-semibold text-purple-800">
                                                Questions List
                                            </h2>
                                            <span className="bg-purple-800 text-white text-sm font-medium px-2.5 py-0.5 rounded">
                                                Total: {questions.length}
                                            </span>
                                        </div>
                                        {loading && (
                                            <p className="mt-1 text-sm text-purple-600">Loading questions...</p>
                                        )}
                                    </div>
                                    
                                    <div className="divide-y divide-purple-100 max-h-[600px] overflow-y-auto">
                                        {questions.length === 0 && !loading ? (
                                            <div className="p-8 text-center">
                                                <div className="text-purple-400 mb-2">
                                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <p className="text-purple-600 text-lg font-medium">No questions found</p>
                                                <p className="text-purple-500 text-sm mt-1">Add your first question using the form on the left</p>
                                            </div>
                                        ) : (
                                            questions.map((question, index) => (
                                                <div key={question.id} className="p-6 hover:bg-purple-50 transition-colors duration-200">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="flex items-center justify-center w-8 h-8 bg-purple-800 text-white rounded-full font-semibold text-sm">
                                                                {index + 1}
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                                    Order: {question.order}
                                                                </span>
                                                                {question.is_required && (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                        Required
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => startEditQuestion(question)}
                                                                disabled={loading}
                                                                className="inline-flex items-center px-3 py-1.5 border border-purple-800 text-purple-800 rounded-md text-sm font-medium hover:bg-purple-800 hover:text-white transition-colors disabled:opacity-50 duration-200"
                                                            >
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => deleteQuestion(question.id)}
                                                                disabled={loading}
                                                                className="inline-flex items-center px-3 py-1.5 border border-red-800 text-red-800 rounded-md text-sm font-medium hover:bg-red-800 hover:text-white transition-colors disabled:opacity-50 duration-200"
                                                            >
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    <h3 className="text-lg font-medium text-purple-800 mb-4 leading-relaxed">
                                                        {question.question_text}
                                                    </h3>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {['a', 'b', 'c', 'd'].map((option) => (
                                                            <div 
                                                                key={option} 
                                                                className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200"
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="flex items-center justify-center w-6 h-6 bg-white border border-purple-800 rounded text-xs font-medium text-purple-800">
                                                                        {option.toUpperCase()}
                                                                    </div>
                                                                    <span className="text-sm font-medium text-purple-800">
                                                                        {question[`option_${option}`]}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="text-xs text-purple-600 font-medium">Score:</span>
                                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                                        {question[`score_${option}`]}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Result Ranges Tab - Only Add Form */}
                    {activeTab === 'resultRanges' && (
                        <div className="flex justify-center">
                            <div className="w-full max-w-2xl">
                                <div className="bg-purple-50 shadow-lg rounded-lg p-6 border border-purple-200">
                                    <h2 className="text-lg font-medium text-purple-800 mb-4">Add Result Range</h2>
                                    <p className="text-purple-600 mb-4">
                                        Add score ranges and their corresponding result descriptions.
                                    </p>
                                    <form onSubmit={addResultRange}>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-purple-800">Min Score *</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="0"
                                                        value={resultRangeForm.min_score}
                                                        onChange={(e) => handleResultRangeInputChange('min_score', e.target.value)}
                                                        className="mt-1 block w-full border border-purple-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-800 focus:border-purple-800"
                                                        placeholder="Minimum score"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-purple-800">Max Score *</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="0"
                                                        value={resultRangeForm.max_score}
                                                        onChange={(e) => handleResultRangeInputChange('max_score', e.target.value)}
                                                        className="mt-1 block w-full border border-purple-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-800 focus:border-purple-800"
                                                        placeholder="Maximum score"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-purple-800">Result Text *</label>
                                                <textarea
                                                    required
                                                    value={resultRangeForm.result_text}
                                                    onChange={(e) => handleResultRangeInputChange('result_text', e.target.value)}
                                                    rows="4"
                                                    className="mt-1 block w-full border border-purple-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-800 focus:border-purple-800"
                                                    placeholder="Enter the description or result for this score range..."
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-purple-800 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-800 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
                                            >
                                                {loading ? 'Adding...' : 'Add Result Range'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default AdminQuiz;