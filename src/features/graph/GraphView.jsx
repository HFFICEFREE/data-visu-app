import { useEffect, useState, useRef, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { useNavigate } from 'react-router-dom';
import { getNotes, seedDatabase } from '../../db/db';

export function GraphView() {
    const [data, setData] = useState({ nodes: [], links: [] });
    const navigate = useNavigate();
    const graphRef = useRef();
    const keys = useRef({ w: false, a: false, s: false, d: false });
    const requestIdRef = useRef(null);

    useEffect(() => {
        loadData();

        const handleKeyDown = (e) => {
            const key = e.key.toLowerCase();
            if (keys.current.hasOwnProperty(key)) keys.current[key] = true;
        };

        const handleKeyUp = (e) => {
            const key = e.key.toLowerCase();
            if (keys.current.hasOwnProperty(key)) keys.current[key] = false;
        };

        const handleBlur = () => {
            keys.current = { w: false, a: false, s: false, d: false };
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('blur', handleBlur);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('blur', handleBlur);
        };
    }, []);

    useEffect(() => {
        const animate = () => {
            if (graphRef.current) {
                const { w, a, s, d } = keys.current;
                if (w || a || s || d) {
                    const camera = graphRef.current.camera();
                    const controls = graphRef.current.controls();

                    if (camera && controls) {
                        const speed = 4;
                        const pos = camera.position;
                        const target = controls.target;

                        const e = camera.matrixWorld.elements;

                        const right = { x: e[0], y: e[1], z: e[2] };

                        const fwd = { x: -e[8], y: -e[9], z: -e[10] };

                        const move = { x: 0, y: 0, z: 0 };

                        if (w) {
                            move.x += fwd.x * speed;
                            move.y += fwd.y * speed;
                            move.z += fwd.z * speed;
                        }
                        if (s) {
                            move.x -= fwd.x * speed;
                            move.y -= fwd.y * speed;
                            move.z -= fwd.z * speed;
                        }
                        if (d) {
                            move.x += right.x * speed;
                            move.y += right.y * speed;
                            move.z += right.z * speed;
                        }
                        if (a) {
                            move.x -= right.x * speed;
                            move.y -= right.y * speed;
                            move.z -= right.z * speed;
                        }

                        const newPos = {
                            x: pos.x + move.x,
                            y: pos.y + move.y,
                            z: pos.z + move.z
                        };

                        const newTarget = {
                            x: target.x + move.x,
                            y: target.y + move.y,
                            z: target.z + move.z
                        };

                        graphRef.current.cameraPosition(newPos, newTarget, 0);
                    }
                }
            }
            requestIdRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (requestIdRef.current) cancelAnimationFrame(requestIdRef.current);
        };
    }, []);

    const loadData = async () => {
        await seedDatabase(); // Ensure we have something to show
        const notes = await getNotes();

        const nodes = notes.map(note => ({
            id: note.id,
            name: note.title,
            color: note.color || '#fff',
            val: 1 // size
        }));

        const links = [];
        notes.forEach(note => {
            if (note.links) {
                note.links.forEach(targetId => {
                    if (notes.find(n => n.id === targetId)) {
                        links.push({
                            source: note.id,
                            target: targetId
                        });
                    }
                });
            }
        });

        setData({ nodes, links });
    };

    const handleNodeClick = useCallback((node) => {
        const distance = 40;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

        if (graphRef.current) {
            graphRef.current.cameraPosition(
                { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
                node,
                3000
            );
        }

        setTimeout(() => {
            navigate(`/note/${node.id}`);
        }, 500);
    }, [navigate]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ForceGraph3D
                ref={graphRef}
                graphData={data}
                nodeLabel="name"
                nodeColor="color"
                nodeRelSize={6}
                linkOpacity={0.3}
                linkWidth={2}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.005}
                backgroundColor="#050510"
                onNodeClick={handleNodeClick}
            />
        </div>
    );
}
