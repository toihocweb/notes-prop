'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Note } from '@/types/note';

const bgColorMap = {
    'paper-yellow': 'bg-amber-50',
    'paper-green': 'bg-green-50',
    'paper-pink': 'bg-pink-50',
    'paper-blue': 'bg-blue-50',
    'paper-purple': 'bg-purple-50',
    'paper-white': 'bg-white',
};

export default function PopOutNotePage() {
    const params = useParams();
    const noteId = params.id as string;
    const [note, setNote] = useState<Note | null>(null);

    useEffect(() => {
        // Load note from localStorage
        const stored = localStorage.getItem('notes-pro-data');
        if (stored) {
            const notes: Note[] = JSON.parse(stored);
            const found = notes.find((n) => n.id === noteId);
            if (found) {
                setNote(found);
            }
        }
    }, [noteId]);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Nhập ghi chú...',
            }),
        ],
        content: note?.content || '',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
            },
        },
        onUpdate: ({ editor }) => {
            if (!note) return;
            // Update localStorage
            const stored = localStorage.getItem('notes-pro-data');
            if (stored) {
                const notes: Note[] = JSON.parse(stored);
                const updatedNotes = notes.map((n) =>
                    n.id === noteId
                        ? { ...n, content: editor.getHTML(), updatedAt: new Date().toISOString() }
                        : n
                );
                localStorage.setItem('notes-pro-data', JSON.stringify(updatedNotes));
            }
        },
    });

    useEffect(() => {
        if (editor && note) {
            editor.commands.setContent(note.content);
        }
    }, [editor, note]);

    if (!note) {
        return (
            <div className="h-screen flex items-center justify-center bg-amber-50">
                <p className="text-neutral-500">Đang tải...</p>
            </div>
        );
    }

    const bgClass = bgColorMap[note.color] || 'bg-amber-50';

    return (
        <div className={`h-screen flex flex-col ${bgClass}`}>
            {/* Header */}
            <div className="flex items-center gap-2 p-3 border-b border-neutral-200/50 bg-white/50 backdrop-blur-sm">
                <img
                    src="/icons/icon-72x72.png"
                    alt="Notes Pro"
                    className="w-6 h-6 rounded"
                />
                <span className="text-sm font-medium text-neutral-700 truncate flex-1">
                    Quick Note
                </span>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-auto">
                <EditorContent editor={editor} />
            </div>

            {/* Footer */}
            <div className="p-2 text-center text-xs text-neutral-400 border-t border-neutral-200/30">
                Thay đổi được lưu tự động
            </div>
        </div>
    );
}
