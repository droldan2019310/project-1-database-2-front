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
import { useGetBranchOffices } from '../../hooks/useBranchOffice';
import { Pagination, CircularProgress, Dialog, DialogTitle, DialogContent, Typography, List, ListItem, ListItemText, DialogActions, Button } from '@mui/material';

// Interfaces
interface Invoice {
    id: string;
    Status: string;
    Cashier_main: string;
    Total: string;
    NIT: string;
    ID: number;
    Date: string;
    Notes: string;
    Name: string;
    relationshipType: string;
}

interface BranchOffice {
    id: string;
    Income: string;
    ID: number;
    Name: string;
    Location: string;
    invoices: Invoice[];
}

// Node Data Type
type NodeData = {
    type: 'branchOffice' | 'invoice';
    branchOffice?: BranchOffice;
    invoice?: Invoice;
    onDoubleClick: (nodeData: NodeData) => void;
};

// Componentes de nodos
const BranchOfficeNode = ({ data }: { data: NodeData }) => (
    <div
        onDoubleClick={() => data.onDoubleClick(data)}
        style={{ 
            padding: 10, 
            backgroundColor: '#cce5ff', 
            border: '1px solid #66b3ff', 
            borderRadius: 5, 
            textAlign: 'center', 
            cursor: 'pointer',
            minWidth: 150
        }}
    >
        <strong>{data.branchOffice?.Name}</strong>
        <p>{data.branchOffice?.Location}</p>
        <Handle type="source" position={Position.Right} />
    </div>
);

const InvoiceNode = ({ data }: { data: NodeData }) => (
    <div
        onDoubleClick={() => data.onDoubleClick(data)}
        style={{ 
            padding: 10, 
            backgroundColor: '#f0f0f0', 
            border: '1px solid #ccc', 
            borderRadius: 5, 
            textAlign: 'center', 
            cursor: 'pointer',
            minWidth: 150
        }}
    >
        <strong>{data.invoice?.Name}</strong>
        <p>Q{data.invoice?.Total}</p>
        <Handle type="target" position={Position.Left} />
    </div>
);

// Componente principal
const BranchOfficeGraph: React.FC = () => {
    const [page, setPage] = useState(1);
    const { branchOffices, totalPages, loading, error } = useGetBranchOffices(page);

    const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

    useEffect(() => {
        if (branchOffices.length === 0) return;

        const newNodes: Node<NodeData>[] = [];
        const newEdges: Edge[] = [];

        const radius = 300;
        const centerX = 400;
        const centerY = 300;
        const angleStep = (2 * Math.PI) / branchOffices.length;

        branchOffices.forEach((branch, index) => {
            const angle = index * angleStep;
            const branchX = centerX + radius * Math.cos(angle);
            const branchY = centerY + radius * Math.sin(angle);

            newNodes.push({
                id: branch.id,
                type: 'branchOffice',
                position: { x: branchX, y: branchY },
                data: {
                    type: 'branchOffice',
                    branchOffice: branch,
                    onDoubleClick: handleNodeDoubleClick,
                },
            });

            branch.invoices.forEach((invoice, subIndex) => {
                const invoiceX = branchX + 300;
                const invoiceY = branchY + (subIndex * 100) - (branch.invoices.length * 50) / 2;

                newNodes.push({
                    id: invoice.id,
                    type: 'invoice',
                    position: { x: invoiceX, y: invoiceY },
                    data: {
                        type: 'invoice',
                        invoice,
                        onDoubleClick: handleNodeDoubleClick,
                    },
                });

                newEdges.push({
                    id: `edge-${branch.id}-${invoice.id}`,
                    source: branch.id,
                    target: invoice.id,
                    label: invoice.relationshipType,
                    animated: true,
                    style: { stroke: '#888' },
                });
            });
        });

        setNodes(newNodes);
        setEdges(newEdges);

    }, [branchOffices]);

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
        branchOffice: BranchOfficeNode,
        invoice: InvoiceNode,
    }), []);

    return (
        <div style={{ width: '100%', height: '80vh', backgroundColor: '#F7F9FB' }}>
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </div>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
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

                    <Pagination count={totalPages} page={page} onChange={(_, newPage) => setPage(newPage)} />

                    <Dialog open={!!selectedNode} onClose={handleCloseDialog}>
                        <DialogTitle>
                            {selectedNode?.type === 'branchOffice' ? 'Detalles de la Sucursal' : 'Detalles de la Factura'}
                        </DialogTitle>
                        <DialogContent dividers>
                            {selectedNode?.type === 'branchOffice' && selectedNode.branchOffice && (
                                <>
                                    <Typography><strong>ID:</strong> {selectedNode.branchOffice.ID}</Typography>
                                    <Typography><strong>Nombre:</strong> {selectedNode.branchOffice.Name}</Typography>
                                    <Typography><strong>Ubicación:</strong> {selectedNode.branchOffice.Location}</Typography>
                                    <Typography><strong>Ingresos:</strong> Q{selectedNode.branchOffice.Income}</Typography>
                                </>
                            )}
                            {selectedNode?.type === 'invoice' && selectedNode.invoice && (
                                <>
                                    <Typography><strong>ID:</strong> {selectedNode.invoice.ID}</Typography>
                                    <Typography><strong>Nombre:</strong> {selectedNode.invoice.Name}</Typography>
                                    <Typography><strong>NIT:</strong> {selectedNode.invoice.NIT}</Typography>
                                    <Typography><strong>Total:</strong> Q{selectedNode.invoice.Total}</Typography>
                                    <Typography><strong>Estado:</strong> {selectedNode.invoice.Status}</Typography>
                                    <Typography><strong>Fecha:</strong> {selectedNode.invoice.Date}</Typography>
                                    <Typography><strong>Notas:</strong> {selectedNode.invoice.Notes}</Typography>
                                </>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDialog}>Cerrar</Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </div>
    );
};

export default BranchOfficeGraph;
