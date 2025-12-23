import { useEffect, useState, useRef } from 'react';
import { getNotes } from '../../db/db';
import { format } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';
import styles from './TimelineView.module.css';

export function TimelineView() {
    const [notes, setNotes] = useState([]);
    const [selectedId, setSelectedId] = useState(() => localStorage.getItem('timeline_selectedId') || null);
    const [sortType, setSortType] = useState(() => localStorage.getItem('timeline_sortType') || 'date'); // 'date' | 'title' | 'id'
    const [sortOrder, setSortOrder] = useState(() => localStorage.getItem('timeline_sortOrder') || 'desc'); // 'asc' | 'desc'
    const navigate = useNavigate();
    const containerRef = useRef(null);

    const [hasRestoredScroll, setHasRestoredScroll] = useState(false);
    const prevSelectedId = useRef(selectedId);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!hasRestoredScroll && notes.length > 0 && containerRef.current) {
            const savedScroll = localStorage.getItem('timeline_scrollTop');
            if (savedScroll) {
                containerRef.current.scrollTop = parseInt(savedScroll, 10);
            }
            setHasRestoredScroll(true);
        }
    }, [notes, hasRestoredScroll]);

    const handleScroll = (e) => {
        localStorage.setItem('timeline_scrollTop', e.target.scrollTop);
    };

    useEffect(() => {
        if (selectedId) localStorage.setItem('timeline_selectedId', selectedId);
        else localStorage.removeItem('timeline_selectedId');

        if (prevSelectedId.current !== selectedId) {
            if (selectedId === null) {
                const globalScroll = localStorage.getItem('timeline_global_scrollTop');
                if (globalScroll && containerRef.current) {
                    setTimeout(() => {
                        containerRef.current.scrollTop = parseInt(globalScroll, 10);
                    }, 0);
                }
            } else if (prevSelectedId.current === null) {
                if (containerRef.current) containerRef.current.scrollTop = 0;
            }
            prevSelectedId.current = selectedId;
        }
    }, [selectedId]);

    useEffect(() => {
        localStorage.setItem('timeline_sortType', sortType);
    }, [sortType]);

    useEffect(() => {
        localStorage.setItem('timeline_sortOrder', sortOrder);
    }, [sortOrder]);

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
        <div
            className={styles.container}
            ref={containerRef}
            onScroll={handleScroll}
        >
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
                    <Link
                        key={note.id}
                        to={`/note/${note.id}`}
                        className={`${styles.card} ${selectedId === note.id ? styles.selectedCard : ''}`}
                        style={{ borderLeftColor: note.color }}
                        onClick={(e) => {
                            if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;

                            e.preventDefault();

                            if (!selectedId && containerRef.current) {
                                localStorage.setItem('timeline_global_scrollTop', containerRef.current.scrollTop);
                            }

                            setSelectedId(note.id);
                        }}
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
                            {note.content?.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
                        </div>

                        <div className={styles.cardActions}>
                            <div
                                className={styles.openBtn}
                                role="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    navigate(`/note/${note.id}`);
                                }}
                            >
                                Open
                            </div>
                        </div>
                    </Link>
                ))}
                {displayedNotes.length === 0 && <div className={styles.empty}>No related notes found.</div>}
            </div>
        </div>
    );
}
