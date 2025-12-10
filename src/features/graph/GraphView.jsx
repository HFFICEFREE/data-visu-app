import { useEffect, useState, useRef, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { useNavigate } from 'react-router-dom';
import { getNotes, seedDatabase } from '../../db/db';

export function GraphView() {
    const [data, setData] = useState({ nodes: [], links: [] });
    const navigate = useNavigate();
    const graphRef = useRef();

    useEffect(() => {
        loadData();
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
                    // Verify target exists to avoid crashes
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
        // Fly to node then navigate?
        const distance = 40;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

        if (graphRef.current) {
            graphRef.current.cameraPosition(
                { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
                node, // lookAt ({ x, y, z })
                3000  // ms transition duration
            );
        }

        // Slight delay for effect before nav
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
                // Link color gradient is automatic if we don't fix it, or we can use linkColor to function
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.005}
                backgroundColor="#050510"
                onNodeClick={handleNodeClick}
            />
        </div>
    );
}
