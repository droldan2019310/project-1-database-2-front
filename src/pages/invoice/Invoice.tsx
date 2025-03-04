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
import { useGetInvoices } from '../../hooks/useInvoice';
import { Pagination, CircularProgress, Dialog, DialogTitle, DialogContent, Typography, List, ListItem, ListItemText, DialogActions, Button } from '@mui/material';

// Interfaces
interface Product {
    id: string;
    Name: string;
    Price: number;
    Category: string;
    relationshipType: string;
}

interface Neo4jDate {
    year: { low: number; high: number };
    month: { low: number };
    day: { low: number };
}

interface Invoice {
    id: string;
    Status: string;
    Cashier_main: string;
    Total: number;
    NIT: string;
    ID: number;
    Date: Neo4jDate;
    Notes: string;
    Name: string;
    products: Product[];
    formattedDate?: string;
}

// NodeData
type NodeData = {
    type: 'invoice' | 'product';
    invoice?: Invoice;
    product?: Product;
    onDoubleClick: (nodeData: NodeData) => void;
};

// Helper para formatear fecha
const formatNeo4jDate = (date?: Neo4jDate): string => {
    if (!date || !date.year || !date.month || !date.day) {
        return 'Fecha no disponible';
    }
    const year = date.year.low;
    const month = String(date.month.low).padStart(2, '0');
    const day = String(date.day.low).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Nodos
const InvoiceNode = ({ data }: { data: NodeData }) => (
    <div
        onDoubleClick={() => data.onDoubleClick(data)}
        style={{ 
            padding: 10, 
            backgroundColor: '#f0f8ff', 
            border: '1px solid #66b3ff', 
            borderRadius: 5, 
            textAlign: 'center', 
            cursor: 'pointer',
            minWidth: 150
        }}
    >
        <strong>{data.invoice?.Name}</strong>
        <p>Q{data.invoice?.Total}</p>
        <Handle type="source" position={Position.Right} />
    </div>
);

const ProductNode = ({ data }: { data: NodeData }) => (
    <div
        onDoubleClick={() => data.onDoubleClick(data)}
        style={{ 
            padding: 10, 
            backgroundColor: '#fff0f0', 
            border: '1px solid #ff6f61', 
            borderRadius: 5, 
            textAlign: 'center', 
            cursor: 'pointer',
            minWidth: 150
        }}
    >
        <strong>{data.product?.Name}</strong>
        <p>{data.product?.Category}</p>
        <p>Q{data.product?.Price}</p>
        <Handle type="target" position={Position.Left} />
    </div>
);

// Componente principal
const InvoiceGraph: React.FC = () => {
    const [page, setPage] = useState(1);
    const { invoices, totalPages, loading, error } = useGetInvoices(page);

    const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

    useEffect(() => {
        if (invoices.length === 0) return;

        const newNodes: Node<NodeData>[] = [];
        const newEdges: Edge[] = [];

        const radius = 300;
        const centerX = 400;
        const centerY = 300;
        const angleStep = (2 * Math.PI) / invoices.length;

        invoices.forEach((invoice, index) => {
            const angle = index * angleStep;
            const invoiceX = centerX + radius * Math.cos(angle);
            const invoiceY = centerY + radius * Math.sin(angle);

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

            invoice.products.forEach((product, subIndex) => {
                const productX = invoiceX + 300;
                const productY = invoiceY + (subIndex * 100) - (invoice.products.length * 50) / 2;

                newNodes.push({
                    id: product.id,
                    type: 'product',
                    position: { x: productX, y: productY },
                    data: {
                        type: 'product',
                        product,
                        onDoubleClick: handleNodeDoubleClick,
                    },
                });

                newEdges.push({
                    id: `edge-${invoice.id}-${product.id}`,
                    source: invoice.id,
                    target: product.id,
                    label: product.relationshipType,
                    animated: true,
                    style: { stroke: '#888' },
                });
            });
        });

        setNodes(newNodes);
        setEdges(newEdges);
    }, [invoices]);

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
        invoice: InvoiceNode,
        product: ProductNode,
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

                    {/* Dialog para ver detalles */}
                    <Dialog open={!!selectedNode} onClose={handleCloseDialog}>
                        <DialogTitle>
                            {selectedNode?.type === 'invoice' ? 'Detalles de la Factura' : 'Detalles del Producto'}
                        </DialogTitle>
                        <DialogContent dividers>
                            {selectedNode?.type === 'invoice' && selectedNode.invoice && (
                                <>
                                    <Typography><strong>ID:</strong> {selectedNode.invoice.ID}</Typography>
                                    <Typography><strong>Nombre:</strong> {selectedNode.invoice.Name}</Typography>
                                    <Typography><strong>Total:</strong> Q{selectedNode.invoice.Total}</Typography>
                                    <Typography><strong>Fecha:</strong> {formatNeo4jDate(selectedNode.invoice.Date)}</Typography>
                                    <Typography><strong>Estado:</strong> {selectedNode.invoice.Status}</Typography>
                                </>
                            )}
                            {selectedNode?.type === 'product' && selectedNode.product && (
                                <>
                                    <Typography><strong>Nombre:</strong> {selectedNode.product.Name}</Typography>
                                    <Typography><strong>Categoría:</strong> {selectedNode.product.Category}</Typography>
                                    <Typography><strong>Precio:</strong> Q{selectedNode.product.Price}</Typography>
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

export default InvoiceGraph;
