export interface Note {
    title: string;
    text: string;
    completed: boolean;
    createdAt: Date;
    type: NoteType; // Új mező, ami a jegyzet típusát jelzi
  }
  
  export type NoteType = 'Jegyzet' | 'Teendő' | 'Feladat' | 'Egyéb';
  
  export const NOTES_DATA: Note[] = [
    {
      title: 'Meeting Notes',
      text: 'Discuss project milestones and deadlines...',
      completed: false,
      createdAt: new Date('2025-01-12'),
      type: 'Jegyzet'
    },
    {
      title: 'Shopping List',
      text: 'Milk, bread, eggs, and butter, plus additional items.',
      completed: true,
      createdAt: new Date('2025-01-15'),
      type: 'Teendő'
    },
    {
      title: 'Learning Angular',
      text: 'Study Reactive Forms and Material components usage. This is a long description...',
      completed: false,
      createdAt: new Date('2025-02-01'),
      type: 'Jegyzet'
    },
    {
      title: 'Important TODO',
      text: 'Fix login bugs and prepare for final deploy of the app!',
      completed: false,
      createdAt: new Date('2025-02-10'),
      type: 'Feladat'
    },
  ];
  