import { createContext, useState, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId } from '../utils/generateId';

const SEED_NOTES = [
  {
    id: 'seed-1',
    title: 'Welcome to Notes',
    content:
      'This is your first note. You can edit it, pin it, archive it, or delete it.\n\nTry adding some tags to organise your notes!',
    tags: ['getting-started'],
    pinned: true,
    archived: false,
    trashed: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'seed-2',
    title: 'Shopping List',
    content: 'Milk\nEggs\nBread\nAvocados\nOlive oil',
    tags: ['personal'],
    pinned: false,
    archived: false,
    trashed: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'seed-3',
    title: 'Project Ideas',
    content: '- Note taking app\n- Weather dashboard\n- Portfolio redesign\n- CLI tool for markdown',
    tags: ['work', 'ideas'],
    color: '#e0e7ff',
    pinned: false,
    archived: false,
    trashed: false,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const NotesContext = createContext(null);

export function NotesProvider({ children }) {
  const [notes, setNotes] = useLocalStorage('notes-app-notes', SEED_NOTES);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  const addNote = useCallback(
    (noteData = {}) => {
      const now = new Date().toISOString();
      const newNote = {
        id: generateId(),
        title: '',
        content: '',
        tags: [],
        pinned: false,
        archived: false,
        trashed: false,
        createdAt: now,
        updatedAt: now,
        ...noteData,
      };
      setNotes((prev) => [newNote, ...prev]);
      return newNote;
    },
    [setNotes]
  );

  const updateNote = useCallback(
    (id, updates) => {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id
            ? { ...note, ...updates, updatedAt: new Date().toISOString() }
            : note
        )
      );
    },
    [setNotes]
  );

  const trashNote = useCallback(
    (id) => {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id
            ? { ...note, trashed: true, updatedAt: new Date().toISOString() }
            : note
        )
      );
      setSelectedNoteId((prev) => (prev === id ? null : prev));
    },
    [setNotes]
  );

  const restoreNote = useCallback(
    (id) => {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id
            ? { ...note, trashed: false, updatedAt: new Date().toISOString() }
            : note
        )
      );
    },
    [setNotes]
  );

  const permanentDeleteNote = useCallback(
    (id) => {
      setNotes((prev) => prev.filter((note) => note.id !== id));
      setSelectedNoteId((prev) => (prev === id ? null : prev));
    },
    [setNotes]
  );

  const deleteNote = trashNote;

  const archiveNote = useCallback(
    (id) => {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id
            ? { ...note, archived: !note.archived, updatedAt: new Date().toISOString() }
            : note
        )
      );
    },
    [setNotes]
  );

  const pinNote = useCallback(
    (id) => {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id
            ? { ...note, pinned: !note.pinned, updatedAt: new Date().toISOString() }
            : note
        )
      );
    },
    [setNotes]
  );

  const getNote = useCallback(
    (id) => notes.find((note) => note.id === id),
    [notes]
  );

  const allTags = [...new Set(notes.flatMap((n) => n.tags))].sort();

  const value = {
    notes,
    search,
    setSearch,
    sort,
    setSort,
    selectedNoteId,
    setSelectedNoteId,
    addNote,
    updateNote,
    deleteNote,
    trashNote,
    restoreNote,
    permanentDeleteNote,
    archiveNote,
    pinNote,
    getNote,
    allTags,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}
