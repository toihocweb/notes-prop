'use client';

import { Note, NoteColor, THEMES } from '@/types/note';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
    Plus,
    Search,
    Pin,
    FileText,
    MoreHorizontal,
    Trash2,
    Palette
} from 'lucide-react';
import { PopOutButton } from '@/components/PopOutButton';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const ringColorMap: Record<NoteColor, string> = {
    'paper-yellow': 'ring-amber-400/50',
    'paper-green': 'ring-green-400/50',
    'paper-pink': 'ring-pink-400/50',
    'paper-blue': 'ring-blue-400/50',
    'paper-purple': 'ring-purple-400/50',
    'paper-white': 'ring-neutral-300',
};
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';

interface SidebarProps {
    notes: Note[];
    selectedNoteId: string | null;
    searchQuery: string;
    onSelectNote: (id: string) => void;
    onCreateNote: (color?: NoteColor) => void;
    onDeleteNote: (id: string) => void;
    onTogglePin: (id: string) => void;
    onSearchChange: (query: string) => void;
    onChangeNoteColor: (id: string, color: NoteColor) => void;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    if (diffDays < 7) return date.toLocaleDateString('vi-VN', { weekday: 'short' });
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getPlainText(content: string): string {
    // Remove HTML tags and get plain text
    return content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractTitle(note: Note): string {
    if (note.title) return note.title;
    // Get content of first block element (h1, h2, h3, or p)
    const firstBlockMatch = note.content.match(/<(h[1-3]|p)[^>]*>(.*?)<\/\1>/);
    if (firstBlockMatch) {
        const firstBlock = firstBlockMatch[2].replace(/<[^>]*>/g, '').trim();
        return firstBlock.slice(0, 50) || 'Ghi chú mới';
    }
    // Fallback: get plain text
    const text = getPlainText(note.content);
    return text.slice(0, 50) || 'Ghi chú mới';
}

function extractPreview(content: string): string {
    // Get all block elements (h1, h2, h3, p)
    const blocks = content.match(/<(h[1-3]|p)[^>]*>.*?<\/\1>/g) || [];
    if (blocks.length <= 1) return '';

    // Join remaining blocks and extract text
    const remainingContent = blocks.slice(1).join(' ');
    const text = remainingContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.slice(0, 35);
}

const colorMap: Record<NoteColor, string> = {
    'paper-yellow': 'bg-amber-200',
    'paper-green': 'bg-green-200',
    'paper-pink': 'bg-pink-200',
    'paper-blue': 'bg-blue-200',
    'paper-purple': 'bg-purple-200',
    'paper-white': 'bg-neutral-200',
};

const bgColorMapLight: Record<NoteColor, string> = {
    'paper-yellow': 'bg-amber-50',
    'paper-green': 'bg-green-50',
    'paper-pink': 'bg-pink-50',
    'paper-blue': 'bg-blue-50',
    'paper-purple': 'bg-purple-50',
    'paper-white': 'bg-neutral-50',
};

export function Sidebar({
    notes,
    selectedNoteId,
    searchQuery,
    onSelectNote,
    onCreateNote,
    onDeleteNote,
    onTogglePin,
    onSearchChange,
    onChangeNoteColor,
}: SidebarProps) {
    return (
        <div className="w-72 h-full bg-white/80 backdrop-blur-xl border-r border-neutral-200/50 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-neutral-200/50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <img
                            src="/icons/icon-96x96.png"
                            alt="Notes Pro"
                            className="w-8 h-8 rounded-lg shadow-md"
                        />
                        <span className="font-semibold text-neutral-800">Notes Pro</span>
                    </div>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onCreateNote()}
                        className="hover:bg-amber-50"
                    >
                        <Plus className="w-5 h-5" />
                    </Button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm ghi chú..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-100/80 rounded-xl text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                    />
                </div>
            </div>

            {/* Notes List */}
            <ScrollArea className="flex-1">
                <div className="p-2">
                    <AnimatePresence mode="popLayout">
                        {notes.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12 px-4"
                            >
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-100 flex items-center justify-center">
                                    <FileText className="w-8 h-8 text-neutral-300" />
                                </div>
                                <p className="text-sm text-neutral-400 mb-4">Chưa có ghi chú nào</p>
                                <Button size="sm" onClick={() => onCreateNote()}>
                                    <Plus className="w-4 h-4 mr-1" />
                                    Tạo ghi chú
                                </Button>
                            </motion.div>
                        ) : (
                            notes.map((note, index) => (
                                <motion.div
                                    key={note.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: index * 0.02 }}
                                >
                                    <div
                                        onClick={() => onSelectNote(note.id)}
                                        onDoubleClick={() => {
                                            const editor = document.querySelector('.ProseMirror') as HTMLElement;
                                            editor?.focus();
                                        }}
                                        className={cn(
                                            "group relative p-3 rounded-xl cursor-pointer transition-all duration-200 mb-1 isolate",
                                            bgColorMapLight[note.color]
                                        )}
                                    >

                                        {selectedNoteId === note.id && (
                                            <motion.div
                                                layoutId="active-note-border"
                                                className={cn(
                                                    "absolute inset-0 rounded-xl ring-2 shadow-sm z-10 pointer-events-none",
                                                    ringColorMap[note.color]
                                                )}
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        )}
                                        {/* Color indicator */}
                                        <div className={cn(
                                            "absolute left-0 top-3 bottom-3 w-1 rounded-full transition-opacity z-20",
                                            colorMap[note.color],
                                            selectedNoteId === note.id ? "opacity-100" : "opacity-60"
                                        )} />

                                        <div className="pl-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        {note.isPinned && (
                                                            <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                        )}
                                                        <h3 className="font-medium text-sm text-neutral-800 truncate">
                                                            {extractTitle(note)}
                                                        </h3>
                                                    </div>
                                                    {extractPreview(note.content) && (
                                                        <p className="text-xs text-neutral-400 truncate mb-1">
                                                            {extractPreview(note.content)}
                                                        </p>
                                                    )}
                                                    <span className="text-[10px] text-neutral-300">
                                                        {formatDate(note.updatedAt)}
                                                    </span>
                                                </div>

                                                <div onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <PopOutButton
                                                        noteId={note.id}
                                                        noteTitle={extractTitle(note)}
                                                        initialContent={note.content}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </ScrollArea>
        </div>
    );
}
