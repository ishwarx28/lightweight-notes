import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Pin, PinOff, Star, Share2, MoreHorizontal,
  Archive, ArchiveRestore, Trash2, Loader2, Clock, Type, BookOpen,
} from 'lucide-react';
import { TagBadge } from './TagBadge';
import { Modal } from './Modal';
import { useNotes } from '../hooks/useNotes';
import { formatDate } from '../utils/formatDate';
import styles from './NoteEditor.module.css';

export function NoteEditor({ noteId }) {
  const { getNote, addNote, updateNote, trashNote, restoreNote, permanentDeleteNote, archiveNote, pinNote, allTags, setSelectedNoteId } = useNotes();

  const existingNote = getNote(noteId);
  const isNew = !existingNote;

  const [title, setTitle] = useState(() => existingNote?.title ?? '');
  const [content, setContent] = useState(() => existingNote?.content ?? '');
  const [tags, setTags] = useState(() => existingNote?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [saved, setSaved] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [internalNoteId, setInternalNoteId] = useState(() => existingNote?.id ?? null);

  const titleRef = useRef(null);
  const createdRef = useRef(false);
  const savedTimerRef = useRef(null);
  const moreMenuRef = useRef(null);

  // ── Create new note ──
  useEffect(() => {
    if (!isNew) return;
    if (createdRef.current) return;
    createdRef.current = true;

    const newNote = addNote({ title: '', content: '', tags: [] });
    setInternalNoteId(newNote.id);
    // Update the selected note ID so URL stays in sync
    // (we can't navigate, but we can update the context)
    setTimeout(() => titleRef.current?.focus(), 100);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Re-init when navigating between notes ──
  const initRef = useRef(null);
  useEffect(() => {
    if (!noteId) return;
    if (initRef.current === noteId) return;
    initRef.current = noteId;

    const note = getNote(noteId);
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags);
      setInternalNoteId(note.id);
      setSaved(true);
    }
  }, [noteId, getNote]);

  // ── Auto-save ──
  useEffect(() => {
    if (!internalNoteId) return;

    const timer = setTimeout(() => {
      const original = getNote(internalNoteId);
      if (!original) return;

      const hasChanged =
        title !== original.title ||
        content !== original.content ||
        JSON.stringify(tags) !== JSON.stringify(original.tags);

      if (hasChanged) {
        setSaved(false);
        updateNote(internalNoteId, { title, content, tags });
        clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setSaved(true), 400);
      }
    }, 600);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, JSON.stringify(tags), internalNoteId]);

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
  const activeId = existingNote ? existingNote.id : internalNoteId;
  const note = getNote(activeId);
  const isPinned = note?.pinned ?? false;

  const handlePin = () => {
    if (activeId) pinNote(activeId);
  };

  const handleArchive = () => {
    if (activeId) {
      archiveNote(activeId);
      setSelectedNoteId(null);
    }
  };

  const handleTrashClick = () => {
    if (activeId) setDeleteModalOpen(true);
  };

  const confirmTrash = () => {
    if (activeId) {
      trashNote(activeId);
      setDeleteModalOpen(false);
      setSelectedNoteId(null);
    }
  };

  const handleRestore = () => {
    if (activeId) {
      restoreNote(activeId);
      setSelectedNoteId(null);
    }
  };

  const handlePermanentDelete = () => {
    if (activeId) {
      permanentDeleteNote(activeId);
      setDeleteModalOpen(false);
      setSelectedNoteId(null);
    }
  };

  const handleBack = () => {
    setSelectedNoteId(null);
  };

  // ── Word count ──
  const wordCount = content.trim()
    ? content.trim().split(/\s+/).length
    : 0;
  const charCount = content.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // ── Close more menu on outside click ──
  useEffect(() => {
    if (!showMoreMenu) return;
    const handler = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMoreMenu]);

  // ── Render: creating state ──
  if (isNew && !internalNoteId) {
    return (
      <div className={styles.editor}>
        <div className={styles.toolbar}>
          <button className={styles.toolBack} onClick={handleBack}>
            <ArrowLeft size={16} />
          </button>
          <span className={styles.saving}>
            <Loader2 size={14} className={styles.spinner} /> Creating…
          </span>
        </div>
      </div>
    );
  }

  // ── Render: note not found ──
  if (!activeId) {
    return (
      <div className={styles.editor}>
        <div className={styles.toolbar}>
          <button className={styles.toolBack} onClick={handleBack}>
            <ArrowLeft size={16} />
          </button>
        </div>
        <div className={styles.editorInner}>
          <p className={styles.notFound}>Note not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.editor}>
      {/* ── Top Toolbar ── */}
      <div className={styles.toolbar}>
        <button className={styles.toolBack} onClick={handleBack} aria-label="Back to notes">
          <ArrowLeft size={16} />
        </button>

        <div className={styles.toolbarSpacer} />

        <div className={styles.toolbarGroup}>
          <button
            className={`${styles.toolBtn} ${isPinned ? styles.toolBtnActive : ''}`}
            onClick={handlePin}
            aria-label={isPinned ? 'Unpin note' : 'Pin note'}
            title={isPinned ? 'Unpin' : 'Pin'}
          >
            {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
          </button>
          <button
            className={`${styles.toolBtn} ${isPinned ? styles.toolFavActive : ''}`}
            onClick={handlePin}
            aria-label={isPinned ? 'Remove from favorites' : 'Add to favorites'}
            title={isPinned ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star size={16} />
          </button>
          <button
            className={styles.toolBtn}
            onClick={async () => {
              const shareData = {
                title: note?.title || 'Untitled Note',
                text: note?.content || '',
              };
              if (navigator.share) {
                try {
                  await navigator.share(shareData);
                } catch {
                  // user cancelled
                }
              } else {
                try {
                  await navigator.clipboard.writeText(
                    `${shareData.title}\n\n${shareData.text}`
                  );
                  // brief visual feedback
                  const btn = document.activeElement;
                  if (btn) {
                    btn.style.color = 'var(--color-success)';
                    setTimeout(() => { btn.style.color = ''; }, 1000);
                  }
                } catch {
                  // clipboard not available
                }
              }
            }}
            aria-label="Share"
            title="Share"
          >
            <Share2 size={16} />
          </button>
          <div className={styles.moreMenuWrap} ref={moreMenuRef}>
            <button
              className={styles.toolBtn}
              onClick={() => setShowMoreMenu((v) => !v)}
              aria-label="More options"
              title="More"
            >
              <MoreHorizontal size={16} />
            </button>
            {showMoreMenu && (
              <div className={styles.moreMenu}>
                {note?.trashed ? (
                  <>
                    <button className={styles.moreMenuItem} onClick={handleRestore}>
                      <ArchiveRestore size={14} />
                      <span>Restore</span>
                    </button>
                    <button
                      className={`${styles.moreMenuItem} ${styles.moreMenuItemDanger}`}
                      onClick={handlePermanentDelete}
                    >
                      <Trash2 size={14} />
                      <span>Delete permanently</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button className={styles.moreMenuItem} onClick={handleArchive}>
                      <Archive size={14} />
                      <span>{note?.archived ? 'Unarchive' : 'Archive'}</span>
                    </button>
                    <button
                      className={`${styles.moreMenuItem} ${styles.moreMenuItemDanger}`}
                      onClick={handleTrashClick}
                    >
                      <Trash2 size={14} />
                      <span>Move to Trash</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.editorInner}>
        {/* ── Title ── */}
        <input
          ref={titleRef}
          className={styles.titleInput}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Note"
        />

        {/* ── Tags ── */}
        <div className={styles.tagsSection}>
          <div className={styles.tagList}>
            {tags.map((tag) => (
              <TagBadge key={tag} tag={tag} onRemove={handleRemoveTag} />
            ))}
            <input
              className={styles.tagInput}
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={commitTag}
              placeholder={tags.length === 0 ? 'Add tags…' : 'Add…'}
            />
          </div>
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
        </div>

        {/* ── Metadata ── */}
        <div className={styles.metadata}>
          <span className={styles.metaItem}>
            <Clock size={12} />
            Updated {note ? formatDate(note.updatedAt) : 'just now'}
          </span>
          <span className={styles.metaItem}>
            <Type size={12} />
            {wordCount} words
          </span>
          <span className={styles.metaItem}>
            <BookOpen size={12} />
            {readingTime} min read
          </span>
        </div>

        {/* ── Content (Editor) ── */}
        <div className={styles.contentArea}>
          <textarea
            className={styles.contentTextarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your note..."
          />
        </div>

        {/* ── Bottom Status Bar ── */}
        <div className={styles.statusBar}>
          <div className={styles.statusLeft}>
            <span className={styles.statusItem}>{wordCount} words</span>
            <span className={styles.statusItem}>{charCount} characters</span>
          </div>
          <div className={styles.statusRight}>
            {!saved && (
              <span className={styles.savingIndicator}>
                <Loader2 size={12} className={styles.spinner} /> Saving…
              </span>
            )}
            {saved && internalNoteId && (
              <span className={styles.savedIndicator}>Autosaved</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Move to Trash Modal ── */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Move to Trash"
        footer={
          <>
            <button className="btnSecondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </button>
            <button className="btnDanger" onClick={confirmTrash}>
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
