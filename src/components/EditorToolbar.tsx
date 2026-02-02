'use client';

import { Editor } from '@tiptap/react';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    CheckSquare,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Quote,
    Link,
    Image,
    Table,
    Minus,
    Undo,
    Redo,
    ChevronDown,
    Highlighter,
    Download,
} from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

interface EditorToolbarProps {
    editor: Editor | null;
}

interface ToolbarButtonProps {
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    onClick: () => void;
    disabled?: boolean;
}

function ToolbarButton({ icon, label, isActive, onClick, disabled }: ToolbarButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Toggle
                    size="sm"
                    pressed={isActive}
                    onPressedChange={onClick}
                    disabled={disabled}
                    aria-label={label}
                >
                    {icon}
                </Toggle>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={5}>
                {label}
            </TooltipContent>
        </Tooltip>
    );
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
    if (!editor) return null;

    const addLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) return;

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const addImage = () => {
        const url = window.prompt('URL hình ảnh');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const insertTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    const { promptInstall, deferredPrompt } = useInstallPrompt();

    return (
        <div className="flex items-center gap-0.5 p-2 bg-white/90 backdrop-blur-sm border-b border-neutral-200/50 flex-wrap">
            {/* Undo/Redo */}
            <ToolbarButton
                icon={<Undo className="w-4 h-4" />}
                label="Hoàn tác"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
            />
            <ToolbarButton
                icon={<Redo className="w-4 h-4" />}
                label="Làm lại"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
            />

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Headings Dropdown */}
            <DropdownMenu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1 h-8 px-2">
                                <Heading1 className="w-4 h-4" />
                                <ChevronDown className="w-3 h-3" />
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Tiêu đề</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                        <Heading1 className="w-4 h-4 mr-2" />
                        Tiêu đề 1
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                        <Heading2 className="w-4 h-4 mr-2" />
                        Tiêu đề 2
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                        <Heading3 className="w-4 h-4 mr-2" />
                        Tiêu đề 3
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Text Formatting */}
            <ToolbarButton
                icon={<Bold className="w-4 h-4" />}
                label="In đậm"
                isActive={editor.isActive('bold')}
                onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <ToolbarButton
                icon={<Italic className="w-4 h-4" />}
                label="In nghiêng"
                isActive={editor.isActive('italic')}
                onClick={() => editor.chain().focus().toggleItalic().run()}
            />
            <ToolbarButton
                icon={<Underline className="w-4 h-4" />}
                label="Gạch chân"
                isActive={editor.isActive('underline')}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
            />
            <ToolbarButton
                icon={<Strikethrough className="w-4 h-4" />}
                label="Gạch ngang"
                isActive={editor.isActive('strike')}
                onClick={() => editor.chain().focus().toggleStrike().run()}
            />
            <ToolbarButton
                icon={<Highlighter className="w-4 h-4" />}
                label="Highlight"
                isActive={editor.isActive('highlight')}
                onClick={() => editor.chain().focus().toggleHighlight().run()}
            />
            <ToolbarButton
                icon={<Code className="w-4 h-4" />}
                label="Code"
                isActive={editor.isActive('code')}
                onClick={() => editor.chain().focus().toggleCode().run()}
            />

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Lists */}
            <ToolbarButton
                icon={<List className="w-4 h-4" />}
                label="Danh sách"
                isActive={editor.isActive('bulletList')}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
            <ToolbarButton
                icon={<ListOrdered className="w-4 h-4" />}
                label="Danh sách đánh số"
                isActive={editor.isActive('orderedList')}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
            />
            <ToolbarButton
                icon={<CheckSquare className="w-4 h-4" />}
                label="Checklist"
                isActive={editor.isActive('taskList')}
                onClick={() => editor.chain().focus().toggleTaskList().run()}
            />

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Alignment */}
            <ToolbarButton
                icon={<AlignLeft className="w-4 h-4" />}
                label="Căn trái"
                isActive={editor.isActive({ textAlign: 'left' })}
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
            />
            <ToolbarButton
                icon={<AlignCenter className="w-4 h-4" />}
                label="Căn giữa"
                isActive={editor.isActive({ textAlign: 'center' })}
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
            />
            <ToolbarButton
                icon={<AlignRight className="w-4 h-4" />}
                label="Căn phải"
                isActive={editor.isActive({ textAlign: 'right' })}
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
            />
            <ToolbarButton
                icon={<AlignJustify className="w-4 h-4" />}
                label="Căn đều"
                isActive={editor.isActive({ textAlign: 'justify' })}
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            />

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Blocks */}
            <ToolbarButton
                icon={<Quote className="w-4 h-4" />}
                label="Trích dẫn"
                isActive={editor.isActive('blockquote')}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
            />
            <ToolbarButton
                icon={<Minus className="w-4 h-4" />}
                label="Đường kẻ ngang"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
            />

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Media & Insert */}
            <ToolbarButton
                icon={<Link className="w-4 h-4" />}
                label="Chèn link"
                isActive={editor.isActive('link')}
                onClick={addLink}
            />
            <ToolbarButton
                icon={<Image className="w-4 h-4" />}
                label="Chèn hình ảnh"
                onClick={addImage}
            />
            <ToolbarButton
                icon={<Table className="w-4 h-4" />}
                label="Chèn bảng"
                onClick={insertTable}
            />

            {deferredPrompt && (
                <div className="ml-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={promptInstall}
                        className="gap-2 text-amber-600 border-amber-200 hover:text-amber-700 hover:bg-amber-50 hover:border-amber-300 shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        <span className="text-xs font-medium">Cài đặt App</span>
                    </Button>
                </div>
            )}
        </div>
    );
}
