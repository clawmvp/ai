"use client";
import { useState } from 'react';
import { HelpCircle, Check, X } from 'lucide-react';

interface Question {
    id: number;
    text: string;
    options: string[];
    correctIndex: number;
}

export function Quiz({ questions }: { questions: Question[] }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);

    const handleAnswer = (index: number) => {
        setSelectedOption(index);
        setShowResult(true);
        if (index === questions[currentQuestion].correctIndex) {
            setScore(score + 1);
        }
    };

    const nextQuestion = () => {
        setSelectedOption(null);
        setShowResult(false);
        setCurrentQuestion(currentQuestion + 1);
    };

    if (currentQuestion >= questions.length) {
        return (
            <div className="bg-green-50 rounded-xl p-8 text-center border border-green-100">
                <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <Award className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-green-900 mb-2">Quiz Complet!</h3>
                <p className="text-green-800 text-lg">Ai răspuns corect la {score} din {questions.length} întrebări.</p>
                <button
                    onClick={() => { setCurrentQuestion(0); setScore(0); setSelectedOption(null); setShowResult(false); }}
                    className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                    Reîncepe
                </button>
            </div>
        );
    }

    const q = questions[currentQuestion];

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6 my-8">
            <div className="flex items-center gap-2 mb-4 text-blue-600 font-semibold uppercase text-xs tracking-wider">
                <HelpCircle className="h-4 w-4" />
                Quiz: Întrebarea {currentQuestion + 1} / {questions.length}
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-6">{q.text}</h3>

            <div className="space-y-3">
                {q.options.map((opt, idx) => {
                    let btnClass = "w-full text-left p-4 rounded-lg border-2 transition-all flex justify-between items-center ";
                    if (showResult) {
                        if (idx === q.correctIndex) btnClass += "border-green-500 bg-green-50 text-green-900";
                        else if (idx === selectedOption) btnClass += "border-red-500 bg-red-50 text-red-900";
                        else btnClass += "border-gray-100 opacity-50";
                    } else {
                        btnClass += "border-gray-100 hover:border-blue-200 hover:bg-blue-50";
                    }

                    return (
                        <button
                            key={idx}
                            disabled={showResult}
                            onClick={() => handleAnswer(idx)}
                            className={btnClass}
                        >
                            <span>{opt}</span>
                            {showResult && idx === q.correctIndex && <Check className="h-5 w-5 text-green-600" />}
                            {showResult && idx === selectedOption && idx !== q.correctIndex && <X className="h-5 w-5 text-red-600" />}
                        </button>
                    )
                })}
            </div>

            {showResult && (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={nextQuestion}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                    >
                        {currentQuestion < questions.length - 1 ? "Următoarea Întrebare" : "Vezi Rezultatul"}
                    </button>
                </div>
            )}
        </div>
    );
}

// Need to import Award locally since it's used
import { Award } from 'lucide-react';
