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
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { ModeToggle } from './ModeToggle';



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
    onCreateNote: (options?: { color?: NoteColor; isPinned?: boolean }) => void;
    onDeleteNote: (id: string) => void;
    onTogglePin: (id: string) => void;
    onSearchChange: (query: string) => void;
    onChangeNoteColor: (id: string, color: NoteColor) => void;
    onReorderNotes: (notes: Note[]) => void;
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
    'paper-yellow': 'bg-amber-200 dark:bg-amber-500',
    'paper-green': 'bg-green-200 dark:bg-green-500',
    'paper-pink': 'bg-pink-200 dark:bg-pink-500',
    'paper-blue': 'bg-blue-200 dark:bg-blue-500',
    'paper-purple': 'bg-purple-200 dark:bg-purple-500',
    'paper-white': 'bg-neutral-200 dark:bg-neutral-500',
};

const bgColorMapLight: Record<NoteColor, string> = {
    'paper-yellow': 'bg-amber-50 dark:bg-amber-900/50',
    'paper-green': 'bg-green-50 dark:bg-green-900/50',
    'paper-pink': 'bg-pink-50 dark:bg-pink-900/50',
    'paper-blue': 'bg-blue-50 dark:bg-blue-900/50',
    'paper-purple': 'bg-purple-50 dark:bg-purple-900/50',
    'paper-white': 'bg-neutral-50 dark:bg-neutral-800/70',
};

const borderColorMap: Record<NoteColor, string> = {
    'paper-yellow': 'border-amber-400 dark:border-amber-400',
    'paper-green': 'border-green-400 dark:border-green-400',
    'paper-pink': 'border-pink-400 dark:border-pink-400',
    'paper-blue': 'border-blue-400 dark:border-blue-400',
    'paper-purple': 'border-purple-400 dark:border-purple-400',
    'paper-white': 'border-neutral-300 dark:border-neutral-500',
};

const strokeColorMap: Record<NoteColor, string> = {
    'paper-yellow': 'stroke-amber-400 dark:stroke-amber-400',
    'paper-green': 'stroke-green-400 dark:stroke-green-400',
    'paper-pink': 'stroke-pink-400 dark:stroke-pink-400',
    'paper-blue': 'stroke-blue-400 dark:stroke-blue-400',
    'paper-purple': 'stroke-purple-400 dark:stroke-purple-400',
    'paper-white': 'stroke-neutral-300 dark:stroke-neutral-500',
};

