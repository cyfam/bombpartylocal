"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  const [diffValue, setDiffValue] = useState(2000);
  const [sliderValue, setSliderValue] = useState(8);
  const [settings, setSettings] = useState(false);

  function toggleSettings() {
    setSettings(!settings);
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && settings) toggleSettings();
      else if (e.key === 's' || e.key === 'S') toggleSettings();
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
    <div className="relative grid grid-cols-1 h-dvh place-content-around overflow-hidden">
      
      {/* Main Content */}
      <div className="grid grid-cols-1 h-full place-content-center">
        <div className="flex flex-col items-center p-7 gap-8">
          <h1 className="text-5xl font-bold text-center">Bomb Party Practice</h1>

          {/* Corrected Link: difficulty maps to Word Count, time maps to Seconds */}
          <Link href={`/game?difficulty=${diffValue}&time=${sliderValue}`}>
            <Button variant="outline" size="lg" className="px-8 text-lg">
              <span>Start Game</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-row flex-initial justify-center gap-4">
          <ModeToggle />
          <Button variant="outline" size="lg" onClick={toggleSettings}>
              <span>Settings</span>
          </Button>
      </div>

      {/* Settings Modal Overlay */}
      {settings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" 
        onClick={() => setSettings(false)}>
          <div className="w-full max-w-md bg-background border border-border p-6 rounded-xl shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}>
            
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Game Settings</h2>
              <Button variant="ghost" size="sm" onClick={toggleSettings}>✕</Button>
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
                Only use syllables that appear in at least <span className="font-bold text-primary">{diffValue}</span> words.
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
            
          </div>
        </div>
      )}
    </div>
  );
}