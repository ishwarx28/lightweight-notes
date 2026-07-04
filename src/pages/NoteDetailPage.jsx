import { NoteEditor } from '../components/NoteEditor';
import { useParams } from 'react-router-dom';

export function NoteDetailPage() {
  const { id } = useParams();
  return <NoteEditor noteId={id} />;
}
