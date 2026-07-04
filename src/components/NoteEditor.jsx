import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Pin, PinOff, Archive, Trash2, Loader2,
} from 'lucide-react';
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

  const [title, setTitle] = useState(() => existingNote?.title ?? '');
  const [content, setContent] = useState(() => existingNote?.content ?? '');
  const [tags, setTags] = useState(() => existingNote?.tags ?? []);
  const [color, setColor] = useState(() => existingNote?.color ?? '#ffffff');
  const [tagInput, setTagInput] = useState('');
  const [saved, setSaved] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const [noteIdState, setNoteIdState] = useState(() =>
    existingNote ? existingNote.id : null
  );

  const titleRef = useRef(null);
  const textareaRef = useRef(null);
  const createdRef = useRef(false);
  const colorBtnRef = useRef(null);

  // ── Immediate creation for new notes ──
  useEffect(() => {
    if (!isNewParam) return;
    if (createdRef.current) return;
    createdRef.current = true;

    const newNote = addNote({ title: '', content: '', tags: [], color: '#ffffff' });
    setNoteIdState(newNote.id);
    navigate(`/note/${newNote.id}`, { replace: true });
    setTimeout(() => titleRef.current?.focus(), 100);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Re-init when navigating between existing notes ──
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

  // ── Auto-save ──
  const savedTimerRef = useRef(null);

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
        clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setSaved(true), 400);
      }
    }, 800);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, JSON.stringify(tags), color, noteIdState]);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  // ── Tag handling ──
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

  // ── Actions ──
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

  // ── Word count ──
  const wordCount = content.trim()
    ? content.trim().split(/\s+/).length
    : 0;
  const charCount = content.length;

  // ── Close color picker on outside click ──
  useEffect(() => {
    if (!showColorPicker) return;
    const handler = (e) => {
      if (colorBtnRef.current && !colorBtnRef.current.contains(e.target)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showColorPicker]);

  // ── Render ──
  if (isNewParam && !noteIdState) {
    return (
      <div className={styles.editor}>
        <div className={styles.toolbar}>
          <button className={styles.toolBack} onClick={() => navigate('/')}>
            <ArrowLeft size={15} /> Back
          </button>
          <div className={styles.toolbarSpacer} />
          <span className={styles.saving}>
            <Loader2 size={13} className={styles.spinner} /> Creating…
          </span>
        </div>
      </div>
    );
  }

  if (!noteIdState && !isNewParam) {
    return (
      <div className={styles.editor}>
        <div className={styles.toolbar}>
          <button className={styles.toolBack} onClick={() => navigate('/')}>
            <ArrowLeft size={15} /> Back
          </button>
        </div>
        <p style={{ color: 'var(--color-text-tertiary)', marginTop: '2rem' }}>Note not found.</p>
      </div>
    );
  }

  return (
    <div className={styles.editor}>

      {/* ── Floating toolbar ── */}
      <div className={styles.toolbar}>
        <button className={styles.toolBack} onClick={() => navigate('/')}>
          <ArrowLeft size={15} /> Back
        </button>

        <div className={styles.toolbarSpacer} />

        <div className={styles.toolbarGroup}>
          <button
            className={`${styles.toolBtn} ${isPinned ? styles.toolBtnActive : ''}`}
            onClick={handlePin}
            aria-label={isPinned ? 'Unpin note' : 'Pin note'}
            title={isPinned ? 'Unpin' : 'Pin'}
          >
            {isPinned ? <PinOff size={15} /> : <Pin size={15} />}
          </button>
          <button
            className={styles.toolBtn}
            onClick={handleArchive}
            aria-label="Archive note"
            title="Archive"
          >
            <Archive size={15} />
          </button>
          <button
            className={`${styles.toolBtn} ${styles.toolBtnDanger}`}
            onClick={handleDeleteClick}
            aria-label="Delete note"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {!saved && (
          <span className={styles.saving}>
            <Loader2 size={13} className={styles.spinner} /> Saving…
          </span>
        )}
      </div>

      {/* ── Title ── */}
      <div className={styles.titleSection}>
        <input
          ref={titleRef}
          className={styles.titleInput}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
        />
      </div>

      {/* ── Meta bar: date + tags inline ── */}
      <div className={styles.metaBar}>
        <span className={styles.metaDate}>
          {existingNote
            ? `Created ${formatDate(existingNote.createdAt)}`
            : 'Just now'}
          {existingNote && existingNote.updatedAt !== existingNote.createdAt && (
            <> · Updated {formatDate(existingNote.updatedAt)}</>
          )}
        </span>

        <div className={styles.tagList}>
          {tags.map((tag) => (
            <TagBadge key={tag} tag={tag} onRemove={handleRemoveTag} />
          ))}
          <input
            className={styles.tagInputPill}
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={commitTag}
            placeholder={tags.length === 0 ? 'Add tag…' : 'Add…'}
          />
        </div>
      </div>

      {/* Tag suggestions */}
      {tagInput && availableSuggestions.length > 0 && (
        <div className={styles.suggestions}>
          {availableSuggestions.slice(0, 5).map((t) => (
            <span
              key={t}
              className={styles.suggestionChip}
              onMouseDown={(e) => {
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

      {/* ── Content ── */}
      <div className={styles.contentArea}>
        <textarea
          ref={textareaRef}
          className={styles.contentTextarea}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing…"
        />
      </div>

      {/* ── Bottom bar: word count + colour ── */}
      <div className={styles.bottomBar}>
        <span className={styles.wordCount}>
          {wordCount > 0 ? `${wordCount} words · ${charCount} characters` : ''}
        </span>

        <div style={{ position: 'relative' }} ref={colorBtnRef}>
          <button
            className={styles.colorPickerBtn}
            onClick={() => setShowColorPicker((v) => !v)}
          >
            <span
              className={styles.colorDot}
              style={{
                background: color,
                borderColor: color === '#ffffff' ? 'var(--color-border)' : color,
              }}
            />
            <span>Colour</span>
          </button>

          {showColorPicker && (
            <div
              className={styles.colorPopover}
              style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: '0.5rem' }}
            >
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  className={`${styles.swatch} ${color === c ? styles.swatchActive : ''}`}
                  style={{
                    background: c,
                    borderColor: c === '#ffffff' ? 'var(--color-border)' : c,
                  }}
                  onClick={() => {
                    setColor(c);
                    setShowColorPicker(false);
                  }}
                  aria-label={`Select colour ${c}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Delete modal ── */}
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
