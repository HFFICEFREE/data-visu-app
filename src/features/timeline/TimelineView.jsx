import { useEffect, useState } from 'react';
import { getNotes } from '../../db/db';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import styles from './TimelineView.module.css';

export function TimelineView() {
    const [notes, setNotes] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [sortType, setSortType] = useState('date'); // 'date' | 'title' | 'id'
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const rawNotes = await getNotes();
        setNotes(rawNotes);
    };

    const filteredNotes = selectedId
        ? notes.filter(n => {
            if (n.id === selectedId) return true;
            const selectedNote = notes.find(x => x.id === selectedId);
            const isIncoming = n.links?.includes(selectedId);
            const isOutgoing = selectedNote?.links?.includes(n.id);
            return isIncoming || isOutgoing;
        })
        : notes;

    const displayedNotes = [...filteredNotes].sort((a, b) => {
        let valA, valB;
        if (sortType === 'date') {
            valA = new Date(a.createdAt || 0).getTime();
            valB = new Date(b.createdAt || 0).getTime();
        } else if (sortType === 'title') {
            valA = (a.title || '').toLowerCase();
            valB = (b.title || '').toLowerCase();
        } else if (sortType === 'id') {
            valA = (a.id || '').toLowerCase();
            valB = (b.id || '').toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <div className={styles.container}>
            <div className={styles.headerRow}>
                {selectedId && (
                    <button
                        className={styles.backBtn}
                        onClick={() => setSelectedId(null)}
                    >
                        ← Back
                    </button>
                )}
                <div className={styles.headerContent}>
                    <h2 className={styles.heading}>
                        {selectedId ? 'Note Timeline' : 'Time Stream'}
                    </h2>
                    <div className={styles.sortControls}>
                        <select
                            value={sortType}
                            onChange={e => setSortType(e.target.value)}
                            className={styles.sortSelect}
                        >
                            <option value="date">Date</option>
                            <option value="title">Title</option>
                            <option value="id">ID</option>
                        </select>
                        <button
                            className={styles.sortBtn}
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.timeline}>
                {displayedNotes.map((note) => (
                    <div
                        key={note.id}
                        className={`${styles.card} ${selectedId === note.id ? styles.selectedCard : ''}`}
                        style={{ borderLeftColor: note.color }}
                        onClick={() => setSelectedId(note.id)}
                    >
                        <div className={styles.date}>
                            {note.createdAt ? format(new Date(note.createdAt), 'PPP p') : 'Unknown Date'}
                        </div>
                        <h3 className={styles.title}>
                            {note.title || 'Untitled'}
                            {note.alias && <span className={styles.alias}>({note.alias})</span>}
                        </h3>
                        {selectedId && selectedId !== note.id && (
                            <div className={styles.relation}>
                                {note.links?.includes(selectedId) ? '→ Links to this' : '← Linked from this'}
                            </div>
                        )}
                        <div className={styles.preview}>
                            {note.content?.substring(0, 100)}...
                        </div>

                        <button
                            className={styles.openBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/note/${note.id}`);
                            }}
                        >
                            Open
                        </button>
                    </div>
                ))}
                {displayedNotes.length === 0 && <div className={styles.empty}>No related notes found.</div>}
            </div>
        </div>
    );
}
