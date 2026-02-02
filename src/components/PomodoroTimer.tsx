'use client';

import { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Settings, X, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const DEFAULT_TIMES = {
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
};

export function PomodoroTimer() {
    const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMES.focus * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<TimerMode>('focus');
    const [customTimes, setCustomTimes] = useState(DEFAULT_TIMES);
    const [showSettings, setShowSettings] = useState(false);

    // Audio ref (you can add a real sound file later)
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const channelRef = useRef<BroadcastChannel | null>(null);

    // Initialize BroadcastChannel
    useEffect(() => {
        channelRef.current = new BroadcastChannel('pomodoro');

        const handleMessage = (event: MessageEvent) => {
            const { type, payload } = event.data;
            if (type === 'TOGGLE') {
                setIsActive(prev => !prev);
            } else if (type === 'RESET') {
                setIsActive(false);
                setTimeLeft(customTimes[mode] * 60);
            } else if (type === 'CHANGE_MODE') {
                const newMode = payload as TimerMode;
                setMode(newMode);
                setIsActive(false);
                setTimeLeft(customTimes[newMode] * 60);
            }
        };

        channelRef.current.addEventListener('message', handleMessage);

        return () => {
            channelRef.current?.close();
        };
    }, [customTimes, mode]);

    // Broadcast state updates
    useEffect(() => {
        channelRef.current?.postMessage({
            type: 'UPDATE',
            payload: {
                timeLeft,
                isActive,
                mode,
                totalTime: customTimes[mode] * 60
            }
        });
    }, [timeLeft, isActive, mode, customTimes]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            if (isActive) {
                // Timer finished
                setIsActive(false);
                // Play sound or notify
                if (Notification.permission === 'granted') {
                    new Notification('Pomodoro Timer', {
                        body: 'Thời gian đã hết!',
                        icon: '/icons/icon-192x192.png'
                    });
                }
            }
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft]);

    useEffect(() => {
        // Request notification permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(customTimes[mode] * 60);
    };

    const changeMode = (newMode: TimerMode) => {
        setMode(newMode);
        setIsActive(false);
        setTimeLeft(customTimes[newMode] * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleTimeChange = (modeKey: TimerMode, value: string) => {
        const num = parseInt(value);
        if (!isNaN(num) && num > 0) {
            const newTimes = { ...customTimes, [modeKey]: num };
            setCustomTimes(newTimes);
            if (mode === modeKey) {
                setTimeLeft(num * 60);
                setIsActive(false);
            }
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("hover:bg-amber-50", isActive ? "text-amber-600" : "text-neutral-500")}>
                    <Timer className="w-4 h-4" />
                    {isActive && <span className="ml-1 text-xs font-mono font-medium w-9 tabular-nums">{formatTime(timeLeft)}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 bg-white rounded-lg shadow-lg border border-neutral-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-amber-100 rounded-md">
                                <Timer className="w-4 h-4 text-amber-600" />
                            </div>
                            <h3 className="font-semibold text-neutral-800">Pomodoro Timer</h3>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowSettings(!showSettings)}>
                            <Settings className={cn("w-4 h-4", showSettings ? "text-amber-500" : "text-neutral-400")} />
                        </Button>
                    </div>

                    {showSettings ? (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-xs text-neutral-500">Focus</Label>
                                    <Input
                                        type="number"
                                        value={customTimes.focus}
                                        onChange={(e) => handleTimeChange('focus', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-neutral-500">Short Break</Label>
                                    <Input
                                        type="number"
                                        value={customTimes.shortBreak}
                                        onChange={(e) => handleTimeChange('shortBreak', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-neutral-500">Long Break</Label>
                                    <Input
                                        type="number"
                                        value={customTimes.longBreak}
                                        onChange={(e) => handleTimeChange('longBreak', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setShowSettings(false)}>
                                Done
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="flex bg-neutral-100 p-1 rounded-lg mb-6">
                                <button
                                    onClick={() => changeMode('focus')}
                                    className={cn(
                                        "flex-1 text-xs font-medium py-1.5 rounded-md transition-all",
                                        mode === 'focus' ? "bg-white shadow text-neutral-800" : "text-neutral-500 hover:text-neutral-700"
                                    )}
                                >
                                    Focus
                                </button>
                                <button
                                    onClick={() => changeMode('shortBreak')}
                                    className={cn(
                                        "flex-1 text-xs font-medium py-1.5 rounded-md transition-all",
                                        mode === 'shortBreak' ? "bg-white shadow text-neutral-800" : "text-neutral-500 hover:text-neutral-700"
                                    )}
                                >
                                    Short Break
                                </button>
                                <button
                                    onClick={() => changeMode('longBreak')}
                                    className={cn(
                                        "flex-1 text-xs font-medium py-1.5 rounded-md transition-all",
                                        mode === 'longBreak' ? "bg-white shadow text-neutral-800" : "text-neutral-500 hover:text-neutral-700"
                                    )}
                                >
                                    Long Break
                                </button>
                            </div>

                            <div className="text-center mb-6">
                                <div className="text-5xl font-mono font-bold text-neutral-800 tracking-tight mb-2">
                                    {formatTime(timeLeft)}
                                </div>
                                <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">
                                    {mode === 'focus' ? 'Time to focus' : 'Time for a break'}
                                </p>
                            </div>

                            <div className="flex items-center justify-center gap-3">
                                <Button
                                    size="lg"
                                    onClick={toggleTimer}
                                    className={cn(
                                        "w-24 transition-colors",
                                        isActive ? "bg-amber-100 text-amber-900 hover:bg-amber-200" : "bg-neutral-900 text-white hover:bg-neutral-800"
                                    )}
                                >
                                    {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={resetTimer}
                                    className="h-11 w-11"
                                >
                                    <RotateCcw className="w-4 h-4 text-neutral-500" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
