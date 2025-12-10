import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getNote, saveNote, deleteNote, getNotes, generateId } from '../../db/db';
import styles from './NoteEditor.module.css';

export function NoteEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [note, setNote] = useState({
        title: '',
        content: '',
        alias: '', // Unique Connection Name
        color: '#ffffff',
        tags: [],
        links: []
    });
    const [allNotes, setAllNotes] = useState([]);
    const [isPreview, setIsPreview] = useState(false);
    const [loading, setLoading] = useState(true);
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        const notes = await getNotes();
        setAllNotes(notes);

        if (id && id !== 'new') {
            const found = await getNote(id);
            if (found) {
                setNote(found);
            } else {
                // Handle 404?
                navigate('/note/new');
            }
        } else {
            // Prepare new
            setNote({
                title: '',
                content: '',
                alias: '',
                color: '#ffffff', // maybe random?
                tags: [],
                links: []
            })
        }
        setLoading(false);
    };

    const handleSave = async () => {
        let finalAlias = (note.alias || '').trim();

        if (!finalAlias) {
            finalAlias = (note.title || 'Untitled').trim();
        }

        let candidate = finalAlias;
        let counter = 1;

        const isDuplicate = (aliasToCheck) => allNotes.some(n =>
            n.id !== note.id &&
            (n.alias === aliasToCheck || (!n.alias && n.title === aliasToCheck))
        );

        while (isDuplicate(candidate)) {
            candidate = `${finalAlias} (${counter})`;
            counter++;
        }

        const noteToSave = { ...note, alias: candidate };

        const saved = await saveNote(noteToSave);

        setNote(saved);

        if (!id || id === 'new') {
            navigate(`/note/${saved.id}`, { replace: true });
        } else {
            await loadData();
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this note?')) {
            if (note.id) await deleteNote(note.id);
            navigate('/');
        }
    };

    const toggleLink = (targetId) => {
        setNote(prev => {
            const links = prev.links || [];
            if (links.includes(targetId)) {
                return { ...prev, links: links.filter(l => l !== targetId) };
            } else {
                return { ...prev, links: [...links, targetId] };
            }
        });
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = tagInput.trim();
            if (!val) return;

            const exists = (note.tags || []).some(t => t.toLowerCase() === val.toLowerCase());
            if (exists) {
                alert('Tag already exists!');
                return;
            }

            setNote(prev => ({ ...prev, tags: [...(prev.tags || []), val] }));
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setNote(prev => ({
            ...prev,
            tags: (prev.tags || []).filter(t => t !== tagToRemove)
        }));
    };

    if (loading) return <div className={styles.container}>Loading...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <button onClick={() => navigate(-1)}>Back</button>
                <div className={styles.spacer} />
                <button onClick={() => setIsPreview(!isPreview)}>
                    {isPreview ? 'Edit' : 'Preview'}
                </button>
                <button className={styles.saveBtn} onClick={handleSave}>Save</button>
                {id && id !== 'new' && (
                    <button className={styles.deleteBtn} onClick={handleDelete}>Delete</button>
                )}
            </div>

            <div className={styles.metaRow}>
                <input
                    className={styles.titleInput}
                    placeholder="Note Title"
                    value={note.title}
                    onChange={e => setNote({ ...note, title: e.target.value })}
                />
                <input
                    type="color"
                    className={styles.colorInput}
                    value={note.color}
                    onChange={e => setNote({ ...note, color: e.target.value })}
                    title="Note Color"
                />
            </div>

            <div className={styles.metaRow}>
                <span className={styles.label}>ID:</span>
                <input
                    className={styles.aliasInput}
                    placeholder="Unique Connection Name"
                    value={note.alias || ''}
                    onChange={e => setNote({ ...note, alias: e.target.value })}
                />
            </div>

            <div className={styles.metaRow}>
                {/* Tags Section */}
                <div className={styles.tagSection}>
                    <div className={styles.tagList}>
                        {(note.tags || []).map(tag => (
                            <span key={tag} className={styles.tagChip}>
                                {tag}
                                <button onClick={() => removeTag(tag)} className={styles.tagRemove}>×</button>
                            </span>
                        ))}
                        <input
                            className={styles.tagInput}
                            placeholder="+ Tag"
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.editorArea}>
                {isPreview ? (
                    <div className={styles.preview} style={{ borderColor: note.color }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {note.content}
                        </ReactMarkdown>
                    </div>
                ) : (
                    <textarea
                        className={styles.textarea}
                        placeholder="Write your note in Markdown..."
                        value={note.content}
                        onChange={e => setNote({ ...note, content: e.target.value })}
                    />
                )}
            </div>

            <div className={styles.connections}>
                <h3>Connections</h3>
                <div className={styles.linkList}>
                    {allNotes
                        .filter(n => n.id !== note.id)
                        .map(n => {
                            const baseName = n.alias || n.title || 'Untitled';
                            const isDuplicate = allNotes.filter(
                                x => x.id !== note.id && (x.alias || x.title || 'Untitled') === baseName
                            ).length > 1;

                            const displayName = isDuplicate ? `${baseName} (${n.id.substring(0, 4)})` : baseName;

                            return (
                                <div
                                    key={n.id}
                                    className={`${styles.linkChip} ${note.links?.includes(n.id) ? styles.linkActive : ''}`}
                                    onClick={() => toggleLink(n.id)}
                                    style={{ borderColor: n.color }}
                                >
                                    {displayName}
                                </div>
                            )
                        })}
                </div>
            </div>
        </div>
    );
}
