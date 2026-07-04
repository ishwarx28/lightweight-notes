import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ListMusic } from 'lucide-react';
import { NoteCard } from '../components/NoteCard';
import { SearchBar } from '../components/SearchBar';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { useNotes } from '../hooks/useNotes';
import { filterNotes } from '../utils/filterNotes';
import styles from './AllNotesPage.module.css';

export function TagPage() {
  const { tagName } = useParams();
  const {
    notes,
    search,
    setSearch,
    sort,
    setSort,
    deleteNote,
    restoreNote,
    permanentDeleteNote,
    archiveNote,
    pinNote,
    selectedNoteId,
    setSelectedNoteId,
  } = useNotes();
  const [deleteId, setDeleteId] = useState(null);

  const filtered = useMemo(() => {
    return filterNotes(notes, { search, sort, archived: false, tag: tagName });
  }, [notes, search, sort, tagName]);

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

  const handleSelectNote = (id) => {
    setSelectedNoteId(id);
  };

  const handleRestore = (id) => {
    restoreNote(id);
  };

  const handlePermanentDelete = (id) => {
    setDeleteId(id);
  };

  if (!tagName) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyWrapper}>
          <EmptyState
            icon={ListMusic}
            title="Select a tag"
            description="Choose a tag from the sidebar to filter notes."
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{tagName}</h1>
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
              title="No notes with this tag"
              description="Add this tag to a note to see it here."
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
              onRestore={handleRestore}
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
