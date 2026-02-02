import { useState } from 'react';
import { NoteColor, THEMES } from '@/types/note';

interface UsePopOutProps {
    noteId: string;
    noteTitle: string;
    noteColor: NoteColor;
    initialContent?: string;
}

export function usePopOut() {
    const [isPoppedOut, setIsPoppedOut] = useState(false);

    const popOut = async ({ noteId, noteTitle, noteColor, initialContent }: UsePopOutProps) => {
        // Get background color from theme
        const theme = THEMES.find(t => t.value === noteColor);
        const bgColor = theme?.preview || '#fef3c7';

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
                        background: ${bgColor};
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
                        padding: 8px 12px;
                        border-radius: 12px;
                        border: 1px solid #e5e5e5;
                        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05);
                    }
                    #pomodoro-time {
                        font-family: monospace;
                        font-weight: 700;
                        font-size: 18px;
                        color: #262626;
                        letter-spacing: -0.5px;
                        margin-right: 12px;
                        min-width: 60px;
                    }
                    .pomo-btn {
                        padding: 6px 12px;
                        border-radius: 6px;
                        border: none;
                        background: #f3f4f6;
                        color: #4b5563;
                        font-weight: 600;
                        cursor: pointer;
                        font-size: 12px;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    }
                    .pomo-btn:hover {
                        background: #e5e7eb;
                    }
                    #pomodoro-toggle {
                        background: #f59e0b;
                        color: white;
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

                    /* Settings Modal */
                    #pomodoro-settings-modal {
                        display: none;
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0,0,0,0.2);
                        z-index: 100;
                        align-items: center;
                        justify-content: center;
                        backdrop-filter: blur(2px);
                    }
                    .settings-content {
                        background: white;
                        border-radius: 12px;
                        padding: 20px;
                        width: 240px;
                        box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
                    }
                    .setting-group {
                        margin-bottom: 16px;
                    }
                    .setting-label {
                        display: block;
                        font-size: 12px;
                        font-weight: 500;
                        color: #6b7280;
                        margin-bottom: 4px;
                    }
                    .setting-input {
                        width: 100%;
                        padding: 8px;
                        border: 1px solid #e5e7eb;
                        border-radius: 6px;
                        font-size: 14px;
                    }
                    .settings-actions {
                        display: flex;
                        justify-content: flex-end;
                        gap: 8px;
                        margin-top: 20px;
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
                        <div style="display: flex; align-items: center;">
                            <div id="pomodoro-phase" style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #fffbeb; color: #b45309; margin-right: 8px; font-weight: 600;">Focus</div>
                            <span id="pomodoro-time">25:00</span>
                        </div>
                        <div style="display: flex; gap: 6px;">
                            <button id="pomodoro-settings-btn" class="pomo-btn" style="padding: 6px;">⚙️</button>
                            <button id="pomodoro-toggle" class="pomo-btn">Start</button>
                        </div>
                    </div>

                    <div id="pomodoro-settings-modal">
                        <div class="settings-content">
                            <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">Timer Settings</h3>
                            <div class="setting-group">
                                <label class="setting-label">Focus Time (minutes)</label>
                                <input type="number" id="focus-time" class="setting-input" value="25" min="1" max="60">
                            </div>
                            <div class="setting-group">
                                <label class="setting-label">Break Time (minutes)</label>
                                <input type="number" id="break-time" class="setting-input" value="5" min="1" max="30">
                            </div>
                            <div class="settings-actions">
                                <button id="settings-close" class="pomo-btn">Cancel</button>
                                <button id="settings-save" class="pomo-btn" style="background: #2563eb; color: white;">Save</button>
                            </div>
                        </div>
                    </div>
                `;
                pipWindow.document.body.appendChild(container);

                // Inject Script for BroadcastChannel
                const script = pipWindow.document.createElement('script');
                script.textContent = `
                    (function() {
                        const timeDisplay = document.getElementById('pomodoro-time');
                        const toggleBtn = document.getElementById('pomodoro-toggle');
                        const settingsBtn = document.getElementById('pomodoro-settings-btn');
                        const settingsModal = document.getElementById('pomodoro-settings-modal');
                        const saveBtn = document.getElementById('settings-save');
                        const focusInput = document.getElementById('focus-time');
                        const breakInput = document.getElementById('break-time');
                        const closeSettings = document.getElementById('settings-close');
                        const phaseDisplay = document.getElementById('pomodoro-phase');
                        
                        let timeLeft = 25 * 60;
                        let isActive = false;
                        let isFocus = true;
                        let timerId = null;
                        let settings = { focus: 25, break: 5 };

                        function updateDisplay() {
                            const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
                            const secs = (timeLeft % 60).toString().padStart(2, '0');
                            timeDisplay.textContent = \`\${mins}:\${secs}\`;
                            document.title = \`\${mins}:\${secs} - \${isFocus ? 'Focus' : 'Break'}\`;
                        }

                        function toggleTimer() {
                            isActive = !isActive;
                            toggleBtn.textContent = isActive ? 'Pause' : 'Start';
                            toggleBtn.dataset.active = isActive;
                            
                            if (isActive) {
                                timerId = setInterval(() => {
                                    timeLeft--;
                                    updateDisplay();
                                    if (timeLeft <= 0) {
                                        // Phase complete
                                        isFocus = !isFocus;
                                        timeLeft = (isFocus ? settings.focus : settings.break) * 60;
                                        phaseDisplay.textContent = isFocus ? 'Focus' : 'Break';
                                        phaseDisplay.style.background = isFocus ? '#fffbeb' : '#ecfdf5';
                                        phaseDisplay.style.color = isFocus ? '#b45309' : '#047857';
                                        
                                        // Notify user
                                        new Notification(isFocus ? 'Time to Focus!' : 'Take a Break!');
                                        
                                        isActive = false;
                                        toggleBtn.textContent = 'Start';
                                        toggleBtn.dataset.active = false;
                                        clearInterval(timerId);
                                        updateDisplay();
                                    }
                                }, 1000);
                            } else {
                                clearInterval(timerId);
                            }
                        }

                        toggleBtn.onclick = toggleTimer;

                        settingsBtn.onclick = () => {
                            settingsModal.style.display = 'flex';
                            focusInput.value = settings.focus;
                            breakInput.value = settings.break;
                        };

                        closeSettings.onclick = () => {
                            settingsModal.style.display = 'none';
                        };

                        saveBtn.onclick = () => {
                            const newFocus = parseInt(focusInput.value) || 25;
                            const newBreak = parseInt(breakInput.value) || 5;
                            settings.focus = newFocus;
                            settings.break = newBreak;
                            
                            // Immediately update logic if currently not active
                            if (!isActive) {
                                timeLeft = (isFocus ? settings.focus : settings.break) * 60;
                                updateDisplay();
                            }
                            
                            settingsModal.style.display = 'none';
                        };

                        // Initialize
                        if (Notification.permission !== 'granted') {
                            Notification.requestPermission();
                        }
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

    return { popOut, isPoppedOut };
}
