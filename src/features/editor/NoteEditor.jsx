import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';

import { 
    Bold, Italic, Strikethrough, Code, Eraser, 
    Heading1, Heading2, Heading3, List, ListOrdered, 
    Quote, Minus, Undo, Redo, Pilcrow,
    Underline as UnderlineIcon, Subscript as SubscriptIcon, Superscript as SuperscriptIcon,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    ImagePlus, Link as LinkIcon, Highlighter, ChevronDown, Indent, Outdent
} from 'lucide-react';
import { getNote, saveNote, deleteNote, getNotes, generateId } from '../../db/db';
import styles from './NoteEditor.module.css';

const MenuBar = ({ editor, onAddImage, onSetLink }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className={styles.menuBar}>
            <div className={styles.buttonGroup}>
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                    title="Undo (Ctrl+Z)"
                >
                    <Undo size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                    title="Redo (Ctrl+Shift+Z)"
                >
                    <Redo size={16} />
                </button>
            </div>

            <div className={styles.divider} />

            <div className={styles.buttonGroup}>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={editor.isActive('heading', { level: 1 }) ? styles.isActive : ''}
                    title="Heading 1 (Ctrl+Alt+1)"
                >
                    <Heading1 size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={editor.isActive('heading', { level: 2 }) ? styles.isActive : ''}
                    title="Heading 2 (Ctrl+Alt+2)"
                >
                    <Heading2 size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={editor.isActive('heading', { level: 3 }) ? styles.isActive : ''}
                    title="Heading 3 (Ctrl+Alt+3)"
                >
                    <Heading3 size={16} />
                </button>
            </div>

            <div className={styles.buttonGroup}>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? styles.isActive : ''}
                    title="Bullet List (Ctrl+Shift+8)"
                >
                    <List size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive('orderedList') ? styles.isActive : ''}
                    title="Ordered List (Ctrl+Shift+7)"
                >
                    <ListOrdered size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
                    disabled={!editor.can().sinkListItem('listItem')}
                    title="Indent (Tab)"
                >
                    <Indent size={16} />
                </button>
            </div>

            <div className={styles.buttonGroup}>
                <button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={editor.isActive('blockquote') ? styles.isActive : ''}
                    title="Blockquote (Ctrl+Shift+B)"
                >
                    <Quote size={16} />
                </button>
            </div>

            <div className={styles.divider} />

            <div className={styles.buttonGroup}>
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? styles.isActive : ''}
                    title="Bold (Ctrl+B)"
                >
                    <Bold size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? styles.isActive : ''}
                    title="Italic (Ctrl+I)"
                >
                    <Italic size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={!editor.can().chain().focus().toggleStrike().run()}
                    className={editor.isActive('strike') ? styles.isActive : ''}
                    title="Strike (Ctrl+Shift+X)"
                >
                    <Strikethrough size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    disabled={!editor.can().chain().focus().toggleCode().run()}
                    className={editor.isActive('code') ? styles.isActive : ''}
                    title="Code (Ctrl+E)"
                >
                    <Code size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={editor.isActive('underline') ? styles.isActive : ''}
                    title="Underline (Ctrl+U)"
                >
                    <UnderlineIcon size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    className={editor.isActive('highlight') ? styles.isActive : ''}
                    title="Highlight (Ctrl+Shift+H)"
                >
                    <Highlighter size={16} />
                </button>
                <button
                    onClick={onSetLink}
                    className={editor.isActive('link') ? styles.isActive : ''}
                    title="Link (Ctrl+K)"
                >
                    <LinkIcon size={16} />
                </button>
            </div>

            <div className={styles.divider} />

            <div className={styles.buttonGroup}>
                <button
                    onClick={() => editor.chain().focus().toggleSuperscript().run()}
                    className={editor.isActive('superscript') ? styles.isActive : ''}
                    title="Superscript (Ctrl+.)"
                >
                    <SuperscriptIcon size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleSubscript().run()}
                    className={editor.isActive('subscript') ? styles.isActive : ''}
                    title="Subscript (Ctrl+,)"
                >
                    <SubscriptIcon size={16} />
                </button>
            </div>

            <div className={styles.divider} />

            <div className={styles.buttonGroup}>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={editor.isActive({ textAlign: 'left' }) ? styles.isActive : ''}
                    title="Align Left (Ctrl+Shift+L)"
                >
                    <AlignLeft size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={editor.isActive({ textAlign: 'center' }) ? styles.isActive : ''}
                    title="Align Center (Ctrl+Shift+E)"
                >
                    <AlignCenter size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={editor.isActive({ textAlign: 'right' }) ? styles.isActive : ''}
                    title="Align Right (Ctrl+Shift+R)"
                >
                    <AlignRight size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    className={editor.isActive({ textAlign: 'justify' }) ? styles.isActive : ''}
                    title="Align Justify (Ctrl+Shift+J)"
                >
                    <AlignJustify size={16} />
                </button>
            </div>

            <div className={styles.divider} />

            <div className={styles.buttonGroup}>
                <button onClick={onAddImage} title="Add Image">
                    <ImagePlus size={16} />
                    <span style={{ marginLeft: 4, fontSize: '0.8rem' }}>Add</span>
                </button>
            </div>
        </div>
    );
};

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
    const [loading, setLoading] = useState(true);
    const [tagInput, setTagInput] = useState('');

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Subscript,
            Superscript,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Image,
            Link.configure({
                openOnClick: false,
            }),
            Highlight,
        ],
        content: '',
        onUpdate: ({ editor }) => {
            setNote(prev => ({ ...prev, content: editor.getHTML() }));
        },
    });

    const addImage = useCallback(() => {
        if (!editor) return;
        const url = window.prompt('URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) return;

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);


    useEffect(() => {
        loadData();
    }, [id]);

    useEffect(() => {
        if (editor && !loading) {
            // Only set content if it's different to avoid cursor jumps or loops
            // But here we are setting it when loading finishes, which is safe.
            // We might want to check if content is empty in editor to avoid overwriting if user started typing before load?
            // But loading state handles that.
            if (editor.getHTML() !== note.content) {
                 editor.commands.setContent(note.content);
            }
        }
    }, [loading, editor]); // We depend on loading state change to trigger this once

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

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Save: Ctrl+S or Cmd+S
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
            // Link: Ctrl+K or Cmd+K
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setLink();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSave, setLink]);

    if (loading) return (
        <div className={styles.scrollContainer}>
            <div className={styles.contentWrapper}>Loading...</div>
        </div>
    );

    return (
        <div className={styles.scrollContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.toolbar}>
                    <button onClick={() => navigate(-1)}>Back</button>
                    <div className={styles.spacer} />
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
                    <MenuBar editor={editor} onAddImage={addImage} onSetLink={setLink} />
                    <EditorContent editor={editor} className={styles.tiptapEditor} />
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
        </div>
    );
}
