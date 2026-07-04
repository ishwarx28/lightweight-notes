import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive } from 'lucide-react';
import { NoteCard } from '../components/NoteCard';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { useNotes } from '../hooks/useNotes';
import { filterNotes } from '../utils/filterNotes';
import styles from './AllNotesPage.module.css';

export function ArchivedPage() {
  const navigate = useNavigate();
  const { notes, search, sort, deleteNote, archiveNote, pinNote } = useNotes();
  const [deleteId, setDeleteId] = useState(null);

  const filtered = filterNotes(notes, { search, sort, archived: true });

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteNote(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Archived Notes</h1>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="No archived notes"
          description="Archive notes to keep them out of the way."
        />
      ) : (
        <div className={styles.grid}>
          {filtered.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onPin={pinNote}
              onArchive={archiveNote}
              onDelete={handleDelete}
              onClick={() => navigate(`/note/${note.id}`)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete note"
        footer={
          <>
            <button className="btnSecondary" onClick={() => setDeleteId(null)}>
              Cancel
            </button>
            <button className="btnDanger" onClick={confirmDelete}>
              Delete
            </button>
          </>
        }
      >
        Are you sure you want to delete this note? This action cannot be undone.
      </Modal>
    </div>
  );
}
