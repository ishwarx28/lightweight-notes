import { useState, useMemo } from 'react';
import { ListMusic } from 'lucide-react';
import { NoteCard } from '../components/NoteCard';
import { SearchBar } from '../components/SearchBar';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { useNotes } from '../hooks/useNotes';
import { filterNotes } from '../utils/filterNotes';
import styles from './AllNotesPage.module.css';

export function ArchivedPage() {
  const {
    notes,
    search,
    setSearch,
    sort,
    setSort,
    deleteNote,
    archiveNote,
    pinNote,
    selectedNoteId,
    setSelectedNoteId,
  } = useNotes();
  const [deleteId, setDeleteId] = useState(null);

  const filtered = useMemo(() => {
    return filterNotes(notes, { search, sort, archived: true });
  }, [notes, search, sort]);

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'updated', label: 'Recent' },
  ];

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteNote(deleteId);
      setDeleteId(null);
    }
  };

  const handlePermanentDelete = (id) => {
    setDeleteId(id);
  };

  const handleSelectNote = (id) => {
    setSelectedNoteId(id);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Archived</h1>
        <SearchBar value={search} onChange={setSearch} />
      </div>

      <div className={styles.sortBar}>
        <span className={styles.noteCount}>
          {filtered.length} {filtered.length === 1 ? 'note' : 'notes'}
        </span>
        <select
          className={styles.sortDropdownInline}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.noteList}>
        {filtered.length === 0 ? (
          <div className={styles.emptyWrapper}>
            <EmptyState
              icon={ListMusic}
              title="No archived notes"
              description="Archive notes to keep them out of the way."
            />
          </div>
        ) : (
          filtered.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isSelected={note.id === selectedNoteId}
              onSelect={handleSelectNote}
              onPin={pinNote}
              onArchive={archiveNote}
              onDelete={handleDelete}
              onPermanentDelete={handlePermanentDelete}
            />
          ))
        )}
      </div>

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Move to Trash"
        footer={
          <>
            <button className="btnSecondary" onClick={() => setDeleteId(null)}>
              Cancel
            </button>
            <button className="btnDanger" onClick={confirmDelete}>
              Move to Trash
            </button>
          </>
        }
      >
        Are you sure you want to move this note to trash? You can restore it later.
      </Modal>
    </div>
  );
}
