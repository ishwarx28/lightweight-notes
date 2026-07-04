export function filterNotes(notes, { search, sort, archived, tag, trashed = false }) {
  let result = notes;

  if (trashed) {
    result = result.filter((n) => n.trashed === true);
  } else {
    result = result.filter((n) => !n.trashed);
    result = result.filter((n) => n.archived === archived);
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (tag) {
    result = result.filter((n) => n.tags.includes(tag));
  }

  switch (sort) {
    case 'oldest':
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'updated':
      result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      break;
    case 'newest':
    default:
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Pinned first (within whatever sort)
  const pinned = result.filter((n) => n.pinned);
  const unpinned = result.filter((n) => !n.pinned);
  return [...pinned, ...unpinned];
}
