import { Note } from '@/types/note';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';

interface WikiLinkListProps {
    items: Note[];
    command: (props: { id: string; label: string }) => void;
}

export interface WikiLinkListRef {
    onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const WikiLinkList = forwardRef<WikiLinkListRef, WikiLinkListProps>((props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
        const item = props.items[index];
        if (item) {
            props.command({ id: item.id, label: item.title });
        }
    };

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
    };

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
        selectItem(selectedIndex);
    };

    useEffect(() => {
        setSelectedIndex(0);
    }, [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }) => {
            if (event.key === 'ArrowUp') {
                upHandler();
                return true;
            }

            if (event.key === 'ArrowDown') {
                downHandler();
                return true;
            }

            if (event.key === 'Enter') {
                enterHandler();
                return true;
            }

            return false;
        },
    }));

    if (props.items.length === 0) {
        return (
            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-800 p-2 text-sm text-neutral-500">
                No results
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden min-w-[200px] p-1">
            {props.items.map((item, index) => (
                <button
                    key={item.id}
                    className={cn(
                        'flex items-center gap-2 w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
                        index === selectedIndex
                            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100'
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    )}
                    onClick={() => selectItem(index)}
                >
                    <FileText className="w-4 h-4 opacity-50" />
                    <span className="truncate">{item.title || 'Untitled'}</span>
                </button>
            ))}
        </div>
    );
});

WikiLinkList.displayName = 'WikiLinkList';
