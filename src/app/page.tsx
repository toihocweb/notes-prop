'use client';

import { useNotes } from '@/hooks/useNotes';
import { Sidebar } from '@/components/Sidebar';
import { NoteEditor } from '@/components/NoteEditor';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
    const {
        notes,
        selectedNote,
        selectedNoteId,
        searchQuery,
        isLoaded,
        setSelectedNoteId,
        setSearchQuery,
        createNote,
        updateNote,
        deleteNote,
        togglePin,
        reorderNotes,
    } = useNotes();

    if (!isLoaded) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-neutral-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
                    <p className="text-neutral-500 text-sm">Đang tải...</p>
                </motion.div>
            </div>
        );
    }

    const handleUpdateNote = (updates: Parameters<typeof updateNote>[1]) => {
        if (selectedNoteId) {
            updateNote(selectedNoteId, updates);
        }
    };

    const handleDeleteNote = () => {
        if (selectedNoteId) {
            deleteNote(selectedNoteId);
        }
    };

    const handleTogglePin = () => {
        if (selectedNoteId) {
            togglePin(selectedNoteId);
        }
    };

    const handleChangeNoteColor = (id: string, color: Parameters<typeof updateNote>[1]['color']) => {
        updateNote(id, { color });
    };

    return (
        <main className="h-screen w-screen flex overflow-hidden bg-neutral-100 dark:bg-neutral-950 transition-colors duration-300">
            <Sidebar
                notes={notes}
                selectedNoteId={selectedNoteId}
                searchQuery={searchQuery}
                onSelectNote={setSelectedNoteId}
                onCreateNote={createNote}
                onDeleteNote={deleteNote}
                onTogglePin={togglePin}
                onSearchChange={setSearchQuery}
                onChangeNoteColor={handleChangeNoteColor}
                onReorderNotes={reorderNotes}
            />

            <AnimatePresence mode="wait">
                <NoteEditor
                    note={selectedNote}
                    notes={notes}
                    onUpdate={handleUpdateNote}
                    onDelete={handleDeleteNote}
                    onTogglePin={handleTogglePin}
                    onChangeColor={(color) => selectedNoteId && handleChangeNoteColor(selectedNoteId, color)}
                    onSelectNote={setSelectedNoteId}
                />
            </AnimatePresence>

            <PWAInstallPrompt />
        </main>
    );
}
