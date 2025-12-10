import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { GraphView } from './features/graph/GraphView';
import { TimelineView } from './features/timeline/TimelineView';
import { NoteEditor } from './features/editor/NoteEditor';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<GraphView />} />
        <Route path="timeline" element={<TimelineView />} />
        <Route path="note/:id" element={<NoteEditor />} />
      </Route>
    </Routes>
  );
}

export default App;
