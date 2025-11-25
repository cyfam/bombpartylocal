"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Highscore = {
  streak: number;
  difficulty: number;
  time: number;
  timestamp: number;
}

export default function Home() {
  const router = useRouter();
  
  const [diffValue, setDiffValue] = useState(2000);
  const [sliderValue, setSliderValue] = useState(8);
  const [settings, setSettings] = useState(false);

  const [scores, setScores] = useState<Highscore[]>([]);

  function toggleSettings() {
    setSettings(!settings);
  }

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  useEffect(() => {
    const scores: Highscore[] = [];
    
    // Iterate through all keys in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Check if the key matches our game's prefix "bp_hs_"
      if (key && key.startsWith("bp_hs_")) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            scores.push(JSON.parse(item));
          }
        } catch (e) {
          console.error("Bad score data", e);
        }
      }
    }

    // Sort by Streak (Descending) -> Take Top 5
    const sorted = scores.sort((a, b) => b.streak - a.streak).slice(0, 5);
    setScores(sorted);
  }, [settings]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && settings) toggleSettings();
      else if (e.key === 's' || e.key === 'Tab') toggleSettings();
      else if (e.key === "Enter") {
        router.push(`/game?difficulty=${diffValue}&time=${sliderValue}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [settings, diffValue, sliderValue, router]);

  return (
    <div className="relative h-dvh flex flex-col overflow-hidden">
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 w-full max-w-7xl mx-auto">
        
        <div className="flex flex-col items-center justify-center p-8 gap-8 animate-in slide-in-from-left-8 fade-in duration-700">
          <h1 className="text-5xl lg:text-6xl font-bold text-center tracking-tight">
            Bomb Party<br/>Practice
          </h1>

          <Link href={`/game?difficulty=${diffValue}&time=${sliderValue}`}>
            <Button variant="outline" size="lg" className="px-10 py-6 text-xl">
              <span>Start Game</span>
            </Button>
          </Link>

          <Button variant="outline" size="lg" onClick={toggleSettings}>
              <span>Settings</span>
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center p-8 bg-muted/5">
            {scores.length > 0 ? (
                <div className="w-full max-w-md animate-in slide-in-from-right-8 fade-in duration-700">
                    <h2 className="text-sm font-bold tracking-widest text-muted-foreground mb-6 text-center lg:text-left">
                        Streaks
                    </h2>
                    
                    <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground text-sm">
                            <tr>
                                <th className="px-4 py-3 text-center">#</th>
                                <th className="px-4 py-3 text-right">Streak</th>
                                <th className="px-4 py-3">Mode</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                            {scores.map((score, i) => (
                                <tr key={i} className="hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3 text-center font-mono text-muted-foreground opacity-50">
                                    {i + 1}
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-primary text-xl">
                                    {score.streak}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col text-xs text-muted-foreground uppercase tracking-tight">
                                        <div className="flex gap-2">
                                            <span>{score.difficulty} words</span>
                                            <span>•</span>
                                            <span>{score.time}s</span>
                                        </div>
                                        <span className="opacity-50 mt-0.5">{formatDate(score.timestamp)}</span>
                                    </div>
                                </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center space-y-2 opacity-50 animate-in fade-in duration-1000">
                    <p className="text-lg font-medium text-muted-foreground">No high scores yet</p>
                    <p className="text-sm text-muted-foreground">Play a game to set a record!</p>
                </div>
            )}
        </div>

      </div>

      {/* FOOTER: Settings & Links */}
      <div className="flex flex-col items-center gap-4 py-6 border-t border-border/40 bg-background/50 backdrop-blur-sm z-10">
          
          
          <Link 
            href="https://jklm.fun" 
            target="_blank" 
            className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors"
          >
            Original Game: jklm.fun
          </Link>
      </div>

      {/* Settings Modal Overlay */}
      {settings && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSettings(false)}
        >
          <div 
            className="w-full max-w-md bg-background border border-border p-6 rounded-xl shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Game Settings</h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={toggleSettings}>✕</Button>
              </div>
            </div>

            {/* Difficulty Slider */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span>Hard</span>
                <span>Easy</span>
              </div>
              
              <input 
                type="range" 
                min="50" 
                max="10000" 
                step="50" 
                value={diffValue}
                onChange={(e) => setDiffValue(parseInt(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />

              <div className="text-center text-sm text-muted-foreground">
                Only use syllables that appear in at least <input 
                  className="font-bold transition-colors duration-300 w-12"
                  type="string" 
                  value={String(diffValue)}
                  onChange={(e) => setDiffValue(parseInt(e.target.value))}
                  style={{ color: `hsl(${((diffValue - 50) / 9950) * 120}, 90%, 40%)` }}
                />
                words.
              </div>
            </div>
            
            <hr className="border-border"/>

            {/* Timer Slider */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span>Fast</span>
                <span>Slow</span>
              </div>

              <input 
                type="range" 
                min="1" 
                max="15" 
                step="1" 
                value={sliderValue}
                onChange={(e) => setSliderValue(parseInt(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />

              <div className="text-center text-sm text-muted-foreground">
                <span className="font-bold text-primary">{sliderValue}</span> {sliderValue === 1 ? "second" : "seconds"} on the timer.
              </div>
            </div>

            <hr className="border-border"/>

            <div className="flex items-center justify-between">
                <ModeToggle />
                <span className="font-medium text-sm">Developed by <a href="https://github.com/cyfam" target="_blank" rel="noopener noreferrer" className="font-bold tracking-wider">cyfam</a></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}