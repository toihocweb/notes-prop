'use client';

import { useState } from 'react';
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
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
    Plus,
    Trash2,
    Rows,
    Columns,
    Eraser,
    ArrowUpToLine,
    ArrowDownToLine,
    FoldVertical,
    PenTool,
} from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

interface EditorToolbarProps {
    editor: Editor | null;
    isDrawing?: boolean;
    onToggleDrawing?: () => void;
    drawingColor?: string;
    setDrawingColor?: (color: string) => void;
    onClearDrawing?: () => void;
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

export function EditorToolbar({
    editor,
    isDrawing,
    onToggleDrawing,
    drawingColor,
    setDrawingColor,
    onClearDrawing
}: EditorToolbarProps) {
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

    const [tableSize, setTableSize] = useState({ rows: 2, cols: 3 });
    const [hoverSize, setHoverSize] = useState({ rows: 0, cols: 0 });
    const [tablePopoverOpen, setTablePopoverOpen] = useState(false);

    const insertTable = (rows: number, cols: number) => {
        editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
        setTablePopoverOpen(false);
    };

    const { promptInstall, deferredPrompt } = useInstallPrompt();

    return (
        <div className="sticky top-0 z-50 flex items-center gap-0.5 p-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm border-b border-neutral-200/50 dark:border-neutral-800/50 flex-wrap transition-colors duration-300">
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
            <ToolbarButton
                icon={<Eraser className="w-4 h-4" />}
                label="Xóa định dạng"
                onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
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
            {isDrawing && onToggleDrawing && (
                <>
                    <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800 mx-1" />

                    {/* Color Picker */}
                    <div className="flex items-center gap-1 mx-1">
                        {[
                            '#000000',
                            '#EF4444',
                            '#3B82F6',
                            '#22C55E',
                            '#EAB308',
                            '#A855F7'
                        ].map((color) => (
                            <button
                                key={color}
                                className={`w-5 h-5 rounded-full border border-neutral-300 dark:border-neutral-600 ${drawingColor === color ? 'ring-2 ring-offset-1 ring-neutral-900 dark:ring-neutral-100 scale-110' : 'hover:scale-110'}`}
                                style={{ backgroundColor: color }}
                                onClick={() => setDrawingColor?.(color)}
                                title={color}
                            />
                        ))}
                    </div>

                    <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800 mx-1" />

                    <ToolbarButton
                        icon={<Trash2 className="w-4 h-4 text-red-500" />}
                        label="Xóa tất cả"
                        onClick={onClearDrawing || (() => { })}
                    />

                    <ToolbarButton
                        icon={<PenTool className="w-4 h-4" />}
                        label="Tắt chế độ vẽ"
                        isActive={true}
                        onClick={onToggleDrawing}
                    />
                </>
            )}

            {!isDrawing && onToggleDrawing && (
                <ToolbarButton
                    icon={<PenTool className="w-4 h-4" />}
                    label="Bật chế độ vẽ"
                    isActive={false}
                    onClick={onToggleDrawing}
                />
            )}

            <Popover open={tablePopoverOpen} onOpenChange={setTablePopoverOpen}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <Toggle size="sm" aria-label="Chèn bảng">
                                <Table className="w-4 h-4" />
                            </Toggle>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Chèn bảng</TooltipContent>
                </Tooltip>
                <PopoverContent className="w-auto p-3 bg-white dark:bg-neutral-800" align="start">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                        {hoverSize.rows > 0 ? `${hoverSize.rows} × ${hoverSize.cols}` : `${tableSize.rows} × ${tableSize.cols}`}
                    </div>
                    <div
                        className="grid gap-1"
                        style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}
                        onMouseLeave={() => setHoverSize({ rows: 0, cols: 0 })}
                    >
                        {Array.from({ length: 6 }, (_, rowIndex) =>
                            Array.from({ length: 6 }, (_, colIndex) => {
                                const row = rowIndex + 1;
                                const col = colIndex + 1;
                                const isHighlighted = hoverSize.rows > 0
                                    ? row <= hoverSize.rows && col <= hoverSize.cols
                                    : row <= tableSize.rows && col <= tableSize.cols;
                                return (
                                    <button
                                        key={`${row}-${col}`}
                                        className={`w-5 h-5 border rounded transition-colors ${isHighlighted
                                            ? 'bg-amber-400 border-amber-500'
                                            : 'bg-neutral-100 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                                            }`}
                                        onMouseEnter={() => setHoverSize({ rows: row, cols: col })}
                                        onClick={() => insertTable(row, col)}
                                    />
                                );
                            })
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            {/* Table Editing Controls - compact dropdown */}
            {editor.isActive('table') && (
                <>
                    <Separator orientation="vertical" className="mx-1 h-6" />
                    <Popover>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <PopoverTrigger asChild>
                                    <Toggle size="sm" aria-label="Chỉnh sửa bảng" pressed className="bg-amber-50 dark:bg-amber-900/30">
                                        <Table className="w-4 h-4" />
                                    </Toggle>
                                </PopoverTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Chỉnh sửa bảng</TooltipContent>
                        </Tooltip>
                        <PopoverContent className="w-auto p-2 bg-white dark:bg-neutral-800" align="start">
                            <div className="grid grid-cols-2 gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-xs justify-start gap-2"
                                    onClick={() => editor.chain().focus().addRowAfter().run()}
                                >
                                    <Plus className="w-3 h-3" />
                                    Thêm dòng
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-xs justify-start gap-2"
                                    onClick={() => editor.chain().focus().addColumnAfter().run()}
                                >
                                    <Plus className="w-3 h-3" />
                                    Thêm cột
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-xs justify-start gap-2 text-red-500 hover:text-red-600"
                                    onClick={() => editor.chain().focus().deleteRow().run()}
                                >
                                    <Minus className="w-3 h-3" />
                                    Xóa dòng
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-xs justify-start gap-2 text-red-500 hover:text-red-600"
                                    onClick={() => editor.chain().focus().deleteColumn().run()}
                                >
                                    <Minus className="w-3 h-3" />
                                    Xóa cột
                                </Button>
                            </div>
                            <Separator className="my-2" />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-full px-3 text-xs justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                                onClick={() => editor.chain().focus().deleteTable().run()}
                            >
                                <Trash2 className="w-3 h-3" />
                                Xóa toàn bộ bảng
                            </Button>

                            <Separator className="my-2" />
                            <div className="grid grid-cols-3 gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-0 text-xs justify-center"
                                    title="Căn trên"
                                    onClick={() => editor.chain().focus().setCellAttribute('verticalAlign', 'top').run()}
                                >
                                    <ArrowUpToLine className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-0 text-xs justify-center"
                                    title="Căn giữa (dọc)"
                                    onClick={() => editor.chain().focus().setCellAttribute('verticalAlign', 'middle').run()}
                                >
                                    <FoldVertical className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-0 text-xs justify-center"
                                    title="Căn dưới"
                                    onClick={() => editor.chain().focus().setCellAttribute('verticalAlign', 'bottom').run()}
                                >
                                    <ArrowDownToLine className="w-4 h-4" />
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </>
            )}

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
