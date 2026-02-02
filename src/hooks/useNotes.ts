'use client';

import { useState, useEffect, useCallback } from 'react';
import { Note, NoteColor } from '@/types/note';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'notes-pro-data';

export function useNotes() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load notes from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setNotes(parsed);
                if (parsed.length > 0) {
                    setSelectedNoteId(parsed[0].id);
                }
            } catch (e) {
                console.error('Failed to parse stored notes:', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save notes to localStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        }
    }, [notes, isLoaded]);

    const createNote = useCallback((color: NoteColor = 'paper-yellow') => {
        const now = new Date().toISOString();
        const newNote: Note = {
            id: uuidv4(),
            title: '',
            content: '',
            createdAt: now,
            updatedAt: now,
            color,
            isPinned: false,
            order: 0,
        };
        setNotes(prev => [newNote, ...prev]);
        setSelectedNoteId(newNote.id);
        return newNote;
    }, []);

    const updateNote = useCallback((id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
        setNotes(prev => prev.map(note => {
            if (note.id === id) {
                return {
                    ...note,
                    ...updates,
                    updatedAt: new Date().toISOString(),
                };
            }
            return note;
        }));
    }, []);

    const deleteNote = useCallback((id: string) => {
        setNotes(prev => {
            const filtered = prev.filter(note => note.id !== id);
            if (selectedNoteId === id) {
                setSelectedNoteId(filtered.length > 0 ? filtered[0].id : null);
            }
            return filtered;
        });
    }, [selectedNoteId]);

    const togglePin = useCallback((id: string) => {
        setNotes(prev => {
            const updated = prev.map(note => {
                if (note.id === id) {
                    return { ...note, isPinned: !note.isPinned };
                }
                return note;
            });
            // Keep existing order, just update pinned status
            // OR: Move pinned to top?
            // User likely wants pinned notes to jump to top.
            // Let's sort: Pinned first, then by existing order (index)
            return updated.sort((a, b) => {
                if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
                return 0; // Keep relative order
            });
        });
    }, []);

    const reorderNotes = useCallback((newNotes: Note[]) => {
        setNotes(newNotes);
    }, []);

    const selectedNote = notes.find(note => note.id === selectedNoteId) || null;

    const filteredNotes = notes.filter(note => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query)
        );
    });

    return {
        notes: filteredNotes,
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
    };
}
