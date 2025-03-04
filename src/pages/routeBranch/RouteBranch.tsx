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
import { useGetRoutes } from '../../hooks/useRoute';
import { Pagination, CircularProgress, Dialog, DialogTitle, DialogContent, Typography, DialogActions, Button, Chip } from '@mui/material';

// Interfaces para tipar correctamente
interface BranchOffice {
    id: string;
    Income: string;
    ID: number;
    Name: string;
    Location: string;
    relationshipType: string;
}

interface Product {
    id: string;
    Category: string;
    Price: string;
    Expiration_date: string;
    ID: number;
    Name: string;
    TagsArray: string[];
    relationshipType: string;
}

interface Route {
    id: string;
    Company: string;
    Distance_KM: string;
    ID: number;
    Start_date: string;
    End_date: string;
    Name: string;
    branchOffice: BranchOffice | null;
    products: Product[];
}

// NodeData para manejar doble clic
type NodeData = {
    type: 'route' | 'branchOffice' | 'product';
    route?: Route;
    branchOffice?: BranchOffice;
    product?: Product;
    onDoubleClick: (nodeData: NodeData) => void;
};

// Nodos personalizados
const RouteNode = ({ data }: { data: NodeData }) => (
    <div onDoubleClick={() => data.onDoubleClick(data)}
        style={{ padding: 10, backgroundColor: '#cce5ff', border: '1px solid #66b3ff', borderRadius: 5, cursor: 'pointer', textAlign: 'center' }}>
        <strong>{data.route?.Name}</strong>
        <p>{data.route?.Company}</p>
        <Handle type="source" position={Position.Right} />
    </div>
);

const BranchOfficeNode = ({ data }: { data: NodeData }) => (
    <div onDoubleClick={() => data.onDoubleClick(data)}
        style={{ padding: 10, backgroundColor: '#f0f0f0', border: '1px solid #aaa', borderRadius: 5, cursor: 'pointer', textAlign: 'center' }}>
        <strong>{data.branchOffice?.Name}</strong>
        <p>{data.branchOffice?.Location}</p>
        <Handle type="target" position={Position.Left} />
    </div>
);

const ProductNode = ({ data }: { data: NodeData }) => (
    <div onDoubleClick={() => data.onDoubleClick(data)}
        style={{ padding: 10, backgroundColor: '#ffefcc', border: '1px solid #ffb347', borderRadius: 5, cursor: 'pointer', textAlign: 'center' }}>
        <strong>{data.product?.Name}</strong>
        <p>{data.product?.Category}</p>
        <Handle type="target" position={Position.Left} />
    </div>
);

const RouteGraph: React.FC = () => {
    const [page, setPage] = useState(1);
    const { routes, totalPages, loading, error } = useGetRoutes(page);

    const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

    useEffect(() => {
        if (routes.length === 0) return;

        const newNodes: Node<NodeData>[] = [];
        const newEdges: Edge[] = [];

        const centerX = 400;
        const centerY = 300;
        const angleStep = (2 * Math.PI) / routes.length;
        const radius = 300;

        routes.forEach((route, index) => {
            const angle = index * angleStep;
            const routeX = centerX + radius * Math.cos(angle);
            const routeY = centerY + radius * Math.sin(angle);

            newNodes.push({
                id: route.id,
                type: 'route',
                position: { x: routeX, y: routeY },
                data: { type: 'route', route, onDoubleClick: handleNodeDoubleClick },
            });

            if (route.branchOffice) {
                const branchX = routeX + 300;
                const branchY = routeY - 50;

                newNodes.push({
                    id: route.branchOffice.id,
                    type: 'branchOffice',
                    position: { x: branchX, y: branchY },
                    data: { type: 'branchOffice', branchOffice: route.branchOffice, onDoubleClick: handleNodeDoubleClick },
                });

                newEdges.push({
                    id: `edge-${route.id}-${route.branchOffice.id}`,
                    source: route.id,
                    target: route.branchOffice.id,
                    label: route.branchOffice.relationshipType,
                });
            }

            route.products.forEach((product, idx) => {
                const productX = routeX + 300;
                const productY = routeY + idx * 80;

                newNodes.push({
                    id: product.id,
                    type: 'product',
                    position: { x: productX, y: productY },
                    data: { type: 'product', product, onDoubleClick: handleNodeDoubleClick },
                });

                newEdges.push({
                    id: `edge-${route.id}-${product.id}`,
                    source: route.id,
                    target: product.id,
                    label: product.relationshipType,
                });
            });
        });

        setNodes(newNodes);
        setEdges(newEdges);

    }, [routes]);

    const handleNodeDoubleClick = (nodeData: NodeData) => {
        setSelectedNode(nodeData);
    };

    const onNodesChange = useCallback((changes: NodeChange[]) => setNodes(nds => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges(eds => applyEdgeChanges(changes, eds)), []);
    const onConnect = useCallback((connection: Connection) => setEdges(eds => addEdge(connection, eds)), []);
    const handleCloseDialog = () => setSelectedNode(null);

    const nodeTypes = useMemo(() => ({ route: RouteNode, branchOffice: BranchOfficeNode, product: ProductNode }), []);

    return (
        <div style={{ width: '100%', height: '80vh', backgroundColor: '#F7F9FB' }}>
            {loading ? <CircularProgress /> : error ? <p style={{ color: 'red' }}>{error}</p> : (
                <>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        fitView
                    >
                        <Background variant={BackgroundVariant.Dots} />
                        <MiniMap />
                        <Controls />
                    </ReactFlow>

                    <Pagination count={totalPages} page={page} onChange={(_, newPage) => setPage(newPage)} />

                    {/* Dialog para mostrar detalles */}
                    <Dialog open={!!selectedNode} onClose={handleCloseDialog}>
                        <DialogTitle>
                            {selectedNode?.type === 'route' ? 'Detalles de la Ruta' : selectedNode?.type === 'branchOffice' ? 'Detalles de la Sucursal' : 'Detalles del Producto'}
                        </DialogTitle>
                        <DialogContent dividers>
                            {selectedNode?.type === 'route' && selectedNode.route && (
                                <>
                                    <Typography>Nombre: {selectedNode.route.Name}</Typography>
                                    <Typography>Compañía: {selectedNode.route.Company}</Typography>
                                    <Typography>Distancia: {selectedNode.route.Distance_KM} KM</Typography>
                                </>
                            )}
                            {selectedNode?.type === 'branchOffice' && selectedNode.branchOffice && (
                                <>
                                    <Typography>Nombre: {selectedNode.branchOffice.Name}</Typography>
                                    <Typography>Ubicación: {selectedNode.branchOffice.Location}</Typography>
                                </>
                            )}
                            {selectedNode?.type === 'product' && selectedNode.product && (
                                <>
                                    <Typography>Nombre: {selectedNode.product.Name}</Typography>
                                    <Typography>Categoría: {selectedNode.product.Category}</Typography>
                                    <Typography>Precio: Q{selectedNode.product.Price}</Typography>
                                </>
                            )}
                        </DialogContent>
                        <DialogActions><Button onClick={handleCloseDialog}>Cerrar</Button></DialogActions>
                    </Dialog>
                </>
            )}
        </div>
    );
};

export default RouteGraph;
