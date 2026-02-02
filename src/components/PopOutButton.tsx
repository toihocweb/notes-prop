import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { NoteColor } from '@/types/note';
import { usePopOut } from '@/hooks/usePopOut';

interface PopOutButtonProps {
    noteId: string;
    noteTitle: string;
    noteColor: NoteColor;
    initialContent?: string;
}

export function PopOutButton({ noteId, noteTitle, noteColor, initialContent }: PopOutButtonProps) {
    const { popOut, isPoppedOut } = usePopOut();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        popOut({ noteId, noteTitle, noteColor, initialContent });
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClick}
                    disabled={isPoppedOut}
                    className="hover:bg-white/50"
                >
                    <ExternalLink className="w-4 h-4" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                {isPoppedOut ? 'Đã mở cửa sổ nổi' : 'Mở cửa sổ nổi'}
            </TooltipContent>
        </Tooltip>
    );
}
