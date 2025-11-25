"use client";

import RadialTimer from "@/components/radial-timer";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// Define the shape of your JSON file
type RawSyllableData = Record<string, string[]>;
type DifficultyLevel = "Easy" | "Medium" | "Hard";

export default function Page() {
    const searchParams = useSearchParams();
    const urlDifficulty = searchParams.get("difficulty");
    const initialDifficulty: DifficultyLevel = 
        (urlDifficulty === "Easy" || urlDifficulty === "Hard") ? urlDifficulty : "Medium";

    const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty);

    const [words, setWords] = useState<string[]>([]);
    const [rawSyllables, setRawSyllables] = useState<RawSyllableData>({});
    const [syllables, setSyllables] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(""); 
    const [currentSyllable, setCurrentSyllable] = useState("");
    const [input, setInput] = useState('');
    const [score, setScore] = useState(0);

    useEffect( () => {
        async function loadData() {
            try {
                setLoading(true);
                setError("");
                
                // 1. Fetch Words
                const wordRes = await fetch("/assets/wordlist.txt");
                if (!wordRes.ok) throw new Error("Could not find wordlist.txt");
                const wordText = await wordRes.text();
                // Split by newline (handles both \r\n and \n)
                const wordsData = wordText.split(/\r?\n/);

                // 2. Fetch Syllables
                const syllRes = await fetch("/assets/syllables.json");
                if (!syllRes.ok) throw new Error("Could not find syllables.json");
                const syllablesData : RawSyllableData = await syllRes.json();

                setWords(wordsData);
                setRawSyllables(syllablesData);

                // 3. Start Game Logic
                if (syllablesData.length > 0) {
                    const randomIndex = Math.floor(Math.random() * syllablesData.length);
                    setCurrentSyllable(syllablesData[randomIndex]);
                } else {
                    setError("Syllable list is empty!");
                }

            } catch (err: any) {
                console.error("Game Load Error:", err);
                setError(err.message || "Failed to load game data");
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [initialDifficulty])

    function processAllSyllables() {
        let all: string[] = [];
        const HARD_MAX = 100;
        const EASY_MIN = 2000;
    }

    if (loading) {
        return <div className="flex h-screen items-center justify-center text-xl">Loading game data...</div>;
    }

    if (error) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 text-red-600">
                <h2 className="text-2xl font-bold">Error</h2>
                <p>{error}</p>
                <p className="text-sm text-gray-500">Check your /public/assets/ folder</p>
            </div>
        );
    }

    const handleInputChange = (event : any) => {
        setInput(event.target.value);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            checkInput();
        }
    };

    function getNewSyllable() {
        if (syllables.length > 0) {
            const randomIndex = Math.floor(Math.random() * syllables.length);
            setCurrentSyllable(syllables[randomIndex]);
        }
    };

    const handleTimerComplete = () => {
        getNewSyllable();
        setScore(0);
    };

    const checkInput = () => {
        const word = input.trim().toLowerCase();

        if (word.length > 0 && words.includes(word) && word.includes(currentSyllable.toLowerCase())) {
            setScore(score + 1);
            getNewSyllable();
            setInput(""); 
        }
    };

    return (
        <div className="flex justify-center bg-gray-50">
            <div className="flex flex-col justify-center items-center h-screen gap-6">
                <p className="text-2xl font-bold text-gray-700">
                    Streak: {score}
                </p>
                
                <RadialTimer 
                    onComplete={handleTimerComplete} 
                    syllable={currentSyllable}
                    duration={10} 
                />
                
                <input
                    id="game-input"
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    suppressHydrationWarning={true}
                    className="border-2 border-gray-300 rounded-lg p-2 text-center text-lg w-64 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Type a word..."
                    autoFocus
                    autoComplete="off"
                />
            </div>
        </div>
    );
}