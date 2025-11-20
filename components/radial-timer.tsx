import { useEffect, useState, useRef } from "react";
import { start } from "repl";

export function RadialTimer() {

    const [progress, setProgress] = useState(100);
    const [isRunning, setIsRunning] = useState(false);
    const [duration, setDuration] = useState(10);
    const animationRef = useRef(0);
    const startTimeRef = useRef(Date.now());

    //circle maths
    const radius = 80;
    const strokeWidth = 10;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = Math.PI * normalizedRadius * 2;

    useEffect(() => {
        if (!isRunning) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            return;
        }

        startTimeRef.current = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTimeRef.current;
            const newProgress = 100 - (elapsed / duration*1000) * 100;
            setProgress(Math.max(0,newProgress));

            if (newProgress > 0) {
                //keep running if its not over
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setIsRunning(false);
                timerEnd();
            }
        }

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    
        }, [isRunning, duration]);

    const handleStart = () => {
        setProgress(100);
        setIsRunning(true);
    };

    const timerEnd = () => {
        //change syllable and reset
        handleStart();
    };

    const strokeDashoffset = circumference - (progress/100) * circumference;

    return (
        <div>
            {/* background ring */}
            <circle
            stroke="#71717a"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            />
            {/* foreground ring */}
            <circle
            stroke="#3b82f6"
            fill="transparent"
            strokeDasharray={circumference + ' ' + circumference}
            strokeWidth={strokeWidth}
            strokeLinecap="square"
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.1s linear' }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            />
        </div>
    );
}