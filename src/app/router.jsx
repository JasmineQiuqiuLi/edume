import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import LibraryPage from '../pages/LibraryPage';
import CoursePage from '../pages/CoursePage';
import CharactersPage from '../pages/CharactersPage';

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/courses" element={<LibraryPage />} />
        <Route path="/course/:id" element={<CoursePage />} />
        <Route path="/characters" element={<CharactersPage />} />
      </Routes>
    </BrowserRouter>
  );
}
