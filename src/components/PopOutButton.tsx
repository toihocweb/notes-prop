'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PopOutButtonProps {
    noteId: string;
    noteTitle: string;
}

export function PopOutButton({ noteId, noteTitle, initialContent }: PopOutButtonProps & { initialContent?: string }) {
    const [isPoppedOut, setIsPoppedOut] = useState(false);

    const handlePopOut = async (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();

        // Check if Document Picture-in-Picture API is available (Chrome 116+)
        if ('documentPictureInPicture' in window) {
            try {
                // @ts-expect-error - Document PiP API is experimental
                const pipWindow = await window.documentPictureInPicture.requestWindow({
                    width: 400,
                    height: 500,
                });

                // Copy styles to PiP window
                const styles = document.querySelectorAll('link[rel="stylesheet"], style');
                styles.forEach((style) => {
                    pipWindow.document.head.appendChild(style.cloneNode(true));
                });

                // Add base styles
                const baseStyle = pipWindow.document.createElement('style');
                baseStyle.textContent = `
                    body { 
                        font-family: 'Outfit', system-ui, sans-serif;
                        margin: 0;
                        padding: 16px;
                        background: #fef3c7;
                        display: flex;
                        flex-direction: column;
                        height: 100vh;
                        box-sizing: border-box;
                    }
                    .pip-header {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding-bottom: 12px;
                        border-bottom: 1px solid #e5e5e5;
                        margin-bottom: 12px;
                        flex-shrink: 0;
                    }
                    .pip-title {
                        font-weight: 600;
                        font-size: 14px;
                        color: #262626;
                    }
                    .pip-content {
                        font-size: 14px;
                        line-height: 1.6;
                        color: #404040;
                        outline: none;
                        padding-bottom: 80px;
                    }
                    /* Ensure images in content are visible */
                    .pip-content img {
                        max-width: 100%;
                        height: auto;
                    }

                    /* Pomodoro Styles */
                    #pip-pomodoro {
                        position: fixed;
                        bottom: 16px;
                        left: 16px;
                        right: 16px;
                        z-index: 50;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        background: white;
                        padding: 12px;
                        border-radius: 12px;
                        border: 1px solid #e5e5e5;
                        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05);
                    }
                    #pomodoro-time {
                        font-family: monospace;
                        font-weight: 700;
                        font-size: 20px;
                        color: #262626;
                        letter-spacing: -0.5px;
                    }
                    #pomodoro-toggle {
                        padding: 8px 16px;
                        border-radius: 8px;
                        border: none;
                        background: #f59e0b;
                        color: white;
                        font-weight: 600;
                        cursor: pointer;
                        font-size: 13px;
                        transition: all 0.2s;
                    }
                    #pomodoro-toggle:hover {
                        background: #d97706;
                        transform: translateY(-1px);
                    }
                    #pomodoro-toggle:active {
                        transform: translateY(0);
                    }
                    #pomodoro-toggle[data-active="true"] {
                        background: #ef4444;
                    }
                    #pomodoro-toggle[data-active="true"]:hover {
                        background: #dc2626;
                    }
                `;
                pipWindow.document.head.appendChild(baseStyle);

                // Create content
                const container = pipWindow.document.createElement('div');
                container.style.flex = '1';
                container.style.display = 'flex';
                container.style.flexDirection = 'column';

                container.innerHTML = `
                    <div class="pip-content" contenteditable="true" id="pip-editor" style="flex: 1;">
                        ${initialContent || 'Nhập ghi chú nhanh tại đây...'}
                    </div>
                    
                    <div id="pip-pomodoro">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="font-size: 18px; background: #fffbeb; padding: 6px; border-radius: 8px;">🍅</div>
                            <span id="pomodoro-time">--:--</span>
                        </div>
                        <button id="pomodoro-toggle">Start</button>
                    </div>
                `;
                pipWindow.document.body.appendChild(container);

                // Inject Script for BroadcastChannel
                const script = pipWindow.document.createElement('script');
                script.textContent = `
                    (function() {
                        const timeDisplay = document.getElementById('pomodoro-time');
                        const toggleBtn = document.getElementById('pomodoro-toggle');
                        const channel = new BroadcastChannel('pomodoro');
                        let isActive = false;

                        channel.onmessage = (event) => {
                            const { type, payload } = event.data;
                            if (type === 'UPDATE') {
                                const mins = Math.floor(payload.timeLeft / 60).toString().padStart(2, '0');
                                const secs = (payload.timeLeft % 60).toString().padStart(2, '0');
                                timeDisplay.textContent = \`\${mins}:\${secs}\`;
                                isActive = payload.isActive;
                                toggleBtn.textContent = isActive ? 'Pause' : 'Start';
                                toggleBtn.dataset.active = isActive;
                            }
                        };

                        toggleBtn.onclick = () => {
                            channel.postMessage({ type: 'TOGGLE' });
                        };
                    })();
                `;
                pipWindow.document.body.appendChild(script);

                setIsPoppedOut(true);

                // Handle PiP window close
                pipWindow.addEventListener('pagehide', () => {
                    setIsPoppedOut(false);
                });

            } catch (error) {
                console.error('Document PiP failed:', error);
                fallbackPopup(noteId);
            }
        } else {
            // Fallback to regular popup
            fallbackPopup(noteId);
        }
    };

    const fallbackPopup = (id: string) => {
        const width = 400;
        const height = 500;
        const left = window.screen.width - width - 50;
        const top = 50;

        window.open(
            `/note/${id}`,
            'NotePopup',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePopOut}
                    disabled={isPoppedOut}
                    className="hover:bg-white/50"
                >
                    <ExternalLink className="w-4 h-4" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                {isPoppedOut ? 'Đã mở cửa sổ nổi' : 'Mở cửa sổ nổi'}
            </TooltipContent>
        </Tooltip>
    );
}
