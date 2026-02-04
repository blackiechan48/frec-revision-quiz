import { useEffect, useState } from "react";
import { parseQuestions } from "./utils/parser";
import { RAW_QUESTIONS } from "./questions";
import groupPhoto from "./assets/group-photo.jpeg";

const TIME_LIMIT = 30;
const BEST_SCORE_KEY = "frec3-best-score";

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [showWelcome, setShowWelcome] = useState(true);
  const [bestScore, setBestScore] = useState(null);

  // Load questions + best score once
  useEffect(() => {
    const parsed = parseQuestions(RAW_QUESTIONS);
    const shuffled = [...parsed].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);

    const savedBest = localStorage.getItem(BEST_SCORE_KEY);
    if (savedBest !== null) {
      setBestScore(Number(savedBest));
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (showWelcome || finished || questions.length === 0) return;

    if (timeLeft === 0) {
      nextQuestion();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showWelcome, finished, questions.length]);

  const startQuiz = () => {
    setShowWelcome(false);
    setTimeLeft(TIME_LIMIT);
  };

  const selectAnswer = (optionIndex) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
    nextQuestion();
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setTimeLeft(TIME_LIMIT);
  };

  const score = questions.reduce(
    (total, q, i) => total + (answers[i] === q.correctIndex ? 1 : 0),
    0
  );

  // Save best score when quiz finishes
  useEffect(() => {
    if (!finished) return;

    if (bestScore === null || score > bestScore) {
      localStorage.setItem(BEST_SCORE_KEY, score);
      setBestScore(score);
    }
  }, [finished, score, bestScore]);

  if (questions.length === 0) {
    return <div className="app">Loading quiz…</div>;
  }

  // Welcome screen
  if (showWelcome) {
    return (
      <div className="app welcome">
        <img src={groupPhoto} alt="Trainee Firefighters" />

        <h1>🔥 Welcome, Trainee Firefighter</h1>
        <h2>FREC Level 3 Revision Quiz</h2>

        <p>
          {questions.length} questions<br />
          30 seconds per question
        </p>

        {bestScore !== null && (
          <p>
            🏆 Best score: <strong>{bestScore} / {questions.length}</strong>
          </p>
        )}

        <button onClick={startQuiz}>Start Quiz</button>
      </div>
    );
  }

  // Results screen
  if (finished) {
    return (
      <div className="app">
        <h2>
          Final Score: {score} / {questions.length}
        </h2>

        {bestScore !== null && (
          <p>
            🏆 Best Score: <strong>{bestScore} / {questions.length}</strong>
          </p>
        )}

        {questions.map((q, i) => (
          <div key={i} className="result">
            <p><strong>{q.question}</strong></p>

            {q.options.map((opt, idx) => {
              let className = "option";
              if (idx === q.correctIndex) className += " correct";
              else if (answers[i] === idx) className += " wrong";

              return (
                <div key={idx} className={className}>
                  {opt}
                </div>
              );
            })}
          </div>
        ))}

        <button onClick={() => window.location.reload()}>
          Restart Quiz
        </button>
      </div>
    );
  }

  // Question screen
  const question = questions[currentIndex];

  return (
    <div className="app">
      <h2>
        Question {currentIndex + 1} of {questions.length}
      </h2>

      <div className="timer">⏱ {timeLeft}s</div>

      <p><strong>{question.question}</strong></p>

      {question.options.map((option, index) => (
        <button
          key={index}
          className="option"
          onClick={() => selectAnswer(index)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
