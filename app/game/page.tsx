"use client";

import RadialTimer from "@/components/radial-timer";
import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Define the shape of your JSON file
type RawSyllableData = Record<string, string[]>;

export default function Page() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // 1. Get Settings from URL
    // Default to 2000 min words if missing
    const minWordCount = parseInt(searchParams.get("difficulty") || "2000"); 
    // Default to 10 seconds if missing
    const timerDuration = parseInt(searchParams.get("time") || "10");

    const [words, setWords] = useState<string[]>([]);
    const [rawSyllableData, setRawSyllableData] = useState<RawSyllableData>({});
    const [playableSyllables, setPlayableSyllables] = useState<string[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentSyllable, setCurrentSyllable] = useState("");
    const [input, setInput] = useState('');
    const [score, setScore] = useState(0);

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
                const wordRes = await fetch("/assets/wordlist.txt");
                if (!wordRes.ok) throw new Error("Could not find wordlist.txt");
                const wordText = await wordRes.text();
                const wordsData = wordText.split(/\r?\n/);

                // Fetch Syllables
                const syllRes = await fetch("/assets/syllables.json");
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
        if (e.key === 'Enter') checkInput();
    };

    function getNewSyllable() {
        if (playableSyllables.length > 0) {
            const randomIndex = Math.floor(Math.random() * playableSyllables.length);
            setCurrentSyllable(playableSyllables[randomIndex]);
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
        <div className="flex justify-center bg-gray-50 dark:bg-zinc-950">
            <span className="absolute top-4 left-4">
                <Link href="/">
                    <Button variant="ghost">← Back (Escape)</Button>
                </Link>
            </span>
            <div className="flex flex-col justify-center items-center h-screen gap-6">
                
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                    Streak: {score}
                </p>
                
                <RadialTimer 
                    onComplete={handleTimerComplete} 
                    syllable={currentSyllable}
                    duration={timerDuration} 
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
            </div>
        </div>
    );
}