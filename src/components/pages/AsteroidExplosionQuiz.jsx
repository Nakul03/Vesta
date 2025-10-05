import React, { useState, useEffect, useCallback } from 'react';
import './AsteroidExplosionQuiz.css';

const QUESTIONS = [
    {
        question: "What is the largest asteroid in our solar system?",
        options: ["Ceres", "Vesta", "Pallas", "Hygiea"],
        correct: 0
    },
    {
        question: "How fast do asteroids typically travel through space?",
        options: ["5-10 km/s", "15-25 km/s", "50-70 km/s", "100+ km/s"],
        correct: 1
    },
    {
        question: "What caused the extinction of dinosaurs 65 million years ago?",
        options: ["Volcanic eruption", "Climate change", "Asteroid impact", "Disease"],
        correct: 2
    },
    {
        question: "Where are most asteroids located in our solar system?",
        options: ["Near Earth orbit", "Between Mars and Jupiter", "Beyond Neptune", "Near the Sun"],
        correct: 1
    },
    {
        question: "What size asteroid would cause global devastation?",
        options: ["100 meters", "1 kilometer", "10 kilometers", "100 kilometers"],
        correct: 2
    },
    {
        question: "How often does a large asteroid (1km+) hit Earth?",
        options: ["Every 1,000 years", "Every 100,000 years", "Every 500,000 years", "Every few million years"],
        correct: 3
    },
    {
        question: "What is the name of the space agency program that tracks near-Earth asteroids?",
        options: ["Spaceguard", "Asteroid Watch", "Near Earth Object Program", "All of the above"],
        correct: 3
    },
    {
        question: "What percentage of potentially hazardous asteroids have we discovered?",
        options: ["Nearly 100%", "About 90%", "About 50%", "Less than 30%"],
        correct: 1
    }
];

const MAX_DISTANCE = 1000;
const IMPACT_DISTANCE = 0;
const WRONG_ANSWER_APPROACH = 200; // each wrong answer moves asteroid closer

const AsteroidExplosionQuiz = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [distance, setDistance] = useState(MAX_DISTANCE);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [showExplosion, setShowExplosion] = useState(false);
    const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'win', 'lose'
    const [wrongAnswersCount, setWrongAnswersCount] = useState(0);

    const question = QUESTIONS[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;

    const restartGame = useCallback(() => {
        setCurrentQuestionIndex(0);
        setScore(0);
        setDistance(MAX_DISTANCE);
        setSelectedAnswer(null);
        setIsAnimating(false);
        setIsGameOver(false);
        setShowExplosion(false);
        setGameStatus('playing');
        setWrongAnswersCount(0);
    }, []);

    useEffect(() => {
        if ((distance <= IMPACT_DISTANCE || wrongAnswersCount >= 3) && !isGameOver && gameStatus === 'playing') {
            setGameStatus('lose');
            setIsGameOver(true);
            setTimeout(() => setShowExplosion(true), 1000);
        }
    }, [distance, wrongAnswersCount, isGameOver, gameStatus]);

    const selectAnswer = (selectedIndex) => {
        if (selectedAnswer !== null || isGameOver || isAnimating) return;

        setSelectedAnswer(selectedIndex);
        setIsAnimating(true);

        const isCorrect = selectedIndex === question.correct;

        if (isCorrect) {
            setScore(prev => prev + 10);
            setDistance(prev => Math.min(prev + WRONG_ANSWER_APPROACH, MAX_DISTANCE)); // reward: move asteroid away
        } else {
            setDistance(prev => Math.max(prev - WRONG_ANSWER_APPROACH, IMPACT_DISTANCE));
            setWrongAnswersCount(prev => prev + 1);
        }

        setTimeout(() => {
            setIsAnimating(false);
            if (isCorrect && isLastQuestion) {
                setGameStatus('win');
                setIsGameOver(true);
            }
        }, 1500);
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < QUESTIONS.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
        }
    };

    const getAsteroidClass = () => {
        if (isGameOver && gameStatus === 'lose') return 'asteroid impact';
        if (selectedAnswer !== null && selectedAnswer !== question.correct) return 'asteroid approaching';
        return 'asteroid';
    };

    const showNextButton = 
        selectedAnswer !== null && 
        !isAnimating && 
        !isGameOver && 
        distance > IMPACT_DISTANCE &&
        !isLastQuestion && 
        selectedAnswer !== question.correct;

    const showAdvanceButton = 
        selectedAnswer === question.correct && 
        !isAnimating && 
        !isLastQuestion;

    const getOptionClass = (index) => {
        let classes = "option";
        if (selectedAnswer !== null) {
            if (index === question.correct) classes += ' correct';
            else if (index === selectedAnswer) classes += ' wrong';
        }
        return classes;
    };

    return (
        <div className="game-container">
            <div className="stars"></div>
            <div className="earth"></div>
            <div className={getAsteroidClass()} id="asteroid"></div>
            {showExplosion && <div className="explosion"></div>}

            {!isGameOver && (
                <div className="quiz-container">
                    <div className="score">Score: <span>{score}</span></div>
                    <div className="distance">Asteroid Distance: <span>{distance}</span> km</div>
                    <div className="question">{question.question}</div>
                    <div className="options">
                        {question.options.map((option, index) => (
                            <button
                                key={index}
                                className={getOptionClass(index)}
                                onClick={() => selectAnswer(index)}
                                disabled={selectedAnswer !== null || isAnimating}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                    {(showNextButton || showAdvanceButton) && (
                        <button className="next-btn" onClick={nextQuestion}>
                            {showAdvanceButton ? 'Next Question' : 'Continue'}
                        </button>
                    )}
                </div>
            )}

            {isGameOver && (
                <div className="game-over">
                    {gameStatus === 'lose' ? (
                        <>
                            <h2>💥 IMMINENT FAILURE! 💥</h2>
                            <p>The asteroid has impacted Earth! Humanity is DOOMED!</p>
                        </>
                    ) : (
                        <>
                            <h2>⭐ PLANETARY SAVIOR! ⭐</h2>
                            <p>You deflected all asteroids and saved the planet!</p>
                        </>
                    )}
                    <p>Final Score: <span>{score}</span></p>
                    <button className="restart-btn" onClick={restartGame}>Restart Simulation</button>
                </div>
            )}
        </div>
    );
};

export default AsteroidExplosionQuiz;
