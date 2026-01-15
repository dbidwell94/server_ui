import { useRef, useEffect, useMemo, useState } from "react";
import styles from "./TerminalView.module.css";

export interface LogEntry {
    id: number;
    timestamp: string;
    source: string;
    level: "info" | "warning" | "error";
    message: string;
}

interface TerminalViewProps {
    logs: LogEntry[];
    isEmpty: boolean;
    emptyMessage?: string;
    title?: string;
    height?: string;
    onCommandSubmit?: (command: string) => void;
}

export default function TerminalView({
    logs,
    isEmpty,
    emptyMessage = "Waiting for logs...",
    title = "terminal",
    height = "h-[600px]",
    onCommandSubmit,
}: TerminalViewProps) {
    const logsEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [inputValue, setInputValue] = useState("");
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [cursorX, setCursorX] = useState(0);

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const atBottom = scrollHeight - scrollTop - clientHeight < 10; // 10px threshold
        setIsAtBottom(atBottom);
    };

    // Auto-scroll to bottom when new logs arrive, but only if user is already at bottom
    useEffect(() => {
        if (isAtBottom) {
            logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs, isAtBottom]);

    // Calculate cursor position based on input value
    useEffect(() => {
        if (!inputRef.current || !wrapperRef.current) return;
        
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        const computedStyle = window.getComputedStyle(inputRef.current);
        ctx.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;
        
        const textWidth = ctx.measureText(inputValue).width;
        setCursorX(textWidth);
    }, [inputValue]);

    const getTextColor = (level: string) => {
        switch (level) {
            case "error":
                return "text-red-400";
            case "warning":
                return "text-yellow-400";
            case "info":
            default:
                return "text-green-400";
        }
    };

    const handleInputSubmit = (command: string) => {
        if (onCommandSubmit) {
            onCommandSubmit(command);
        }
        setInputValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleInputSubmit(inputValue);
        }
    };

    // Merge logs: consecutive logs without newlines should be on the same line
    const mergedLogs = useMemo(() => {
        return logs.reduce((acc: LogEntry[], log) => {
            if (acc.length === 0) {
                return [log];
            }
            const lastLog = acc[acc.length - 1];
            // If last log doesn't end with newline, append this message to it
            if (!lastLog.message.endsWith('\n')) {
                // Avoid adding duplicate content - check if the message already ends with what we're adding
                const messageToAdd = log.message.replace(/\n$/, '');
                if (!lastLog.message.includes(messageToAdd) || messageToAdd === '') {
                    lastLog.message += log.message;
                } else if (log.message.endsWith('\n')) {
                    // Still add the newline if the incoming message had one
                    lastLog.message += '\n';
                }
                return acc;
            }
            // Otherwise, add as new log
            return [...acc, log];
        }, []);
    }, [logs]);

    return (
        <div className={`bg-black rounded-lg shadow overflow-hidden flex flex-col ${height} border border-gray-800`}>
            <div className="bg-gray-900 px-6 py-3 border-b border-gray-800">
                <p className="text-xs font-mono text-gray-400">
                    $ {title} — {mergedLogs.length} lines
                </p>
            </div>

            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className={`flex-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed flex flex-col ${styles.terminalContainer}`}
            >
                {isEmpty ? (
                    <div className="flex items-center justify-center h-full text-gray-600">
                        <p>{emptyMessage}</p>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col justify-end\">
                        <div>
                            {mergedLogs.map((log, index) => {
                                const hasNewline = log.message.endsWith('\n');
                                const displayMessage = log.message.replace(/\n$/, '');
                                const isLastLog = index === mergedLogs.length - 1;

                                return (
                                    <div key={log.id} className={hasNewline && !isLastLog ? "mb-2" : ""}>
                                        <div className="flex items-start gap-3">
                                            <span className="text-gray-600 flex-shrink-0 select-none">
                                                [{new Date(log.timestamp).toLocaleTimeString()}]
                                            </span>
                                            <span className="text-gray-500 flex-shrink-0 select-none">
                                                {log.source}
                                            </span>
                                            <span className={`${getTextColor(log.level)} break-words flex-1 flex items-center`}>
                                                {displayMessage}
                                                {isLastLog && (
                                                    <div ref={wrapperRef} className={styles.inputWrapper}>
                                                        <input
                                                            ref={inputRef}
                                                            type="text"
                                                            value={inputValue}
                                                            onChange={(e) => setInputValue(e.target.value)}
                                                            onKeyDown={handleKeyDown}
                                                            autoFocus
                                                        />
                                                        <div
                                                            className={styles.cursor}
                                                            style={{ left: `${cursorX}px` }}
                                                        />
                                                    </div>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={logsEndRef} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
