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
import { Pagination, CircularProgress, Dialog, DialogTitle, DialogContent, Typography, DialogActions, Button, Box, TextField, IconButton, Menu, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import axiosInstance from '../../hooks/axiosInstance';
import AddIcon from '@mui/icons-material/Add';
import CreateDialogProduct from '../../dialog/CreateDialogProduct';
import CreateDialogInvoice from '../../dialog/CreateDialogInvoice';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CreateDialogProductCloned from '../../dialog/CreateDialogProductInvoice';
import { toast } from 'react-toastify';
import CreateRelationshipInvoice from '../../dialog/CreateRelationshipInvoice';

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
    if (!date) return 'Fecha no disponible';
    return `${date.year.low}-${String(date.month.low).padStart(2, '0')}-${String(date.day.low).padStart(2, '0')}`;
};

// Nodo de Factura
const InvoiceNode = ({ data }: { data: NodeData }) => (
    <div onDoubleClick={() => data.onDoubleClick(data)} style={nodeStyle('#f0f8ff', '#66b3ff')}>
        <strong>{data.invoice?.Name}</strong>
        <p>Q{data.invoice?.Total}</p>
        <Handle type="source" position={Position.Right} />
    </div>
);

// Nodo de Producto
const ProductNode = ({ data }: { data: NodeData }) => (
    <div onDoubleClick={() => data.onDoubleClick(data)} style={nodeStyle('#fff0f0', '#ff6f61')}>
        <strong>{data.product?.Name}</strong>
        <p>{data.product?.Category}</p>
        <p>Q{data.product?.Price}</p>
        <Handle type="target" position={Position.Left} />
    </div>
);

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

