import { useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getNotes, saveNote } from '../db/db';
import styles from './Layout.module.css';

export function Layout() {
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleExport = async () => {
        const notes = await getNotes();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "note-universe-export.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const importedNotes = JSON.parse(e.target.result);
                if (!Array.isArray(importedNotes)) {
                    throw new Error('Invalid format: data must be an array of notes');
                }

                if (confirm(`Importing ${importedNotes.length} notes. Existing notes with same ID will be overwritten. Continue?`)) {
                    for (const note of importedNotes) {
                        await saveNote(note);
                    }
                    alert('Import successful!');
                    window.location.reload();
                }
            } catch (error) {
                console.error('Import failed', error);
                alert('Import failed: ' + error.message);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Note Universe</h1>
                <div className={styles.actions}>
                    <button onClick={handleExport} className={styles.actionBtn}>Export JSON</button>
                    <button onClick={handleImportClick} className={styles.actionBtn}>Import JSON</button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept=".json"
                        onChange={handleFileChange}
                    />
                </div>
            </header>

            <main className={styles.content}>
                <Outlet />
            </main>

            <nav className={styles.dock}>
                <NavLink
                    to="/"
                    className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                    Graph 3D
                </NavLink>
                <NavLink
                    to="/timeline"
                    className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                    Timeline
                </NavLink>
                <NavLink
                    to="/note/new"
                    className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                    New Note
                </NavLink>
            </nav>
        </div>
    );
}