const fillColorMap: Record<NoteColor, string> = {
    'paper-yellow': 'fill-amber-50 dark:fill-amber-900/50',
    'paper-green': 'fill-green-50 dark:fill-green-900/50',
    'paper-pink': 'fill-pink-50 dark:fill-pink-900/50',
    'paper-blue': 'fill-blue-50 dark:fill-blue-900/50',
    'paper-purple': 'fill-purple-50 dark:fill-purple-900/50',
    'paper-white': 'fill-neutral-50 dark:fill-neutral-800/70',
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


// Add useState to import
import { useState } from 'react';
// ... rest of imports

// ... existing code ...

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
    onReorderNotes,
}: SidebarProps) {
    const selectedNote = notes.find(n => n.id === selectedNoteId);
    const { popOut } = usePopOut();
    const [activeTab, setActiveTab] = useState<'all' | 'pinned'>('all');

    return (
        <div className="w-72 h-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl flex flex-col relative group/sidebar border-r border-transparent dark:border-neutral-800 transition-colors duration-300">
            {/* Fake Border Line */}
            <div className={cn(
                "absolute right-0 top-0 bottom-0 w-[2px] transition-colors duration-300 z-20 pointer-events-none",
                selectedNote ? separatorColorMap[selectedNote.color] : "bg-neutral-200 dark:bg-neutral-800"
            )} />

            {/* Header */}
            <div className="p-4 pb-2 border-b border-neutral-200/50 dark:border-neutral-800/50 relative z-10 transition-colors duration-300">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <img
                            src="/icons/icon-96x96.png"
                            alt="Notes Pro"
                            className="w-8 h-8 rounded-lg shadow-md"
                        />
                        <span className="font-semibold text-neutral-800 dark:text-neutral-100">Notes Pro</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <ModeToggle />
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onCreateNote({ isPinned: activeTab === 'pinned' })}
                            className="hover:bg-amber-50 dark:hover:bg-amber-900/20 dark:text-neutral-200"
                        >
                            <Plus className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-1 mb-3 bg-neutral-100/80 dark:bg-neutral-800/80 rounded-lg transition-colors duration-300">
                    <button
                        onClick={() => {
                            setActiveTab('all');
                            const firstUnpinned = notes.find(n => !n.isPinned);
                            if (firstUnpinned) onSelectNote(firstUnpinned.id);
                        }}
                        className={cn(
                            "flex-1 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                            activeTab === 'all'
                                ? "bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 shadow-sm"
                                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-white/50 dark:hover:bg-neutral-700/50"
                        )}
                    >
                        Tất cả
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('pinned');
                            const firstPinned = notes.find(n => n.isPinned);
                            if (firstPinned) onSelectNote(firstPinned.id);
                        }}
                        className={cn(
                            "flex-1 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                            activeTab === 'pinned'
                                ? "bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 shadow-sm"
                                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-white/50 dark:hover:bg-neutral-700/50"
                        )}
                    >
                        Ghim
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm ghi chú..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-100/80 dark:bg-neutral-800/80 dark:text-neutral-100 rounded-xl text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                    />
                </div>
            </div>

            {/* Notes List */}
            <ScrollArea className="flex-1 relative [&_[data-orientation=vertical]]:hidden">
                <div className="py-2">
                    <AnimatePresence mode="popLayout">
                        {notes.length === 0 && !searchQuery && activeTab === 'all' ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12 px-4 relative z-10"
                            >
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-100 flex items-center justify-center">
                                    <FileText className="w-8 h-8 text-neutral-300" />
                                </div>
                                <p className="text-sm text-neutral-400 mb-4">
                                    {'Chưa có ghi chú nào'}
                                </p>
                                <Button size="sm" onClick={() => onCreateNote({ isPinned: false })}>
                                    <Plus className="w-4 h-4 mr-1" />
                                    Tạo ghi chú
                                </Button>
                            </motion.div>
                        ) : (
                            renderNotesList()
                        )}
                    </AnimatePresence>
                </div>
            </ScrollArea >
        </div >
    );

    function renderNoteItem(note: Note, index: number, isDragEnabled: boolean) {
        // ...    function renderNoteItem(note: Note, index: number, isDragEnabled: boolean) {
        const content = (
            <div className={cn(
                "relative",
                selectedNoteId === note.id ? "z-30" : "z-10"
            )}>
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
                                <>
                                    <motion.div
                                        layoutId="active-note-border"
                                        className={cn(
                                            "absolute inset-0 rounded-xl border-2 z-0 pointer-events-none",
                                            borderColorMap[note.color],
                                            bgColorMapLight[note.color]
                                        )}
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                    {/* Right side extension to connect with editor */}
                                    <motion.div
                                        layoutId="active-note-extension"
                                        className={cn(
                                            "absolute top-[10px] bottom-[10px] -right-[14px] w-4 border-y-2 border-r-2 rounded-r-xl z-0 pointer-events-none bg-white dark:bg-neutral-950",
                                            borderColorMap[note.color]
                                        )}
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                </>
                            )}
                            {/* Color indicator */}
                            <div className={cn(
                                "absolute left-1 top-3 bottom-3 w-1 rounded-full transition-opacity z-20",
                                colorMap[note.color],
                                selectedNoteId === note.id ? "opacity-100" : "opacity-60"
                            )} />


                            <div className="pl-3 relative z-10">
                                <div className="flex items-center gap-1.5 mb-1">
                                    {note.isPinned && (
                                        <Pin className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                                    )}
                                    <h3 className="font-medium text-sm text-neutral-800 dark:text-neutral-100 truncate">
                                        {extractTitle(note)}
                                    </h3>
                                </div>
                                <p className="text-xs text-neutral-400 dark:text-neutral-400 truncate mb-1">
                                    {extractPreview(note.content) || "Không có nội dung"}
                                </p>
                                <span className="text-[10px] text-neutral-300 dark:text-neutral-500">
                                    {formatDate(note.updatedAt)}
                                </span>
                            </div>
                        </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-48 bg-white dark:bg-neutral-800 dark:border-neutral-700" alignOffset={5}>
                        <ContextMenuItem
                            onClick={() => onTogglePin(note.id)}
                            className="focus:bg-neutral-100 dark:focus:bg-neutral-700 dark:text-neutral-200"
                        >
                            {note.isPinned ? "Bỏ ghim" : "Ghim ghi chú"}
                        </ContextMenuItem>
                        <ContextMenuItem
                            onClick={() => popOut({ noteId: note.id, noteTitle: extractTitle(note), noteColor: note.color, initialContent: note.content })}
                            className="focus:bg-neutral-100 dark:focus:bg-neutral-700 dark:text-neutral-200"
                        >
                            Mở cửa sổ nổi
                        </ContextMenuItem>
                        <ContextMenuSub>
                            <ContextMenuSubTrigger className="focus:bg-neutral-100 dark:focus:bg-neutral-700 dark:text-neutral-200">Đổi màu</ContextMenuSubTrigger>
                            <ContextMenuSubContent className="w-48 bg-white dark:bg-neutral-800 dark:border-neutral-700">
                                {THEMES.map((theme) => (
                                    <ContextMenuItem
                                        key={theme.value}
                                        onClick={() => onChangeNoteColor(note.id, theme.value)}
                                        className="focus:bg-neutral-100 dark:focus:bg-neutral-700 dark:text-neutral-200"
                                    >
                                        <div className={cn("w-4 h-4 rounded-full mr-2", colorMap[theme.value])} />
                                        {theme.name}
                                    </ContextMenuItem>
                                ))}
                            </ContextMenuSubContent>
                        </ContextMenuSub>
                        <ContextMenuSeparator className="dark:bg-neutral-700" />
                        <ContextMenuItem
                            className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/30"
                            onClick={() => onDeleteNote(note.id)}
                        >
                            Xóa ghi chú
                        </ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            </div>
        );

        if (isDragEnabled) {
            return (
                <Reorder.Item
                    key={note.id}
                    value={note}
                    initial={{ opacity: 0, y: 20, scale: 1 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 1 }}
                    whileDrag={{ zIndex: 100, scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    className="relative"
                    dragListener={!searchQuery}
                >
                    {content}
                </Reorder.Item>
            );
        }

        return (
            <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 1 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                className="relative"
            >
                {content}
            </motion.div>
        );
    }

    function renderNotesList() {
        const pinnedNotes = notes.filter(n => n.isPinned);
        const unpinnedNotes = notes.filter(n => !n.isPinned);

        if (searchQuery) {
            // Search ignores tabs, searches everywhere? Or search respects tab?
            // Usually search is global. Let's keep it global for now logic-wise.
            const filteredNotes = notes.filter(note =>
                extractTitle(note).toLowerCase().includes(searchQuery.toLowerCase()) ||
                getPlainText(note.content).toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (filteredNotes.length === 0) {
                return (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 px-4 relative z-10"
                    >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-100 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-neutral-300" />
                        </div>
                        <p className="text-sm text-neutral-400 mb-4">
                            Không tìm thấy ghi chú
                        </p>
                    </motion.div>
                );
            }
            return filteredNotes.map((note, index) => renderNoteItem(note, index, false));
        }

        // Pinned Tab
        if (activeTab === 'pinned') {
            if (pinnedNotes.length === 0) {
                return (
                    <div className="text-center py-8 text-neutral-400 text-sm">
                        Chưa có ghi chú đã ghim nào
                    </div>
                );
            }

            const handleReorderPinnedTab = (newPinnedOrder: Note[]) => {
                // Update ONLY the pinned items order, but we must construct the full list for onReorderNotes
                // We kept unpinnedNotes as is.
                onReorderNotes([...newPinnedOrder, ...unpinnedNotes]);
            };

            return (
                <Reorder.Group axis="y" values={pinnedNotes} onReorder={handleReorderPinnedTab}>
                    {pinnedNotes.map((note, index) => renderNoteItem(note, index, true))}
                </Reorder.Group>
            );
        }

        // All Tab (Default - Now behaves like "Others/Unpinned")
        const handleReorderUnpinned = (newUnpinned: Note[]) => {
            onReorderNotes([...pinnedNotes, ...newUnpinned]);
        };

        if (unpinnedNotes.length === 0) {
            return (
                <div className="text-center py-8 text-neutral-400 text-sm">
                    Chưa có ghi chú khác
                </div>
            );
        }

        return (
            <Reorder.Group axis="y" values={unpinnedNotes} onReorder={handleReorderUnpinned}>
                {unpinnedNotes.map((note, index) => renderNoteItem(note, index, true))}
            </Reorder.Group>
        );
    }
}
