import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pin, PinOff, Archive, Trash2, Loader2 } from 'lucide-react';
import { TagBadge } from './TagBadge';
import { Modal } from './Modal';
import { useNotes } from '../hooks/useNotes';
import { formatDate } from '../utils/formatDate';
import styles from './NoteEditor.module.css';

const COLOR_OPTIONS = ['#ffffff', '#fef3c7', '#dbeafe', '#e0e7ff', '#fce7f3', '#d1fae5', '#fae8ff', '#ffedd5'];

export function NoteEditor({ noteId }) {
  const navigate = useNavigate();
  const { getNote, addNote, updateNote, deleteNote, archiveNote, pinNote, allTags } = useNotes();

  const existingNote = noteId && noteId !== 'new' ? getNote(noteId) : null;
  const isNewParam = !existingNote && noteId === 'new';

  // Initialize state from existing note or empty for new
  const [title, setTitle] = useState(() => existingNote?.title ?? '');
  const [content, setContent] = useState(() => existingNote?.content ?? '');
  const [tags, setTags] = useState(() => existingNote?.tags ?? []);
  const [color, setColor] = useState(() => existingNote?.color ?? '#ffffff');
  const [tagInput, setTagInput] = useState('');
  const [saved, setSaved] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // noteIdState: the real note ID we're editing. For new notes, it starts null
  // and gets set after creation.
  const [noteIdState, setNoteIdState] = useState(() =>
    existingNote ? existingNote.id : null
  );

  const titleRef = useRef(null);
  const createdRef = useRef(false); // guards against double-creation in StrictMode

  // --- IMMEDIATE CREATION for /note/new ---
  // On mount, if this is a new note, create it instantly and replace the URL.
  // This avoids timer race conditions with deferred creation.
  useEffect(() => {
    if (!isNewParam) return;
    if (createdRef.current) return; // StrictMode guard
    createdRef.current = true;

    const newNote = addNote({ title: '', content: '', tags: [], color: '#ffffff' });
    setNoteIdState(newNote.id);
    navigate(`/note/${newNote.id}`, { replace: true });
    setTimeout(() => titleRef.current?.focus(), 100);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- RE-INIT when navigating between existing notes ---
  const initRef = useRef(null);
  useEffect(() => {
    if (!noteId || noteId === 'new') return;
    if (initRef.current === noteId) return;
    initRef.current = noteId;

    const note = getNote(noteId);
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags);
      setColor(note.color || '#ffffff');
      setNoteIdState(note.id);
      setSaved(true);
    } else {
      setNoteIdState(null);
    }
  }, [noteId, getNote]);

  // --- Auto-save (update only, never creates) ---
  const autoSaveTimerRef = useRef(null);

  useEffect(() => {
    if (!noteIdState) return;

    const timer = setTimeout(() => {
      const original = getNote(noteIdState);
      if (!original) return;

      const hasChanged =
        title !== original.title ||
        content !== original.content ||
        JSON.stringify(tags) !== JSON.stringify(original.tags) ||
        color !== (original.color || '#ffffff');

      if (hasChanged) {
        setSaved(false);
        updateNote(noteIdState, { title, content, tags, color });
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setTimeout(() => setSaved(true), 400);
      }
    }, 800);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, JSON.stringify(tags), color, noteIdState]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, []);

  // --- Tag handling ---
  const normalizeTag = (input) => {
    const trimmed = input.trim();
    if (!trimmed) return null;
    const match = allTags.find((t) => t.toLowerCase() === trimmed.toLowerCase());
    return match || trimmed;
  };

  const commitTag = () => {
    const normalized = normalizeTag(tagInput);
    if (normalized && !tags.includes(normalized)) {
      setTags((prev) => [...prev, normalized]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitTag();
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1]);
    }
  };

  const availableSuggestions = allTags.filter(
    (t) => !tags.includes(t) && t.toLowerCase().includes(tagInput.toLowerCase())
  );

  // --- Editor actions ---
  const isPinned = getNote(noteIdState)?.pinned ?? false;

  const handlePin = () => {
    if (noteIdState) pinNote(noteIdState);
  };

  const handleArchive = () => {
    if (noteIdState) {
      archiveNote(noteIdState);
      navigate('/');
    }
  };

  const handleDeleteClick = () => {
    if (noteIdState) setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (noteIdState) {
      deleteNote(noteIdState);
      setDeleteModalOpen(false);
      navigate('/', { replace: true });
    }
  };

  // --- Render ---
  if (isNewParam && !noteIdState) {
    // Still creating — show a brief loading state
    return (
      <div className={styles.editor}>
        <div className={styles.backRow}>
          <button className={styles.backBtn} onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Back
          </button>
          <span className={styles.saving}>
            <Loader2 size={14} className={styles.spinner} /> Creating…
          </span>
        </div>
      </div>
    );
  }

  if (!noteIdState && !isNewParam) {
    return (
      <div className={styles.editor}>
        <p>Note not found.</p>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back to notes
        </button>
      </div>
    );
  }

  return (
    <div className={styles.editor}>
      <div className={styles.backRow}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className={styles.editorActions}>
          <button
            className={`${styles.editorActionBtn} ${isPinned ? styles.active : ''}`}
            onClick={handlePin}
            aria-label={isPinned ? 'Unpin note' : 'Pin note'}
            title={isPinned ? 'Unpin' : 'Pin'}
          >
            {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
          </button>
          <button
            className={styles.editorActionBtn}
            onClick={handleArchive}
            aria-label="Archive note"
            title="Archive"
          >
            <Archive size={16} />
          </button>
          <button
            className={`${styles.editorActionBtn} ${styles.danger}`}
            onClick={handleDeleteClick}
            aria-label="Delete note"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {!saved && (
          <span className={styles.saving}>
            <Loader2 size={14} className={styles.spinner} /> Saving…
          </span>
        )}
      </div>

      <input
        ref={titleRef}
        className={styles.titleInput}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title…"
      />

      <div className={styles.metaRow}>
        <span>
          {existingNote
            ? `Created ${formatDate(existingNote.createdAt)}`
            : 'Just created'}
        </span>
        {existingNote && existingNote.updatedAt !== existingNote.createdAt && (
          <span>· Updated {formatDate(existingNote.updatedAt)}</span>
        )}
      </div>

      <div>
        <div
          className={styles.tagInputWrapper}
          onClick={() => document.getElementById('note-tag-input')?.focus()}
        >
          {tags.map((tag) => (
            <TagBadge key={tag} tag={tag} onRemove={handleRemoveTag} />
          ))}
          <input
            id="note-tag-input"
            className={styles.tagInput}
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={commitTag}
            placeholder={tags.length === 0 ? 'Add tags…' : ''}
          />
        </div>
        {tagInput && availableSuggestions.length > 0 && (
          <div className={styles.suggestions}>
            {availableSuggestions.slice(0, 5).map((t) => (
              <span
                key={t}
                className={styles.suggestionChip}
                onMouseDown={(e) => {
                  // Use mouseDown to fire before blur
                  e.preventDefault();
                  const normalized = normalizeTag(t);
                  if (normalized && !tags.includes(normalized)) {
                    setTags((prev) => [...prev, normalized]);
                  }
                  setTagInput('');
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <textarea
        className={styles.contentTextarea}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing…"
      />

      <div className={styles.colorRow}>
        <span className={styles.colorLabel}>Colour</span>
        <div className={styles.colorSwatches}>
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              className={`${styles.swatch} ${color === c ? styles.swatchActive : ''}`}
              style={{
                background: c,
                border: c === '#ffffff' ? '2px solid var(--color-border)' : undefined,
              }}
              onClick={() => setColor(c)}
              aria-label={`Select colour ${c}`}
            />
          ))}
        </div>
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete note"
        footer={
          <>
            <button className="btnSecondary" onClick={() => setDeleteModalOpen(false)}>
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
