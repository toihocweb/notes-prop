'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useEffect, useRef, useState } from 'react';
import { Note, NoteColor, THEMES } from '@/types/note';
import { EditorToolbar } from './EditorToolbar';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Pin, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PopOutButton } from './PopOutButton';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Mention from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { WikiLinkList, WikiLinkListRef } from './WikiLinkList';
import { ResizableImage } from './extensions/ResizableImage';

import { DrawingCanvas } from './DrawingCanvas';

const lowlight = createLowlight(common);

const bgColorMap: Record<NoteColor, string> = {
    'paper-yellow': 'bg-amber-50/80 dark:bg-amber-900/60',
    'paper-green': 'bg-green-50/80 dark:bg-green-900/60',
    'paper-pink': 'bg-pink-50/80 dark:bg-pink-900/60',
    'paper-blue': 'bg-blue-50/80 dark:bg-blue-900/60',
    'paper-purple': 'bg-purple-50/80 dark:bg-purple-900/60',
    'paper-white': 'bg-white dark:bg-neutral-800',
};

const borderColorMap: Record<NoteColor, string> = {
    'paper-yellow': 'border-amber-400 dark:border-amber-400',
    'paper-green': 'border-green-400 dark:border-green-400',
    'paper-pink': 'border-pink-400 dark:border-pink-400',
    'paper-blue': 'border-blue-400 dark:border-blue-400',
    'paper-purple': 'border-purple-400 dark:border-purple-400',
    'paper-white': 'border-neutral-300 dark:border-neutral-600',
};

interface NoteEditorProps {
    note: Note | null;
    notes: Note[];
    onUpdate: (updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
    onDelete: () => void;
    onTogglePin: () => void;
    onChangeColor: (color: NoteColor) => void;
    onSelectNote: (id: string) => void;
}




// Reusable editor configuration
const getEditorExtensions = (notes: Note[], onSelectNote: (id: string) => void) => [
    StarterKit.configure({
        codeBlock: false,
    }),
    Underline,
    Link.configure({
        openOnClick: false,
        HTMLAttributes: {
            class: 'text-amber-600 underline cursor-pointer hover:text-amber-700',
        },
    }),
    ResizableImage.configure({
        HTMLAttributes: {
            class: 'rounded-lg shadow-md my-4',
        },
    }),
    Placeholder.configure({
        placeholder: 'Bắt đầu viết ghi chú của bạn...',
    }),
    TaskList,
    TaskItem.configure({
        nested: true,
    }),
    TextAlign.configure({
        types: ['heading', 'paragraph'],
    }),
    Highlight.configure({
        multicolor: false,
        HTMLAttributes: {
            class: 'bg-yellow-200 rounded px-0.5',
        },
    }),
    Table.configure({
        resizable: true,
        HTMLAttributes: {
            class: 'border-collapse table-auto w-full my-4',
        },
    }),
    TableRow,
    TableCell.extend({
        addAttributes() {
            return {
                ...this.parent?.(),
                verticalAlign: {
                    default: null,
                    parseHTML: element => element.style.verticalAlign || element.getAttribute('vertical-align'),
                    renderHTML: attributes => {
                        if (!attributes.verticalAlign) return {};
                        return {
                            style: `vertical-align: ${attributes.verticalAlign}`,
                        }
                    },
                },
            }
        },
    }).configure({
        HTMLAttributes: {
            class: 'border border-neutral-300 p-2',
        },
    }),
    TableHeader.extend({
        addAttributes() {
            return {
                ...this.parent?.(),
                verticalAlign: {
                    default: null,
                    parseHTML: element => element.style.verticalAlign || element.getAttribute('vertical-align'),
                    renderHTML: attributes => {
                        if (!attributes.verticalAlign) return {};
                        return {
                            style: `vertical-align: ${attributes.verticalAlign}`,
                        }
                    },
                },
            }
        },
    }).configure({
        HTMLAttributes: {
            class: 'border border-neutral-300 p-2 bg-neutral-100 font-semibold',
        },
    }),
    CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
            class: 'bg-neutral-900 text-neutral-100 rounded-lg p-4 my-4 font-mono text-sm overflow-x-auto',
        },
    }),
    Mention.configure({
        HTMLAttributes: {
            class: 'wiki-link inline-flex items-center gap-1 text-violet-700 dark:text-violet-400 font-medium cursor-pointer no-underline bg-violet-100 dark:bg-violet-900/50 px-2 py-0.5 rounded-full border border-violet-300 dark:border-violet-700 hover:bg-violet-200 dark:hover:bg-violet-800/60 transition-colors text-sm',
        },
        renderLabel({ node }) {
            return `📒 ${node.attrs.label ?? node.attrs.id}`;
        },
        suggestion: {
            char: '[[',
            allowSpaces: true,
            items: ({ query }) => {
                return notes
                    .filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
                    .slice(0, 5);
            },
            render: () => {
                let component: ReactRenderer<WikiLinkListRef> | null = null;
                let popup: any | null = null;
                return {
                    onStart: (props) => {
                        component = new ReactRenderer(WikiLinkList, {
                            props,
                            editor: props.editor,
                        });
                        if (!props.clientRect) return;
                        popup = tippy('body', {
                            getReferenceClientRect: props.clientRect as any,
                            appendTo: () => document.body,
                            content: component.element,
                            showOnCreate: true,
                            interactive: true,
                            trigger: 'manual',
                            placement: 'bottom-start',
                        });
                    },
                    onUpdate(props) {
                        component?.updateProps(props);
                        if (!props.clientRect) return;
                        popup[0].setProps({ getReferenceClientRect: props.clientRect });
                    },
                    onKeyDown(props) {
                        if (props.event.key === 'Escape') {
                            popup[0].hide();
                            return true;
                        }
                        return component?.ref?.onKeyDown(props) || false;
                    },
                    onExit() {
                        popup[0].destroy();
                        component?.destroy();
                    },
                };
            },
        },
    }),
];

