import { useEffect, useState, useRef } from "react";

interface RadialTimerProps {
    onComplete?: () => void; 
    duration?: number;
    syllable: string;
}

export default function RadialTimer({ onComplete, duration = 10, syllable }: RadialTimerProps) {
    const [progress, setProgress] = useState(100);
    const [isRunning, setIsRunning] = useState(false);
    const animationRef = useRef(0);
    const startTimeRef = useRef(0);
    const [isError, setIsError] = useState(false);

    // Circle config
    const radius = 80;
    const strokeWidth = 10;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = Math.PI * normalizedRadius * 2;

    const handleStart = () => {
        startTimeRef.current = Date.now();
        setProgress(100);
        setIsRunning(true);
    };

    useEffect(() => {
        if (syllable) {
            handleStart();
        }
    }, [syllable]);

    useEffect(() => {
        if (!isRunning) {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            return;
        }

        if (startTimeRef.current === 0) {
             startTimeRef.current = Date.now();
        }
    
        const animate = () => {
            const elapsed = Date.now() - startTimeRef.current;
            const newProgress = 100 - (elapsed / (duration * 1000)) * 100;
            setProgress(Math.max(0, newProgress));

            if (newProgress > 0) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                handleComplete();
            }
        }

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isRunning, duration]);

    const handleComplete = () => {
        setIsRunning(false);
        // Notify parent
        if (onComplete) onComplete();
    };

    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="relative mb-4">
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="-rotate-90"
                >
                    <circle
                        stroke="#71717a"
                        fill="transparent"
                        strokeWidth={strokeWidth}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    <circle
                        stroke="#3b82f6"
                        fill="transparent"
                        strokeDasharray={circumference + ' ' + circumference}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.1s linear' }}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                </svg>
                {/* Optional: Show time in center */}
                <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                    {syllable}
                </div>
            </div>
    
        </div>
    );
}