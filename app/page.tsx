"use client";

import Image from "next/image";
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  // 0 = Easy, 1 = Medium, 2 = Hard
  const [sliderValue, setSliderValue] = useState(1);
  const difficulties = ["Easy", "Medium", "Hard"];
  const currentDifficulty = difficulties[sliderValue];

  return (
    <div className="grid grid-cols-1 h-dvh place-content-around">
      <div className="grid grid-cols-1 h-full place-content-center">
        <div className="flex flex-col items-center p-7 gap-8">
          <h1 className="text-5xl font-bold">Bomb Party Practice</h1>
          
          {/* Difficulty Slider Section */}
          <div className="w-64 flex flex-col gap-2">
            <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-400 px-1">
              <span>Easy</span>
              <span>Medium</span>
              <span>Hard</span>
            </div>
            
            <input 
              type="range" 
              min="0" 
              max="2" 
              step="1" 
              value={sliderValue}
              onChange={(e) => setSliderValue(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
            />
            
            <div className="text-center mt-2 text-sm text-gray-600 dark:text-gray-300">
              Selected: <span className="font-bold text-blue-600">{currentDifficulty}</span>
            </div>
          </div>

          {/* Pass the difficulty as a query parameter */}
          <Link href={`/game?difficulty=${currentDifficulty}`}>
            <Button variant="outline" size="lg" className="px-8 text-lg">
              <span>Start Game</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-row flex-initial justify-center">
          <ModeToggle />
      </div>
    </div>
  );
}