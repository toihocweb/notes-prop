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
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
    ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { usePopOut } from '@/hooks/usePopOut';

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



const borderColorMap: Record<NoteColor, string> = {
    'paper-yellow': 'border-amber-400',
    'paper-green': 'border-green-400',
    'paper-pink': 'border-pink-400',
    'paper-blue': 'border-blue-400',
    'paper-purple': 'border-purple-400',
    'paper-white': 'border-neutral-300',
};


const strokeColorMap: Record<NoteColor, string> = {
    'paper-yellow': 'stroke-amber-400',
    'paper-green': 'stroke-green-400',
    'paper-pink': 'stroke-pink-400',
    'paper-blue': 'stroke-blue-400',
    'paper-purple': 'stroke-purple-400',
    'paper-white': 'stroke-neutral-300',
};

const fillColorMap: Record<NoteColor, string> = {
    'paper-yellow': 'fill-amber-50',
    'paper-green': 'fill-green-50',
    'paper-pink': 'fill-pink-50',
    'paper-blue': 'fill-blue-50',
    'paper-purple': 'fill-purple-50',
    'paper-white': 'fill-neutral-50',
};

const separatorColorMap: Record<NoteColor, string> = {
    'paper-yellow': 'bg-amber-400',
    'paper-green': 'bg-green-400',
    'paper-pink': 'bg-pink-400',
    'paper-blue': 'bg-blue-400',
    'paper-purple': 'bg-purple-400',
    'paper-white': 'bg-neutral-300',
};

const hexBorderMap: Record<NoteColor, string> = {
    'paper-yellow': '#fbbf24', // amber-400
    'paper-green': '#4ade80',  // green-400
    'paper-pink': '#f472b6',   // pink-400
    'paper-blue': '#60a5fa',   // blue-400
    'paper-purple': '#c084fc', // purple-400
    'paper-white': '#d4d4d4',  // neutral-300
};

const hexFillMap: Record<NoteColor, string> = {
    'paper-yellow': '#fffbeb', // amber-50
    'paper-green': '#f0fdf4',  // green-50
    'paper-pink': '#fdf2f8',   // pink-50
    'paper-blue': '#eff6ff',   // blue-50
    'paper-purple': '#faf5ff', // purple-50
    'paper-white': '#fafafa',  // neutral-50
};

// ... inside Sidebar component ...

const ringColorMap: Record<NoteColor, string> = {
    'paper-yellow': 'ring-amber-400',
    'paper-green': 'ring-green-400',
    'paper-pink': 'ring-pink-400',
    'paper-blue': 'ring-blue-400',
    'paper-purple': 'ring-purple-400',
    'paper-white': 'ring-neutral-400',
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
    const selectedNote = notes.find(n => n.id === selectedNoteId);
    const { popOut } = usePopOut();

    return (
        <div className="w-72 h-full bg-white/80 backdrop-blur-xl flex flex-col relative group/sidebar">
            {/* Fake Border Line */}
            {/* Fake Border Line - Z-Index 20 to sit above inactive notes but below active one */}
            <div className={cn(
                "absolute right-0 top-0 bottom-0 w-[2px] transition-colors duration-300 z-20 pointer-events-none",
                selectedNote ? separatorColorMap[selectedNote.color] : "bg-neutral-200"
            )} />

            {/* Header */}
            <div className="p-4 border-b border-neutral-200/50 relative z-10">
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
            <ScrollArea className="flex-1 relative [&_[data-orientation=vertical]]:hidden">
                <div className="py-2">
                    <AnimatePresence mode="popLayout">
                        {notes.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12 px-4 relative z-10"
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
                                    className={cn(
                                        "relative",
                                        selectedNoteId === note.id ? "z-30" : "z-10"
                                    )}
                                >
                                    <ContextMenu>
                                        <ContextMenuTrigger asChild>
                                            <div
                                                onClick={() => onSelectNote(note.id)}
                                                onDoubleClick={() => {
                                                    const editor = document.querySelector('.ProseMirror') as HTMLElement;
                                                    editor?.focus();
                                                }}
                                                className={cn(
                                                    "group relative p-3 cursor-pointer transition-all duration-200 mb-1 isolate",
                                                    selectedNoteId === note.id ? "ml-3 mr-0 rounded-l-xl rounded-r-none" : "mx-3 rounded-xl",
                                                    !selectedNoteId || selectedNoteId !== note.id ? bgColorMapLight[note.color] : ""
                                                )}
                                            >

                                                {selectedNoteId === note.id && (
                                                    <motion.div
                                                        layoutId="active-note-border"
                                                        className={cn(
                                                            "absolute inset-0 rounded-l-xl rounded-r-none border-2 border-r-0 z-0 pointer-events-none -mr-[2px] bg-white",
                                                            borderColorMap[note.color],
                                                            bgColorMapLight[note.color]
                                                        )}
                                                        initial={false}
                                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                    />
                                                )}
                                                {/* Color indicator */}
                                                <div className={cn(
                                                    "absolute left-1 top-3 bottom-3 w-1 rounded-full transition-opacity z-20",
                                                    colorMap[note.color],
                                                    selectedNoteId === note.id ? "opacity-100" : "opacity-60"
                                                )} />


                                                <div className="pl-3 relative z-10">
                                                    <div className="pr-8">
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            {note.isPinned && (
                                                                <Pin className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />
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


                                                </div>
                                            </div>
                                        </ContextMenuTrigger>
                                        <ContextMenuContent className="w-48">
                                            <ContextMenuItem onClick={() => onTogglePin(note.id)}>
                                                {note.isPinned ? "Bỏ ghim" : "Ghim ghi chú"}
                                            </ContextMenuItem>
                                            <ContextMenuItem onClick={() => popOut({ noteId: note.id, noteTitle: extractTitle(note), noteColor: note.color, initialContent: note.content })}>
                                                Mở cửa sổ nổi
                                            </ContextMenuItem>
                                            <ContextMenuSub>
                                                <ContextMenuSubTrigger>Đổi màu</ContextMenuSubTrigger>
                                                <ContextMenuSubContent className="w-48">
                                                    {THEMES.map((theme) => (
                                                        <ContextMenuItem key={theme.value} onClick={() => onChangeNoteColor(note.id, theme.value)}>
                                                            <div className={cn("w-4 h-4 rounded-full mr-2", colorMap[theme.value])} />
                                                            {theme.name}
                                                        </ContextMenuItem>
                                                    ))}
                                                </ContextMenuSubContent>
                                            </ContextMenuSub>
                                            <ContextMenuSeparator />
                                            <ContextMenuItem className="text-red-500 focus:text-red-500" onClick={() => onDeleteNote(note.id)}>
                                                Xóa ghi chú
                                            </ContextMenuItem>
                                        </ContextMenuContent>
                                    </ContextMenu>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </ScrollArea>
        </div>
    );
}