const getEditorProps = (onSelectNote: (id: string) => void) => ({
    attributes: {
        class: 'prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[calc(100vh-200px)] px-12 py-8',
    },
    handleClick: (view: any, pos: number, event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.closest('.wiki-link')) {
            const id = target.getAttribute('data-id');
            if (id) {
                onSelectNote(id);
                return true;
            }
        }
        return false;
    }
});

export function NoteEditor({
    note,
    notes,
    onUpdate,
    onDelete,
    onTogglePin,
    onChangeColor,
    onSelectNote,
}: NoteEditorProps) {
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const notesRef = useRef(notes);

    useEffect(() => {
        notesRef.current = notes;
    }, [notes]);

    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingColor, setDrawingColor] = useState('#000000');

    const handleClearDrawing = () => {
        if (!editor) return;
        editor.commands.command(({ tr }) => {
            tr.setNodeAttribute(0, 'lines', []);
            return true;
        });
        onUpdate({
            drawing: JSON.stringify([])
        });
    };

    const editor = useEditor({
        immediatelyRender: false,
        extensions: getEditorExtensions(notes, onSelectNote),
        content: note?.content || '',
        editorProps: getEditorProps(onSelectNote),
        onUpdate: ({ editor }) => {
            const content = editor.getHTML();
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            debounceRef.current = setTimeout(() => {
                // Extract title
                const textContent = editor.getText();
                const titleMatch = content.match(/<(h[1-3]|p)[^>]*>(.*?)<\/\1>/);
                let title = '';

                if (titleMatch) {
                    title = titleMatch[2].replace(/<[^>]*>/g, '').trim();
                } else if (textContent) {
                    title = textContent.split('\n')[0].substring(0, 50);
                }

                onUpdate({
                    content,
                    title: title.substring(0, 50)
                });
            }, 300);
        },
    });

    // Update content when note changes from OUTSIDE
    useEffect(() => {
        if (note && editor && editor.getHTML() !== note.content) {
            editor.commands.setContent(note.content, { emitUpdate: false });
        }
    }, [note?.id, note?.content, editor]);

    if (!note) {
        return (
            <div className="flex-1 flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 flex items-center justify-center">
                        <svg className="w-12 h-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Chọn một ghi chú</h2>
                    <p className="text-neutral-500 dark:text-neutral-400">Hoặc tạo ghi chú mới để bắt đầu</p>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
                "flex-1 flex flex-col border-t-4 border-l-0 min-w-0 overflow-x-auto transition-all duration-200 relative",
                bgColorMap[note.color],
                borderColorMap[note.color]
            )}
        >
            {/* Toolbar */}
            <EditorToolbar
                editor={editor}
                isDrawing={isDrawing}
                onToggleDrawing={() => setIsDrawing(!isDrawing)}
                drawingColor={drawingColor}
                setDrawingColor={setDrawingColor}
                onClearDrawing={handleClearDrawing}
            />

            {/* Editor Content Area */}
            <div className="flex-1 flex min-w-0">
                <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 w-full">
                    <div className="min-w-full min-h-full pb-12 relative">
                        <EditorContent editor={editor} className="h-full" />
                        {editor && (
                            <DrawingCanvas
                                isDrawing={isDrawing}
                                color={drawingColor}
                                initialLines={note?.drawing ? JSON.parse(note.drawing) : []}
                                onUpdate={(lines) => {
                                    onUpdate({
                                        drawing: JSON.stringify(lines)
                                    });
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
