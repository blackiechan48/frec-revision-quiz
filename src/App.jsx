import { useEffect, useState } from "react";
import { parseQuestions } from "./utils/parser";
import { RAW_QUESTIONS } from "./questions";
import groupPhoto from "./assets/group-photo.jpeg";

const TIME_LIMIT = 90;
const QUESTIONS_PER_QUIZ = 25;
const BEST_SCORE_KEY = "frec3-best-score";
const REMAINING_KEY = "frec3-remaining-indices";

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function App() {
  const [allQuestions, setAllQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [showWelcome, setShowWelcome] = useState(true);
  const [bestScore, setBestScore] = useState(null);

  // Load question bank + best score once
  useEffect(() => {
    const parsed = parseQuestions(RAW_QUESTIONS);
    setAllQuestions(parsed);

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

  // Get next batch with no repeats
  const getNextQuestions = () => {
    let remaining = JSON.parse(localStorage.getItem(REMAINING_KEY));

    if (!remaining || remaining.length < QUESTIONS_PER_QUIZ) {
      remaining = shuffle(
        Array.from({ length: allQuestions.length }, (_, i) => i)
      );
    }

    const selectedIndices = remaining.slice(0, QUESTIONS_PER_QUIZ);
    const updatedRemaining = remaining.slice(QUESTIONS_PER_QUIZ);

    localStorage.setItem(REMAINING_KEY, JSON.stringify(updatedRemaining));

    return selectedIndices.map((i) => allQuestions[i]);
  };

  // Start or retake quiz
  const startQuiz = () => {
    const selectedQuestions = getNextQuestions();

    setQuestions(selectedQuestions);
    setCurrentIndex(0);
    setAnswers({});
    setFinished(false);
    setTimeLeft(TIME_LIMIT);
    setShowWelcome(false);
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

  // Save best score
  useEffect(() => {
    if (!finished) return;

    if (bestScore === null || score > bestScore) {
      localStorage.setItem(BEST_SCORE_KEY, score);
      setBestScore(score);
    }
  }, [finished, score, bestScore]);

  if (allQuestions.length === 0) {
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
          Total questions: <strong>{allQuestions.length}</strong><br />
          Per quiz: <strong>{QUESTIONS_PER_QUIZ}</strong><br />
          
        </p>

        {bestScore !== null && (
          <p>
            🏆 Best score: <strong>{bestScore} / {QUESTIONS_PER_QUIZ}</strong>
          </p>
        )}

        <button onClick={startQuiz}>Start Quiz </button>
      </div>
    );
  }

  // Results screen
  if (finished) {
    return (
      <div className="app">
        <h2>
          Final Score: {score} / {QUESTIONS_PER_QUIZ}
        </h2>

        {bestScore !== null && (
          <p>
            🏆 Best Score: <strong>{bestScore} / {QUESTIONS_PER_QUIZ}</strong>
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

        <button onClick={startQuiz}>Retake Quiz</button>
      </div>
    );
  }

  // Question screen
  const question = questions[currentIndex];

  return (
    <div className="app">
      <h2>
        Question {currentIndex + 1} of {QUESTIONS_PER_QUIZ}
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

// *test mode
// import { useEffect, useState } from "react";
// import { parseQuestions } from "./utils/parser";
// import { RAW_QUESTIONS } from "./questions";
// import groupPhoto from "./assets/group-photo.jpeg";

// const TIME_LIMIT = 100;
// const QUESTIONS_PER_QUIZ = 25;
// const BEST_SCORE_KEY = "frec3-best-score";
// const REMAINING_KEY = "frec3-remaining-indices";

// // 🔴 TEST MODE
// // true  = all questions, fixed order (for reviewing)
// // false = exam mode (25 questions, no repeats until exhausted)
// const TEST_MODE = true;

// function shuffle(array) {
//   return [...array].sort(() => Math.random() - 0.5);
// }

// export default function App() {
//   const [allQuestions, setAllQuestions] = useState([]);
//   const [questions, setQuestions] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [answers, setAnswers] = useState({});
//   const [finished, setFinished] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
//   const [showWelcome, setShowWelcome] = useState(true);
//   const [bestScore, setBestScore] = useState(null);

//   // Load all questions + best score once
//   useEffect(() => {
//     const parsed = parseQuestions(RAW_QUESTIONS);
//     setAllQuestions(parsed);

//     const savedBest = localStorage.getItem(BEST_SCORE_KEY);
//     if (savedBest !== null) {
//       setBestScore(Number(savedBest));
//     }
//   }, []);

//   // Timer logic
//   useEffect(() => {
//     if (showWelcome || finished || questions.length === 0) return;

//     if (timeLeft === 0) {
//       nextQuestion();
//       return;
//     }

//     const timer = setInterval(() => {
//       setTimeLeft((t) => t - 1);
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [timeLeft, showWelcome, finished, questions.length]);

//   // Get next batch (exam mode only)
//   const getNextQuestions = () => {
//     let remaining = JSON.parse(localStorage.getItem(REMAINING_KEY));

//     if (!remaining || remaining.length < QUESTIONS_PER_QUIZ) {
//       remaining = shuffle(
//         Array.from({ length: allQuestions.length }, (_, i) => i)
//       );
//     }

//     const selectedIndices = remaining.slice(0, QUESTIONS_PER_QUIZ);
//     const updatedRemaining = remaining.slice(QUESTIONS_PER_QUIZ);

//     localStorage.setItem(REMAINING_KEY, JSON.stringify(updatedRemaining));

//     return selectedIndices.map((i) => allQuestions[i]);
//   };

//   // Start / Retake quiz
//   const startQuiz = () => {
//     let selectedQuestions;

//     if (TEST_MODE) {
//       // 🧪 Testing mode: all questions, in order
//       selectedQuestions = [...allQuestions];
//     } else {
//       // 🎓 Exam mode
//       selectedQuestions = getNextQuestions();
//     }

//     setQuestions(selectedQuestions);
//     setCurrentIndex(0);
//     setAnswers({});
//     setFinished(false);
//     setTimeLeft(TIME_LIMIT);
//     setShowWelcome(false);
//   };

//   const selectAnswer = (optionIndex) => {
//     setAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
//     nextQuestion();
//   };

//   const nextQuestion = () => {
//     if (currentIndex + 1 >= questions.length) {
//       setFinished(true);
//       return;
//     }
//     setCurrentIndex((i) => i + 1);
//     setTimeLeft(TIME_LIMIT);
//   };

//   const score = questions.reduce(
//     (total, q, i) => total + (answers[i] === q.correctIndex ? 1 : 0),
//     0
//   );

//   // Save best score
//   useEffect(() => {
//     if (!finished) return;

//     if (bestScore === null || score > bestScore) {
//       localStorage.setItem(BEST_SCORE_KEY, score);
//       setBestScore(score);
//     }
//   }, [finished, score, bestScore]);

//   if (allQuestions.length === 0) {
//     return <div className="app">Loading quiz…</div>;
//   }

//   // Welcome screen
//   if (showWelcome) {
//     return (
//       <div className="app welcome">
//         <img src={groupPhoto} alt="Trainee Firefighters" />

//         <h1>🔥 Welcome, Trainee Firefighter</h1>
//         <h2>FREC Level 3 Revision Quiz</h2>

//         <p>
//           Total questions: <strong>{allQuestions.length}</strong><br />
//           Mode:{" "}
//           <strong>{TEST_MODE ? "TEST MODE (ordered)" : "EXAM MODE"}</strong>
//         </p>

//         {bestScore !== null && (
//           <p>
//             🏆 Best score:{" "}
//             <strong>
//               {bestScore} / {TEST_MODE ? allQuestions.length : QUESTIONS_PER_QUIZ}
//             </strong>
//           </p>
//         )}

//         {TEST_MODE && (
//           <p style={{ color: "red", fontWeight: "bold" }}>
//             ⚠ TEST MODE ACTIVE
//           </p>
//         )}

//         <button onClick={startQuiz}>Start Quiz</button>
//       </div>
//     );
//   }

//   // Results screen
//   if (finished) {
//     return (
//       <div className="app">
//         <h2>
//           Final Score: {score} /{" "}
//           {TEST_MODE ? allQuestions.length : QUESTIONS_PER_QUIZ}
//         </h2>

//         {bestScore !== null && (
//           <p>
//             🏆 Best Score:{" "}
//             <strong>
//               {bestScore} /{" "}
//               {TEST_MODE ? allQuestions.length : QUESTIONS_PER_QUIZ}
//             </strong>
//           </p>
//         )}

//         {questions.map((q, i) => (
//           <div key={i} className="result">
//             <p><strong>{q.question}</strong></p>

//             {q.options.map((opt, idx) => {
//               let className = "option";
//               if (idx === q.correctIndex) className += " correct";
//               else if (answers[i] === idx) className += " wrong";

//               return (
//                 <div key={idx} className={className}>
//                   {opt}
//                 </div>
//               );
//             })}
//           </div>
//         ))}

//         <button onClick={startQuiz}>Retake Quiz</button>
//       </div>
//     );
//   }

//   // Question screen
//   const question = questions[currentIndex];

//   return (
//     <div className="app">
//       <h2>
//         Question {currentIndex + 1} of {questions.length}
//       </h2>

//       <div className="timer">⏱ {timeLeft}s</div>

//       <p><strong>{question.question}</strong></p>

//       {question.options.map((option, index) => (
//         <button
//           key={index}
//           className="option"
//           onClick={() => selectAnswer(index)}
//         >
//           {option}
//         </button>
//       ))}
//     </div>
//   );
// }
