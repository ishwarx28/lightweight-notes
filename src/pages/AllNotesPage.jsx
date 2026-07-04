import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpDown, ListMusic } from 'lucide-react';
import { NoteCard } from '../components/NoteCard';
import { SearchBar } from '../components/SearchBar';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { useNotes } from '../hooks/useNotes';
import { filterNotes } from '../utils/filterNotes';
import styles from './AllNotesPage.module.css';

export function AllNotesPage() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');

  const {
    notes,
    search,
    setSearch,
    sort,
    setSort,
    deleteNote,
    archiveNote,
    pinNote,
    restoreNote,
    permanentDeleteNote,
    selectedNoteId,
    setSelectedNoteId,
  } = useNotes();
  const [deleteId, setDeleteId] = useState(null);

  // Determine filter mode based on view param
  const filterMode = view || 'all';

  const filtered = useMemo(() => {
    let result;

    if (filterMode === 'trash') {
      result = filterNotes(notes, { search, sort, trashed: true });
    } else if (filterMode === 'archived') {
      result = filterNotes(notes, { search, sort, archived: true });
    } else {
      result = filterNotes(notes, { search, sort, archived: false });
    }

    // Apply view-specific filters
    if (filterMode === 'favorites') {
      result = result.filter((n) => n.pinned);
    }

    return result;
  }, [notes, search, sort, filterMode]);

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'updated', label: 'Recent' },
  ];

  const currentSort = sortOptions.find((o) => o.value === sort) || sortOptions[0];

  const getTitle = () => {
    if (search) return `Results for "${search}"`;
    switch (filterMode) {
      case 'favorites': return 'Favorites';
      case 'recent': return 'Recent';
      case 'trash': return 'Trash';
      case 'archived': return 'Archived';
      default: return 'All Notes';
    }
  };

  const getEmptyState = () => {
    if (search) {
      return {
        icon: ListMusic,
        title: 'No notes found',
        description: 'Try a different search term.',
      };
    }
    switch (filterMode) {
      case 'favorites':
        return { icon: ListMusic, title: 'No favorites yet', description: 'Pin your favorite notes to see them here.' };
      case 'recent':
        return { icon: ListMusic, title: 'No recent notes', description: 'Your recently updated notes will appear here.' };
      case 'trash':
        return { icon: ListMusic, title: 'Trash is empty', description: 'Deleted notes will appear here.' };
      default:
        return { icon: ListMusic, title: 'No notes yet', description: 'Create your first note to get started!' };
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      if (filterMode === 'trash') {
        permanentDeleteNote(deleteId);
      } else {
        deleteNote(deleteId);
      }
      setDeleteId(null);
    }
  };

  const handleRestore = (id) => {
    restoreNote(id);
  };

  const handlePermanentDelete = (id) => {
    setDeleteId(id);
  };

  const handleSelectNote = (id) => {
    setSelectedNoteId(id);
  };

  const emptyState = getEmptyState();

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <h1 className={styles.title}>{getTitle()}</h1>
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {/* ── Sort bar ── */}
      <div className={styles.sortBar}>
        <span className={styles.noteCount}>
          {filtered.length} {filtered.length === 1 ? 'note' : 'notes'}
        </span>
        <div className={styles.sortSelect}>
          <ArrowUpDown size={12} />
          <select
            className={styles.sortDropdown}
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
      </div>

      {/* ── Note list ── */}
      <div className={styles.noteList}>
        {filtered.length === 0 ? (
          <div className={styles.emptyWrapper}>
            <EmptyState
              icon={emptyState.icon}
              title={emptyState.title}
              description={emptyState.description}
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

      {/* ── Delete / Permanent Delete Modal ── */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title={filterMode === 'trash' ? 'Delete permanently' : 'Move to Trash'}
        footer={
          <>
            <button className="btnSecondary" onClick={() => setDeleteId(null)}>
              Cancel
            </button>
            <button className="btnDanger" onClick={confirmDelete}>
              {filterMode === 'trash' ? 'Delete permanently' : 'Move to Trash'}
            </button>
          </>
        }
      >
        {filterMode === 'trash'
          ? 'Are you sure you want to permanently delete this note? This action cannot be undone.'
          : 'Are you sure you want to move this note to trash? You can restore it later.'}
      </Modal>
    </div>
  );
}
