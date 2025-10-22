import React, { useState, useEffect } from 'react';
import Navbar from "../components/navbar";
import Footer from "../components/footer";

import quizImage from "../assets/quiz-image.jpg";

const CustomerQuiz = () => {
    const [currentAttempt, setCurrentAttempt] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedOption, setSelectedOption] = useState('');
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [quizResult, setQuizResult] = useState(null);
    const [answeredQuestions, setAnsweredQuestions] = useState(0);
    const [customerInfo, setCustomerInfo] = useState(null);
    
    const API_BASE_URL = 'http://localhost:8000';

    // Check authentication and get customer info
    useEffect(() => {
        checkAuthentication();
    }, []);

    const checkAuthentication = () => {
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
            try {
                const user = JSON.parse(userData);
                setCustomerInfo({
                    id: user.id || user.customer_id || 1,
                    name: user.customer_name || user.username || 'User'
                });
            } catch (e) {
                console.error('Error parsing user data:', e);
                setCustomerInfo({
                    id: 1,
                    name: 'User'
                });
            }
        } else {
            setCustomerInfo({
                id: 1,
                name: 'Guest User'
            });
        }
    };

    // Start a new quiz attempt
    const startQuiz = async () => {
        setLoading(true);
        setError('');
        try {
            console.log('Starting quiz...');
            
            const token = localStorage.getItem('access_token');
            const customerId = customerInfo?.id || 1;

            const requestBody = {
                customer_id: customerId
            };

            console.log('Sending request with:', requestBody);

            const headers = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/api/start_quiz_attempt/`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);
            
            if (response.status === 401) {
                throw new Error('Please log in to start the quiz');
            }
            
            if (response.status === 404) {
                throw new Error('Customer profile not found.');
            }
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to start quiz: ${response.status}`);
            }

            const attempt = await response.json();
            console.log('Quiz attempt created:', attempt);
            setCurrentAttempt(attempt);
            await getNextQuestion(attempt.id);
            
        } catch (err) {
            console.error('Start quiz error:', err);
            setError(err.message);
        }
        setLoading(false);
    };

    // Get next question
    const getNextQuestion = async (attemptId) => {
        setLoading(true);
        try {
            console.log('Getting next question for attempt:', attemptId);
            const response = await fetch(`${API_BASE_URL}/api/get_next_question/${attemptId}/`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch question: ${response.status}`);
            }

            const data = await response.json();
            console.log('Next question data:', data);
            
            if (data.done) {
                console.log('Quiz completed, finishing...');
                await finishQuiz(attemptId);
            } else {
                setCurrentQuestion(data);
                setSelectedOption('');
                setAnsweredQuestions(prev => prev + 1);
            }
        } catch (err) {
            console.error('Get next question error:', err);
            setError('Error fetching question: ' + err.message);
        }
        setLoading(false);
    };

    // Submit answer
    const submitAnswer = async () => {
        if (!selectedOption) {
            setError('Please select an option');
            return;
        }

        setLoading(true);
        setError('');
        try {
            console.log('Submitting answer:', { 
                questionId: currentQuestion.id, 
                chosenOption: selectedOption 
            });

            const response = await fetch(`${API_BASE_URL}/api/submit_answer/${currentAttempt.id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question_id: currentQuestion.id,
                    chosen_option: selectedOption
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to submit answer: ${response.status}`);
            }

            const result = await response.json();
            console.log('Answer submitted successfully:', result);
            setSuccess('Answer submitted successfully!');
            
            setTimeout(() => {
                getNextQuestion(currentAttempt.id);
            }, 1000);
            
        } catch (err) {
            console.error('Submit answer error:', err);
            setError('Error submitting answer: ' + err.message);
        }
        setLoading(false);
    };

    // Finish quiz
    const finishQuiz = async (attemptId) => {
        setLoading(true);
        try {
            console.log('Finishing quiz attempt:', attemptId);

            const response = await fetch(`${API_BASE_URL}/api/finish_attempt/${attemptId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to finish quiz: ${response.status}`);
            }

            const result = await response.json();
            console.log('Quiz finished with result:', result);
            setQuizResult(result);
            setQuizCompleted(true);
            setCurrentAttempt(result);
            
        } catch (err) {
            console.error('Finish quiz error:', err);
            setError('Error finishing quiz: ' + err.message);
        }
        setLoading(false);
    };

    // Handle option selection
    const handleOptionSelect = (option) => {
        setSelectedOption(option);
        setError('');
    };

    // Start new quiz
    const handleStartNewQuiz = () => {
        setCurrentAttempt(null);
        setCurrentQuestion(null);
        setQuizCompleted(false);
        setQuizResult(null);
        setSelectedOption('');
        setAnsweredQuestions(0);
        setError('');
        setSuccess('');
        startQuiz();
    };

    // Calculate progress percentage
    const progressPercentage = Math.min((answeredQuestions / 10) * 100, 100);

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

    return (
        <div id="assessments">
            <Navbar />
            
            <div className="min-h-screen bg-purple-200 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section with Image */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-30 items-center mb-12">
                     {/* Left Side - Content */}
                <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start mb-14"></div>
                    {/* Quiz Not Started */}
                    {!currentAttempt && !loading && !quizCompleted && (
                        <div className="text-center py-8">
                            <div className="bg-purple-50 rounded-2xl shadow-xl p-10 max-w-md mx-auto border border-purple-100">
                                <div className="w-24 h-24 bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold text-purple-800 mb-4">Ready to Begin?</h2>
                                <p className="text-purple-900 mb-8 text-lg leading-relaxed">
                                    Take our personality quiz to discover insights about yourself. 
                                    Answer honestly for the most accurate results!
                                </p>
                                <button
                                    onClick={startQuiz}
                                    disabled={loading}
                                    className="w-full bg-purple-800 text-white py-4 px-8 rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-200 disabled:opacity-50 transform hover:-translate-y-1 shadow-lg hover:shadow-xl font-semibold text-lg"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                            Starting...
                                        </div>
                                    ) : (
                                        'Start Quiz Journey'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                    {/* Current Question Section */}
                    {currentQuestion && !quizCompleted && (
                        <div className="bg-purple-50 rounded-2xl shadow-xl p-6 border border-purple-200">
                            {/* Progress Bar */}
                            <div className="mb-10">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-semibold text-purple-800">
                                        Question {answeredQuestions}
                                    </span>
                                    <span className="text-sm font-semibold text-purple-700">
                                        {Math.round(progressPercentage)}% Complete
                                    </span>
                                </div>
                                <div className="w-full bg-purple-100 rounded-full h-3 shadow-inner">
                                    <div 
                                        className="bg-purple-800 h-3 rounded-full transition-all duration-700 ease-out shadow-md"
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Question */}
                            <div className="mb-8">
                                <div className="flex items-start mb-4">
                                    <h2 className="text-2xl font-bold text-purple-900 leading-relaxed">
                                        {currentQuestion.question_text}
                                    </h2>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-2 mb-6">
                                {['a', 'b', 'c', 'd'].map((option) => (
                                    currentQuestion[`option_${option}`] && (
                                        <div
                                            key={option}
                                            onClick={() => handleOptionSelect(option)}
                                            className={`p-3.5 border-2 rounded-xl cursor-pointer transition-all duration-300 group ${
                                                selectedOption === option
                                                    ? 'border-purple-600 bg-purple-50 shadow-lg transform scale-105'
                                                    : 'border-purple-200 hover:border-purple-400 hover:bg-purple-25 hover:shadow-md'
                                            }`}
                                        >
                                            <div className="flex items-start">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 mt-1 flex-shrink-0 transition-colors ${
                                                    selectedOption === option
                                                        ? 'border-purple-700 bg-purple-700 shadow-inner'
                                                        : 'border-purple-400 group-hover:border-purple-500'
                                                }`}>
                                                    {selectedOption === option && (
                                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="flex items-center">
                                                    <span className={`font-bold text-lg mr-4 ${
                                                        selectedOption === option ? 'text-purple-700' : 'text-purple-600'
                                                    }`}>
                                                        {option.toUpperCase()}.
                                                    </span>
                                                    <span className="text-purple-900 text-lg leading-relaxed font-medium">
                                                        {currentQuestion[`option_${option}`]}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={submitAnswer}
                                disabled={!selectedOption || loading}
                                className="w-full bg-purple-800 text-white py-4 px-8 rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 shadow-lg hover:shadow-xl font-semibold text-lg"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                                        Processing Your Answer...
                                    </div>
                                ) : (
                                    'Submit Answer & Continue'
                                )}
                            </button>
                        </div>
                    )}
                    {/* Quiz Results Section */}
{quizCompleted && quizResult && (
    <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-2xl p-6 border border-purple-200">
        <div className="text-center mb-8">
            <div className="w-20 h-20 bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ring-4 ring-purple-100">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            
            <h2 className="text-3xl font-bold bg-purple-800 bg-clip-text text-transparent mb-2">
                Quiz Completed!
            </h2>
            <p className="text-purple-900 font-medium">Great job on finishing the assessment</p>
        </div>

        {/* Result Text */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 mb-6 border border-purple-200 shadow-sm">
            <h3 className="text-xl font-bold text-purple-800 mb-4 text-center flex items-center justify-center">
                <svg className="w-5 h-5 mr-2 text-purple-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Your Personality Profile
            </h3>
            <div className="bg-white rounded-lg p-4 border border-purple-100 shadow-inner">
                <p className="text-purple-700 text-base leading-relaxed text-center font-medium">
                    {quizResult.result_text || "Your personalized results will be displayed here."}
                </p>
            </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center border border-purple-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="text-2xl font-bold text-purple-800 mb-2">
                    {answeredQuestions}
                </div>
                <div className="text-purple-800 font-semibold text-sm">Questions</div>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-xl text-center border border-purple-300 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-2xl font-bold text-purple-900 mb-2">{quizResult.total_score}</div>
                <div className="text-purple-800 font-semibold text-sm">Total Score</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center border border-indigo-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="text-2xl font-bold text-purple-800 mb-2">
                    {quizResult.completed_at ? new Date(quizResult.completed_at).toLocaleDateString() : 'Today'}
                </div>
                <div className="text-purple-800 font-semibold text-sm">Completed</div>
            </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
                onClick={handleStartNewQuiz}
                className="bg-purple-800 text-white py-3 px-8 rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl font-semibold text-base"
            >
                Take Quiz Again
            </button>
        </div>
    </div>
)}

                        </div>

                        {/* Right Side - Image */}
                        <div className="flex justify-center lg:justify-end">
                            <div className="relative">
                                <div className="w-full h-96 lg:h-[500px] rounded-3xl overflow-hidden">
                                    {/* Use your actual image */}
                                    <img 
                                        src={quizImage} 
                                        alt="Personality Quiz" 
                                        className="w-full h-full object-cover rounded-3xl"
                                    />
                                </div>
                                
                            </div>
                        </div>
                    </div>

                    
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default CustomerQuiz;