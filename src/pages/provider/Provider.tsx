import React, { useEffect, useState, useCallback, useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
    Connection,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    NodeChange,
    EdgeChange,
    BackgroundVariant,
    Position,
    Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useGetProviders } from '../../hooks/useProvider';
import { Pagination, CircularProgress, Dialog, DialogTitle, DialogContent, Typography, List, ListItem, ListItemText, DialogActions, Button } from '@mui/material';

// Interfaces
interface BranchOffice {
    id: string;
    ID: number;
    Income: string;
    Name: string;
    Location: string;
    relationshipType: string;
}

interface Provider {
    id: string;
    ID: number;
    Name: string;
    Location: string;
    Voided: boolean;
    branchOffices: BranchOffice[];
}

type NodeData = {
    name: string;
    type: 'provider' | 'branchOffice';
    provider?: Provider;
    branchOffice?: BranchOffice;
    onDoubleClick: (nodeData: NodeData) => void;
};

const ProviderNode = ({ data }: { data: NodeData }) => (
    <div
        onDoubleClick={() => data.onDoubleClick(data)}
        style={{
            padding: 10,
            backgroundColor: '#ffcccb',
            border: '1px solid #ff6f61',
            borderRadius: 5,
            textAlign: 'center',
            minWidth: 150,
            cursor: 'pointer',
        }}>
        <strong>{data.name}</strong>
        <p>Proveedor</p>
        <Handle type="source" position={Position.Right} />
    </div>
);

const BranchOfficeNode = ({ data }: { data: NodeData }) => (
    <div
        onDoubleClick={() => data.onDoubleClick(data)}
        style={{
            padding: 10,
            backgroundColor: '#cce5ff',
            border: '1px solid #66b3ff',
            borderRadius: 5,
            textAlign: 'center',
            minWidth: 150,
            cursor: 'pointer',
        }}>
        <strong>{data.name}</strong>
        <p>Sucursal</p>
        <Handle type="target" position={Position.Left} />
    </div>
);

const ProviderGraph: React.FC = () => {
    const [page, setPage] = useState(1);
    const { providers, totalPages, loading, error } = useGetProviders(page);

    const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

    // Mapeamos nodos y edges
    useEffect(() => {
        if (providers.length === 0) return;

        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        const radius = 300;
        const centerX = 400;
        const centerY = 300;
        const angleStep = (2 * Math.PI) / providers.length;

        providers.forEach((provider, index) => {
            const angle = index * angleStep;
            const providerX = centerX + radius * Math.cos(angle);
            const providerY = centerY + radius * Math.sin(angle);

            newNodes.push({
                id: provider.id,
                type: 'provider',
                position: { x: providerX, y: providerY },
                data: {
                    name: provider.Name,
                    type: 'provider',
                    provider,
                    onDoubleClick: handleNodeDoubleClick,
                },
            });

            provider.branchOffices.forEach((branch, subIndex) => {
                const branchX = providerX + 400;
                const branchY = providerY + (subIndex * 200) - (provider.branchOffices.length * 50) / 2;

                newNodes.push({
                    id: branch.id,
                    type: 'branchOffice',
                    position: { x: branchX, y: branchY },
                    data: {
                        name: branch.Name,
                        type: 'branchOffice',
                        branchOffice: branch,
                        onDoubleClick: handleNodeDoubleClick,
                    },
                });

                newEdges.push({
                    id: `edge-${provider.id}-${branch.id}`,
                    source: provider.id,
                    target: branch.id,
                    label: branch.relationshipType,
                    animated: true,
                    style: { stroke: '#999' },
                });
            });
        });

        setNodes(newNodes);
        setEdges(newEdges);
    }, [providers]);

    const onNodesChange = useCallback((changes: NodeChange[]) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, []);

    const onEdgesChange = useCallback((changes: EdgeChange[]) => {
        setEdges((eds) => applyEdgeChanges(changes, eds));
    }, []);

    const onConnect = useCallback((connection: Connection) => {
        setEdges((eds) => addEdge(connection, eds));
    }, []);

    const handleNodeDoubleClick = (nodeData: NodeData) => {
        setSelectedNode(nodeData);
    };

    const handleCloseDialog = () => {
        setSelectedNode(null);
    };

    const nodeTypes = useMemo(() => ({
        provider: ProviderNode,
        branchOffice: BranchOfficeNode,
    }), []);

    return (
        <div style={{ width: '100%', height: '80vh', backgroundColor: '#F7F9FB' }}>
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </div>
            ) : error ? (
                <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
            ) : (
                <>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                        <Background variant={BackgroundVariant.Dots} />
                        <MiniMap />
                        <Controls />
                    </ReactFlow>

                    <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(_, newPage) => setPage(newPage)}
                        />
                    </div>

                    {/* Dialog con información detallada */}
                    {selectedNode && (
                        <Dialog open={!!selectedNode} onClose={handleCloseDialog}>
                            <DialogTitle>
                                {selectedNode.type === 'provider' ? 'Detalles del Proveedor' : 'Detalles de la Sucursal'}
                            </DialogTitle>
                            <DialogContent dividers>
                                {selectedNode.type === 'provider' ? (
                                    <>
                                        <Typography><strong>ID:</strong> {selectedNode.provider?.ID}</Typography>
                                        <Typography><strong>Nombre:</strong> {selectedNode.provider?.Name}</Typography>
                                        <Typography><strong>Ubicación:</strong> {selectedNode.provider?.Location}</Typography>
                                        <Typography><strong>Sucursales:</strong></Typography>
                                        <List>
                                            {selectedNode.provider?.branchOffices.map(bo => (
                                                <ListItem key={bo.id}>
                                                    <ListItemText primary={`Nombre: ${bo.Name}`} secondary={`ID: ${bo.ID} | Ingresos: Q${bo.Income} | Ubicación: ${bo.Location}`} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </>
                                ) : (
                                    <>
                                        <Typography><strong>ID:</strong> {selectedNode.branchOffice?.ID}</Typography>
                                        <Typography><strong>Nombre:</strong> {selectedNode.branchOffice?.Name}</Typography>
                                        <Typography><strong>Ingresos:</strong> Q{selectedNode.branchOffice?.Income}</Typography>
                                        <Typography><strong>Ubicación:</strong> {selectedNode.branchOffice?.Location}</Typography>
                                    </>
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseDialog} color="primary">Cerrar</Button>
                            </DialogActions>
                        </Dialog>
                    )}
                </>
            )}
        </div>
    );
};

export default ProviderGraph;