const InvoiceGraph: React.FC = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

    const fetchInvoices = async (currentPage: number) => {
        setLoading(true);
        setError(null);
        try {
            const url = isSearching 
                ? `/invoices/search/${search}?page=${currentPage}&limit=5` 
                : `/invoices?page=${currentPage}&limit=5`;

            const response = await axiosInstance.get(url);
            const { invoices, totalPages } = response.data;

            invoices.forEach((inv: Invoice) => {
                inv.formattedDate = formatNeo4jDate(inv.Date);
            });

            setInvoices(invoices);
            setTotalPages(totalPages);
        } catch (err: any) {
            setError(err.message || 'Error al cargar facturas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices(page);
    }, [page, isSearching]);

    useEffect(() => {
        const newNodes: Node<NodeData>[] = [];
        const newEdges: Edge[] = [];

        invoices.forEach((invoice, index) => {
            const yBase = index * 200;

            newNodes.push({
                id: invoice.id,
                type: 'invoice',
                position: { x: 300, y: yBase },
                data: { type: 'invoice', invoice, onDoubleClick: handleNodeDoubleClick },
                draggable: true,
            });

            invoice.products.forEach((product, subIndex) => {
                const productId = product.id;
                newNodes.push({
                    id: productId,
                    type: 'product',
                    position: { x: 600, y: yBase + subIndex * 80 },
                    data: { type: 'product', product, onDoubleClick: handleNodeDoubleClick },
                    draggable: true,
                });

                newEdges.push({
                    id: `edge-${invoice.id}-${productId}`,
                    source: invoice.id,
                    target: productId,
                    label: product.relationshipType,
                    animated: true,
                    style: { stroke: '#888' },
                });
            });
        });

        setNodes(newNodes);
        setEdges(newEdges);
    }, [invoices]);

    const handleNodeDoubleClick = (nodeData: NodeData) => {
        setSelectedNode(nodeData);
    };

    const handleCloseDialog = () => setSelectedNode(null);

    const onNodesChange = useCallback((changes: NodeChange[]) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, []);

    const onEdgesChange = useCallback((changes: EdgeChange[]) => {
        setEdges((eds) => applyEdgeChanges(changes, eds));
    }, []);

    const onConnect = useCallback((connection: Connection) => {
        setEdges((eds) => addEdge(connection, eds));
    }, []);

    const handleSearch = () => {
        if (isSearching) {
            setSearch('');
            setIsSearching(false);
            fetchInvoices(page);
        } else {
            setIsSearching(true);
            setPage(1);
        }
    };

    const nodeTypes = useMemo(() => ({
        invoice: InvoiceNode,
        product: ProductNode,
    }), []);


    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
        
        
    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

        const handleMenuClose = () => {
        setAnchorEl(null);
    };
    const [openCreateDialogInvoice, setOpenCreateDialogInvoice] = useState(false);
    const [openCreateDialogProduct, setOpenCreateDialogProduct] = useState(false);

    const handleInvoiceCreated = (newInvoice: any) => {
        const newNode: Node = {
            id: newInvoice.id,  // Aquí usamos el `id` que retorna el backend (elementId de Neo4j)
            type: 'invoice',
            position: { x: 600, y: 300 },  // Puedes ajustar esta posición si es necesario
            data: { type: 'invoice', invoice: newInvoice, onDoubleClick: handleNodeDoubleClick },
            draggable: true,
        };
    
        setNodes((prevNodes) => [...prevNodes, newNode]);
    };


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


    const handleCreateRelation = async (
        sourceId: string,   // Invoice ID
        targetId: string,   // Product ID
        fields: Record<string, any>  // { quantity, discount, price, sub_total }
    ) => {
        const payload = {
            sourceId,
            targetId,
            ...fields
        };
    
        try {
            console.log('Creando relación (Invoice → Product) con payload:', payload);
    
            await axiosInstance.post('invoices/relationship', payload);
    
            toast.success('Relación creada exitosamente');
    
            setEdges((prevEdges) => [
                ...prevEdges,
                {
                    id: `${sourceId}-${targetId}`,
                    source: sourceId,
                    target: targetId,
                    label: `CONTAINS`, // Nombre fijo de la relación
                    animated: true,
                    style: { stroke: '#888' },
                }
            ]);
        } catch (error: any) {
            console.error('Error al crear relación (Invoice → Product):', error);
            toast.error(`Error: ${error.response?.data?.message || error.message}`);
        }
    };

    const [openCreateDialogRelationship, setOpenCreateDialogRelationship] = useState(false);

    
    
    return (
        <div style={{ width: '100%', height: '80vh', backgroundColor: '#F7F9FB' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Buscar por Cashier Main"
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
                       
                           
                    
                    <MenuItem onClick={() => { setOpenCreateDialogInvoice(true); handleMenuClose(); }}>
                        <AddIcon fontSize="small" style={{ marginRight: 8 }} />
                        Agregar Invoice
                    </MenuItem>

                    <MenuItem onClick={() => { setOpenCreateDialogProduct(true); handleMenuClose(); }}>
                        <AddIcon fontSize="small" style={{ marginRight: 8 }} />
                        Agregar Producto
                    </MenuItem>

                    <MenuItem onClick={() => { setOpenCreateDialogRelationship(true); handleMenuClose(); }}>
                        <AddIcon fontSize="small" style={{ marginRight: 8 }} />
                        Agregar Relacion
                    </MenuItem>
                </Menu>
            </Box>

            {loading ? (
                <CircularProgress />
            ) : error ? (
                <Typography color="error">{error}</Typography>
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
                   
                    
                    <CreateDialogProductCloned
                        open={openCreateDialogProduct}
                        onClose={() => setOpenCreateDialogProduct(false)}
                        onProductCreated={handleProductCreated}
                    />

                    <CreateRelationshipInvoice
                        open={openCreateDialogRelationship}
                        onClose={() => setOpenCreateDialogRelationship(false)}
                        onCreate={handleCreateRelation}
                    />


                    <CreateDialogInvoice
                        open={openCreateDialogInvoice}
                        onClose={() => setOpenCreateDialogInvoice(false)}
                        onInvoiceCreated={handleInvoiceCreated}
                    />

                    <Dialog open={!!selectedNode} onClose={handleCloseDialog}>
                        <DialogTitle>Detalles</DialogTitle>
                        <DialogContent>
                            <pre>{JSON.stringify(selectedNode, null, 2)}</pre>
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
