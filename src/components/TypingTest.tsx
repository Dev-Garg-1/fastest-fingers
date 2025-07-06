import React, { useEffect, useRef, useState } from 'react';

// const words: string[] = [
//   'apple', 'pen', 'bus', 'cricket', 'truck',
//   'book', 'maths', 'hello', 'paper', 'exams'
// ];

const TypingTest = () => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [wordList, setWordList] = useState<string[]>([]);
  const activeWordRef = useRef<HTMLSpanElement | null>(null);
  const [wordStatus, setWordStatus] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);

  const timeElapsed = 60 - timeLeft;
  const wpm = timeElapsed > 0 ? Math.round((correctCount / timeElapsed) * 60) : 0;
  const accuracy = correctCount + incorrectCount > 0
    ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
    : 0;

    const fetchSentences = async (count: number) => {

        if(isFetchingRef.current) return;

        isFetchingRef.current = true;
        const sentences: string[] = [];

        for(let i = 0; i < count; i++) {
            try {
                const res = await fetch('http://api.quotable.io/random');
                const data = await res.json();
                const words = data.content.split(' ');
                sentences.push(...words);
            } catch (error) {
                console.log("failed to fetch quote:", error);
                setWordList(["This", "is", "a", "fallback", "sentence"])
            }
        }

        setWordList((prev) => [...prev, ...sentences]);

        setWordStatus((prev) => [...prev, ...new Array(sentences.length).fill(null)]);

        setIsLoading(false);
        isFetchingRef.current = false;
    }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isRunning) {
      setIsRunning(true);
    }

    const value = e.target.value;

    if (value.endsWith(' ')) {
      const trimmed = value.trim();
      const targetWord = wordList[currentIndex]?.trim();
      const isCorrect = trimmed === targetWord;

      if (trimmed === targetWord) {
        setCorrectCount((prev) => prev + 1);
      } else {
        setIncorrectCount((prev) => prev + 1);
      }

      setWordStatus((prev) => {
        const newStatus = [...prev];
        newStatus[currentIndex] = isCorrect;
        return newStatus;
      })

      setCurrentIndex((prev) => prev + 1);
      setCurrentInput('');
    } else {
      setCurrentInput(value);
    }
  };

  const handleRestart = () => {
    window.location.reload();
  };

  useEffect(() => {
    fetchSentences(3);
  }, []);

  useEffect(() => {
    if (currentIndex > wordList.length - 10) {
        fetchSentences(2);
    }
  }, [currentIndex, wordList.length])

  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft === 0) {
      setIsFinished(true);
      setIsRunning(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
4/5
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if(activeWordRef.current) {
        activeWordRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center"
        })
    }
  }, [currentIndex])

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold mb-6 text-center">⌨️ Typing Speed Test</h1>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-700 rounded mb-4 overflow-hidden">
        <div
            className="h-full bg-yellow-400 transition-[width] duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 60) * 100}%` }}
        />
        </div>

        {/* Timer */}
        <div className="text-right text-sm text-gray-400 mb-4">
          Time Left: <span className="text-yellow-400">{timeLeft}s</span>
        </div>

        {/* Words Display */}
        {isLoading 
        ? (<div className="text-center text-gray-400">Loading...</div>)
        :(
        <div className="bg-gray-800 p-6 rounded-md text-lg font-mono flex flex-wrap gap-2 leading-relaxed min-h-[120px] border border-gray-700">
          {wordList.map((word, index) => {
            const isActive = index === currentIndex;
            const letters = word.split('');

            return (
                <span 
                key={index} 
                ref={isActive ? activeWordRef : null}
                className={`flex gap-[1px] ${
                    wordStatus[index] == true
                    ? 'text-green-400'
                    : wordStatus[index] == false
                    ? 'text-red-400'
                    :''
                }`}
                >
                    {isActive
                    ? (
                    <>
                        {letters.map((char, charIndex) => {
                        const inputChar = currentInput[charIndex];

                        let className = '';

                        if(inputChar == null) {
                            className = 'text-gray-400';
                        }else if(inputChar === char) {
                            className = 'text-green-400';
                        }else {
                            className = 'text-red-400';
                        }

                        const showCaret = charIndex === currentInput.length || (currentInput.length === 0 && charIndex === 0);

                        return (
                            <span key={charIndex} className="relative">
                            {showCaret && (
                                <span className="absolute -left-1 top-0 w-[2px] h-full bg-yellow-300 animate-caret" />
                            )}
                            <span className={className}>{char}</span>
                            </span>
                        )
                    })}
                    </>
                    ) : (
                        word
                    )}
                </span>
            );
          })}
        </div>
        )}

        {/* Hidden Input Field */}
        <input
          autoFocus
          type="text"
          value={currentInput}
          onChange={handleChange}
          disabled={isFinished}
          className="mt-6 opacity-0 w-0 h-0"
        />

        {/* Word Stats */}
        <div className="mt-6 flex justify-between text-sm text-gray-400">
          <p>✅ Correct: <span className="text-green-400">{correctCount}</span></p>
          <p>❌ Incorrect: <span className="text-red-400">{incorrectCount}</span></p>
        </div>

        {/* Results */}
        {isFinished && (
          <div className="mt-8 p-6 rounded-lg bg-gray-800 border border-gray-700 shadow-md">
            <h2 className="text-xl font-semibold mb-2 text-yellow-300">🎉 Results</h2>
            <p>🔢 Words Typed: <strong>{correctCount + incorrectCount}</strong></p>
            <p>✅ Correct: <strong>{correctCount}</strong></p>
            <p>❌ Incorrect: <strong>{incorrectCount}</strong></p>
            <p>🚀 WPM: <strong>{wpm}</strong></p>
            <p>🎯 Accuracy: <strong>{accuracy}%</strong></p>
            <button
              onClick={handleRestart}
              className="mt-4 px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded transition"
            >
              🔁 Restart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TypingTest;
