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
import axiosInstance from '../../hooks/axiosInstance';
import { Pagination, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, TextField, IconButton, Typography, Menu, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import CreateDialogBranch from '../../dialog/CreateDialogBranchOffice';
import CreateDialogProductCloned from '../../dialog/CreateDialogProductInvoice';
import CreateDialogRoute from '../../dialog/CreateDialogRoute';

// Interfaces
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

// NodeData
type NodeData = {
    type: 'route' | 'branchOffice' | 'product';
    route?: Route;
    branchOffice?: BranchOffice;
    product?: Product;
    onDoubleClick: (nodeData: NodeData) => void;
};

// Estilo base para nodos
const nodeStyle = (bgColor: string, borderColor: string): React.CSSProperties => ({
    padding: 10,
    backgroundColor: bgColor,
    border: `1px solid ${borderColor}`,
    borderRadius: 5,
    textAlign: 'center',
    cursor: 'pointer',
    minWidth: 150,
});

// Nodo Ruta
const RouteNode = ({ data }: { data: NodeData }) => (
    <div onDoubleClick={() => data.onDoubleClick(data)} style={nodeStyle('#cce5ff', '#66b3ff')}>
        <strong>{data.route?.Name}</strong>
        <p>{data.route?.Company}</p>
        <Handle type="source" position={Position.Right} />
    </div>
);

// Nodo Sucursal
const BranchOfficeNode = ({ data }: { data: NodeData }) => (
    <div onDoubleClick={() => data.onDoubleClick(data)} style={nodeStyle('#f0f0f0', '#aaa')}>
        <strong>{data.branchOffice?.Name}</strong>
        <p>{data.branchOffice?.Location}</p>
        <Handle type="target" position={Position.Left} />
    </div>
);

// Nodo Producto
const ProductNode = ({ data }: { data: NodeData }) => (
    <div onDoubleClick={() => data.onDoubleClick(data)} style={nodeStyle('#ffefcc', '#ffb347')}>
        <strong>{data.product?.Name}</strong>
        <p>{data.product?.Category}</p>
        <Handle type="target" position={Position.Left} />
    </div>
);

const RouteGraph: React.FC = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

    const fetchRoutes = async (currentPage: number) => {
        setLoading(true);
        setError(null);
        try {
            const url = isSearching
                ? `/route/search/${search}`
                : `/route?page=${currentPage}&limit=5`;

            const response = await axiosInstance.get(url);
            const { routes, totalPages } = response.data;

            setRoutes(routes);
            if (!isSearching) {
                setTotalPages(totalPages);
            } else {
                setTotalPages(1);  // Sin paginación en búsqueda
            }
        } catch (err: any) {
            setError(err.message || 'Error al cargar rutas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutes(page);
    }, [page, isSearching]);

    useEffect(() => {
        const newNodes: Node<NodeData>[] = [];
        const newEdges: Edge[] = [];

        routes.forEach((route, index) => {
            const yBase = index * 200;

            newNodes.push({
                id: route.id,
                type: 'route',
                position: { x: 300, y: yBase },
                data: { type: 'route', route, onDoubleClick: handleNodeDoubleClick },
                draggable: true,
            });

            if (route.branchOffice) {
                const branchOffice = route.branchOffice;
                newNodes.push({
                    id: branchOffice.id,
                    type: 'branchOffice',
                    position: { x: 600, y: yBase },
                    data: { type: 'branchOffice', branchOffice, onDoubleClick: handleNodeDoubleClick },
                    draggable: true,
                });

                newEdges.push({
                    id: `edge-${route.id}-${branchOffice.id}`,
                    source: route.id,
                    target: branchOffice.id,
                    label: branchOffice.relationshipType,
                    animated: true,
                    style: { stroke: '#888' },
                });
            }

            route.products.forEach((product, subIndex) => {
                newNodes.push({
                    id: product.id,
                    type: 'product',
                    position: { x: 900, y: yBase + subIndex * 80 },
                    data: { type: 'product', product, onDoubleClick: handleNodeDoubleClick },
                    draggable: true,
                });

                newEdges.push({
                    id: `edge-${route.id}-${product.id}`,
                    source: route.id,
                    target: product.id,
                    label: product.relationshipType,
                    animated: true,
                    style: { stroke: '#888' },
                });
            });
        });

        setNodes(newNodes);
        setEdges(newEdges);
    }, [routes]);

    const handleNodeDoubleClick = (nodeData: NodeData) => {
        setSelectedNode(nodeData);
    };

    const handleCloseDialog = () => setSelectedNode(null);

    const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
    const onConnect = useCallback((connection: Connection) => setEdges((eds) => addEdge(connection, eds)), []);

    const handleSearch = () => {
        if (isSearching) {
            setSearch('');
            setIsSearching(false);
            fetchRoutes(page);
        } else {
            setIsSearching(true);
            setPage(1);
        }
    };

    const nodeTypes = useMemo(() => ({
        route: RouteNode,
        branchOffice: BranchOfficeNode,
        product: ProductNode,
    }), []);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
            
    const [openCreateDialogBranch, setOpenCreateDialogBranch] = useState(false);
            
    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

        const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleBranchCreated = (newBranch: any) => {
        const newNode: Node = {
            id: newBranch.id,
                type: 'branchOffice',
                position: { x: 300, y: 300 },
                data: { type: 'branchOffice', branchOffice: newBranch, onDoubleClick: handleNodeDoubleClick },
            draggable: true,
        };

        
        
        setNodes((prevNodes) => [...prevNodes, newNode]);
    };

    const [openCreateDialogProduct, setOpenCreateDialogProduct] = useState(false);
    const [openCreateDialogRoute, setOpenCreateDialogRoute] = useState(false);

    const handleProductCreated = (newProduct: any) => {
        const newNode: Node = {
            id: newProduct.id,  // El id que retorna el backend (elementId de Neo4j)
            type: 'product',     // Tipo de nodo es 'product'
            position: { x: 600, y: 300 },  // Ajusta la posición si es necesario
            data: { type: 'product', product: newProduct, onDoubleClick: handleNodeDoubleClick },
            draggable: true,
        };
    
        setNodes((prevNodes) => [...prevNodes, newNode]);
    };

    const handleRouteCreated = (newRoute: any) => {
        const newNode: Node = {
            id: newRoute.id,
            type: 'route',
            position: { x: 300, y: 300 },  // Puedes ajustar la posición inicial
            data: { type: 'route', route: newRoute, onDoubleClick: handleNodeDoubleClick },
            draggable: true,
        };
    
        setNodes((prevNodes) => [...prevNodes, newNode]);
    };
    

    return (
        <div style={{ width: '100%', height: '80vh', backgroundColor: '#F7F9FB' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Buscar por Company"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <IconButton color="primary" onClick={handleSearch}>
                    {isSearching ? <ClearIcon /> : <SearchIcon />}
                </IconButton>
                
                <IconButton color="primary" onClick={handleMenuOpen}>
                    <MoreVertIcon />
                </IconButton>
               
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                       
                           
                    
                    <MenuItem onClick={() => { setOpenCreateDialogBranch(true); handleMenuClose(); }}>
                        <AddIcon fontSize="small" style={{ marginRight: 8 }} />
                        Agregar Branch Office
                    </MenuItem>
                    <MenuItem onClick={() => { setOpenCreateDialogProduct(true); handleMenuClose(); }}>
                        <AddIcon fontSize="small" style={{ marginRight: 8 }} />
                        Agregar Producto
                    </MenuItem>
                    <MenuItem onClick={() => { setOpenCreateDialogRoute(true); handleMenuClose(); }}>
                        <AddIcon fontSize="small" style={{ marginRight: 8 }} />
                        Agregar Routes
                    </MenuItem>

                </Menu>
            </Box>
            

            {loading ? <CircularProgress /> : error ? <Typography color="error">{error}</Typography> : (
                <>
                    <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} fitView>
                        <Background variant={BackgroundVariant.Dots} />
                        <MiniMap />
                        <Controls />
                    </ReactFlow>

                    <CreateDialogBranch
                        open={openCreateDialogBranch}
                        onClose={() => setOpenCreateDialogBranch(false)}
                        onBranchCreated={handleBranchCreated}
                    />

                    <CreateDialogRoute
                        open={openCreateDialogRoute}
                        onClose={() => setOpenCreateDialogRoute(false)}
                        onRouteCreated={handleRouteCreated}
                    />

                    <CreateDialogProductCloned
                        open={openCreateDialogProduct}
                        onClose={() => setOpenCreateDialogProduct(false)}
                        onProductCreated={handleProductCreated}
                    />


                    {!isSearching && <Pagination count={totalPages} page={page} onChange={(_, newPage) => setPage(newPage)} />}

                    <Dialog open={!!selectedNode} onClose={handleCloseDialog}>
                        <DialogContent><pre>{JSON.stringify(selectedNode, null, 2)}</pre></DialogContent>
                        <DialogActions><Button onClick={handleCloseDialog}>Cerrar</Button></DialogActions>
                    </Dialog>
                </>
            )}
        </div>
    );
};

export default RouteGraph;
