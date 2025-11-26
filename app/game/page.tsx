"use client";

import RadialTimer from "@/components/radial-timer";
import { Suspense, use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type RawSyllableData = Record<string, string[]>;
type Highscore = {
    streak: number;
    difficulty: number;
    time: number;
    timestamp: number;
}
const basePath = process.env.NODE_ENV === 'production' 
  ? '/bombpartylocal' 
  : '';

function GameLogic() {
    
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const minWordCount = parseInt(searchParams.get("difficulty") || "2000"); 
    const timerDuration = parseInt(searchParams.get("time") || "8");

    const [words, setWords] = useState<string[]>([]);
    const [rawSyllableData, setRawSyllableData] = useState<RawSyllableData>({});
    const [playableSyllables, setPlayableSyllables] = useState<string[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentSyllable, setCurrentSyllable] = useState("");
    const [input, setInput] = useState('');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [usedWords, setUsedWords] = useState<Set<string>>(new Set());

    const [flashError, setFlashError] = useState(false);
    const [ended, setEnded] = useState(false);

    const getStorageKey = (diff: number, time: number) => `bp_hs_${diff}_${time}`;

    //get high score from local storage
    useEffect(() => {
        const key = getStorageKey(minWordCount, timerDuration);
        const storedHighScore = localStorage.getItem(key);
        if (storedHighScore) {
            try {
                const parsed : Highscore = JSON.parse(storedHighScore);
                setHighScore(parsed.streak);
            } catch (e) {
                console.error("Failed to parse high score from localStorage", e);
            } 
        }
    }, [minWordCount, timerDuration]);

    

    useEffect( () => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                router.push(`/`);
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [minWordCount, timerDuration, router]);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                setError("");
                
                // Fetch Words
                const wordRes = await fetch(`${basePath}/assets/wordlist.txt`);
                if (!wordRes.ok) throw new Error("Could not find wordlist.txt");
                const wordText = await wordRes.text();
                const wordsData = wordText.split(/\r?\n/);

                // Fetch Syllables
                const syllRes = await fetch(`${basePath}/assets/syllables.json`);
                if (!syllRes.ok) throw new Error("Could not find syllables.json");
                const syllablesData: RawSyllableData = await syllRes.json();

                setWords(wordsData);
                setRawSyllableData(syllablesData);

                // Process initial list based on the numeric threshold
                const initialList = processSyllables(syllablesData, minWordCount);
                setPlayableSyllables(initialList);

                // Start Game
                if (initialList.length > 0) {
                    const randomIndex = Math.floor(Math.random() * initialList.length);
                    setCurrentSyllable(initialList[randomIndex]);
                } else {
                    setError(`No syllables found with > ${minWordCount} words.`);
                }

            } catch (err: any) {
                console.error("Game Load Error:", err);
                setError(err.message || "Failed to load game data");
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [minWordCount]) 

    function processSyllables(data: RawSyllableData, threshold: number): string[] {
        let all: string[] = [];
        
        Object.entries(data).forEach(([countStr, syllables]) => {
            const count = parseInt(countStr);
            if (count >= threshold) {
                all.push(...syllables);
            }
        });

        return all;
    }

    if (loading) return <div className="flex h-screen items-center justify-center text-xl">Loading...</div>;

    if (error) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 text-red-600">
                <h2 className="text-2xl font-bold">Error</h2>
                <p>{error}</p>
                <a href="/" className="text-blue-500 hover:underline">Return Home</a>
            </div>
        );
    }

    const handleInputChange = (event : any) => setInput(event.target.value);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (ended) {
                setEnded(false);
            
                setUsedWords(new Set());
                getNewSyllable();
                if (score > highScore) {
                    const newEntry : Highscore = {
                        streak: score,
                        difficulty: minWordCount,
                        time: timerDuration,
                        timestamp: Date.now()
                    };
                    setHighScore(score);
                    localStorage.setItem(getStorageKey(minWordCount, timerDuration), JSON.stringify(newEntry));
                }
                setScore(0);
            } else {
                checkInput();
            }
        }
    };

    function getNewSyllable() {
        if (playableSyllables.length > 0) {
            const randomIndex = Math.floor(Math.random() * playableSyllables.length);
            setCurrentSyllable(playableSyllables[randomIndex]);
        }
    };

    //runs when game over
    const handleTimerComplete = () => {
        setFlashError(true);
        setEnded(true);

        //wait for enter key before resetting
    };

    const checkInput = () => {
        const word = input.trim().toLowerCase();
        if (word.length > 0 
                && words.includes(word) 
                && word.includes(currentSyllable.toLowerCase())) {

            if (usedWords.has(word)) {
                setFlashError(true);
                setTimeout(() => setFlashError(false), 100);
                return;
            }
            setScore(score + 1);
            getNewSyllable();
            setUsedWords(prev => new Set(prev).add(word));
        } else {
            setFlashError(true);
            setTimeout(() => setFlashError(false), 10);
        }
        setInput(""); 
    };

    return (
        <div className="flex justify-center bg-gray-50 dark:bg-zinc-950">
            <span className="absolute top-4 left-4">
                <Link href="/">
                    <Button variant="ghost" className="italic">← Back (Escape)</Button>
                </Link>
            </span>

            <div className="absolute right-8 top-1/2 -translate-y-1/2 w-64 h-[70vh] hidden xl:block pointer-events-none animate-in slide-in-from-right-2 fade-in duration-300">
                <div className="p-4 h-full flex flex-col pointer-events-auto">
                    <div className="flex justify-end items-end border-b border-gray-200 dark:border-zinc-800 pb-2 mb-2">
                        <h3 className="text-sm text-right font-bold text-gray-500 uppercase tracking-wider">
                            Used Words
                        </h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
                        <ul className="flex flex-col gap-2">
                            {Array.from(usedWords).reverse().map((word) => (
                                <li 
                                    key={word} 
                                    className="text-lg text-right font-medium text-gray-700 dark:text-gray-300 animate-in slide-in-from-left-2 fade-in duration-300"
                                >
                                    {word}
                                </li>
                            ))}
                            {usedWords.size === 0 && (
                                <li className="text-sm text-gray-400 italic text-center mt-10 opacity-50">
                                    Words you type will appear here...
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex flex-col justify-center items-center h-screen gap-6">
                
                <p className="text-lg font-bold text-gray-700 dark:text-gray-400">
                    Highest Streak: {highScore}
                </p>

                <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                    Streak: {score}
                </p>
                
                <RadialTimer 
                    onComplete={handleTimerComplete} 
                    syllable={currentSyllable}
                    duration={timerDuration} 
                    isError={flashError}
                />
                
                <input
                    id="game-input"
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    suppressHydrationWarning={true}
                    className="border-2 border-gray-300 rounded-lg p-2 text-center text-lg w-64 focus:outline-none focus:border-blue-500 transition-colors text-white"
                    placeholder="Type a word..."
                    autoFocus
                    autoComplete="off"
                />

                {ended && (
                    <div className="mt-4 text-center">
                        <p className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            Enter to Restart.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

//wrapper to enable suspense
export default function Page() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-xl">Loading...</div>}>
            <GameLogic />
        </Suspense>
    )
}