export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    color: NoteColor;
    isPinned: boolean;
    order: number;
}

export type NoteColor =
    | 'paper-yellow'
    | 'paper-green'
    | 'paper-pink'
    | 'paper-blue'
    | 'paper-purple'
    | 'paper-white';

export interface Theme {
    name: string;
    value: NoteColor;
    bg: string;
    preview: string;
}

export const THEMES: Theme[] = [
    { name: 'Vàng nhạt', value: 'paper-yellow', bg: 'bg-amber-50', preview: '#fef3c7' },
    { name: 'Xanh lá', value: 'paper-green', bg: 'bg-green-50', preview: '#dcfce7' },
    { name: 'Hồng pastel', value: 'paper-pink', bg: 'bg-pink-50', preview: '#fce7f3' },
    { name: 'Xanh dương', value: 'paper-blue', bg: 'bg-blue-50', preview: '#dbeafe' },
    { name: 'Tím nhạt', value: 'paper-purple', bg: 'bg-purple-50', preview: '#f3e8ff' },
    { name: 'Trắng', value: 'paper-white', bg: 'bg-white', preview: '#ffffff' },
];
