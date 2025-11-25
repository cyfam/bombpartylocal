import { useEffect, useState, useRef } from "react";

interface RadialTimerProps {
    onComplete?: () => void;
    duration?: number;
    syllable: string;
    isError?: boolean; 
}

export default function RadialTimer({ onComplete, duration = 10, syllable, isError = false }: RadialTimerProps) {
    const [progress, setProgress] = useState(100);
    const [isRunning, setIsRunning] = useState(false);
    const animationRef = useRef(0);
    const startTimeRef = useRef(0);

    const onCompleteRef = useRef(onComplete);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

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
        if (syllable && syllable.length > 0) {
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
        if (onCompleteRef.current) onCompleteRef.current();
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
                        stroke="#000000"
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
                <div className={`
                        absolute inset-0 flex items-center justify-center text-xl font-bold 
                        transition-colors 
                        ${isError ? "text-red-500 duration-0" : "text-gray-700 dark:text-white duration-500"}
                    `}>
                    {syllable}
                </div>
            </div>
    
        </div>
    );
}