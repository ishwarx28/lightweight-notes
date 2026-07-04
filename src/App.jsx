import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NotesProvider } from './contexts/NotesContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout/Layout';
import { AllNotesPage } from './pages/AllNotesPage';
import { NoteDetailPage } from './pages/NoteDetailPage';
import { ArchivedPage } from './pages/ArchivedPage';
import { TagPage } from './pages/TagPage';

export default function App() {
  return (
    <NotesProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<AllNotesPage />} />
              <Route path="/note/:id" element={<NoteDetailPage />} />
              <Route path="/archived" element={<ArchivedPage />} />
              <Route path="/tag/:tagName" element={<TagPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </NotesProvider>
  );
}
