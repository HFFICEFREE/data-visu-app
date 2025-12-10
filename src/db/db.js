import { BrowserLevel } from 'browser-level';
import { v4 as uuidv4 } from 'uuid';

// Initialize the database
const db = new BrowserLevel('note-universe', { valueEncoding: 'json' });

export const generateId = () => uuidv4();

export const getNotes = async () => {
  const notes = [];
  for await (const [key, value] of db.iterator()) {
    notes.push(value);
  }
  return notes;
};

export const getNote = async (id) => {
  try {
    return await db.get(id);
  } catch (err) {
    if (err.notFound) return null;
    throw err;
  }
};

export const saveNote = async (note) => {
  const noteToSave = {
    ...note,
    updatedAt: new Date().toISOString(),
    id: note.id || generateId(),
    createdAt: note.createdAt || new Date().toISOString(),
    links: note.links || [],
    tags: note.tags || [],
    color: note.color || '#ffffff' // Default white
  };
  await db.put(noteToSave.id, noteToSave);
  return noteToSave;
};

export const deleteNote = async (id) => {
  await db.del(id);
};

// Helper to seed some initial data if empty
export const seedDatabase = async () => {
  const notes = await getNotes();
  if (notes.length > 0) return;

  const rootId = generateId();
  const child1Id = generateId();
  const child2Id = generateId();

  await saveNote({
    id: rootId,
    title: 'Welcome to Note Universe',
    content: 'This is the start of your journey. **Drag me!**',
    color: '#ff0055',
    links: [child1Id, child2Id]
  });

  await saveNote({
    id: child1Id,
    title: 'Visualization',
    content: 'We use force-directed graphs.',
    color: '#00ccff',
    links: []
  });

  await saveNote({
    id: child2Id,
    title: 'Time Travel',
    content: 'Check the timeline view.',
    color: '#00ffaa',
    links: []
  });

  console.log('Database seeded!');
};
