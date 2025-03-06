import React, { useEffect, useState, useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
    BackgroundVariant,
    useNodesState,
    useEdgesState,
    Handle,
    Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import axiosInstance from '../../hooks/axiosInstance';
import { Pagination, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, TextField, Menu, MenuItem, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import CreateDialogBranch from '../../dialog/CreateDialogBranchOffice';
import CreateDialogInvoice from '../../dialog/CreateDialogInvoice';
import CreateDialogBuyOrder from '../../dialog/CreateDialogBuyOrder';
import CreateRelationshipBranch from '../../dialog/CreateRelationshipBranch';
import { useGetBranchOffices } from '../../hooks/useBranchOffice';
import { toast } from 'react-toastify';

// Interfaces
interface Invoice {
    id: string;
    Status: string;
    Cashier_main: string;
    Total: number;
    NIT: string;
    Date: string;
    Notes: string;
    Name: string;
    relationshipType: string;
}

interface BuyOrder {
    id: string;
    Status: string;
    Total: number;
    Items: string[];
    Date: string;
    Voided: boolean;
    relationshipType: string;
}

interface BranchOffice {
    id: string;
    Income: number;
    Name: string;
    Location: string;
    invoices: Invoice[];
    buyOrders: BuyOrder[];
}

// Node Data Type
type NodeData = {
    type: 'branchOffice' | 'invoice' | 'buyOrder';
    branchOffice?: BranchOffice;
    invoice?: Invoice;
    buyOrder?: BuyOrder;
    onDoubleClick: (type: string, item: any) => void;
};

const parseNeo4jDate = (date: { year: { low: number }; month: { low: number }; day: { low: number } }) => {
    return `${date.year.low}-${String(date.month.low).padStart(2, '0')}-${String(date.day.low).padStart(2, '0')}`;
};

// Nodo de Sucursal (BranchOffice)
const BranchOfficeNode = ({ data }: { data: NodeData }) => (
    <div style={nodeStyle('#cce5ff', '#66b3ff')} onDoubleClick={() => data.onDoubleClick('branchOffice', data.branchOffice)}>
        <strong>{data.branchOffice?.Name}</strong>
        <p>{data.branchOffice?.Location}</p>
        <Handle type="source" position={Position.Right} id="source" />
        <Handle type="target" position={Position.Left} id="target" />
    </div>
);

// Nodo de Factura (Invoice)
const InvoiceNode = ({ data }: { data: NodeData }) => (
    <div style={nodeStyle('#f0f0f0', '#ccc')} onDoubleClick={() => data.onDoubleClick('invoice', data.invoice)}>
        <strong>{data.invoice?.Name}</strong>
        <p>Q{data.invoice?.Total}</p>
        <Handle type="target" position={Position.Left} id="target" />
    </div>
);

// Nodo de Orden de Compra (BuyOrder)
const BuyOrderNode = ({ data }: { data: NodeData }) => (
    <div style={nodeStyle('#e0ffe0', '#66cc66')} onDoubleClick={() => data.onDoubleClick('buyOrder', data.buyOrder)}>
        <strong>Orden de Compra</strong>
        <p>{data.buyOrder?.Status}</p>
        <Handle type="target" position={Position.Left} id="target" />
    </div>
);



const nodeStyle = (bgColor: string, borderColor: string): React.CSSProperties => ({
    padding: 10,
    backgroundColor: bgColor,
    border: `1px solid ${borderColor}`,
    borderRadius: 5,
    textAlign: 'center',
    cursor: 'pointer',
    minWidth: 150,
});

const BranchOfficeGraph: React.FC = () => {
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const handleNodeDoubleClick = (type: string, item: any) => {
        setSelectedType(type);
        setSelectedItem(item);
    };

    const handleCloseDialog = () => {
        setSelectedType(null);
        setSelectedItem(null);
    };

    const nodeTypes = useMemo(() => ({
        branchOffice: BranchOfficeNode,
        invoice: InvoiceNode,
        buyOrder: BuyOrderNode,
    }), []);

    const fetchBranchOffices = async (currentPage: number) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/branchOffice?page=${currentPage}&limit=5`);
            const { branchOffices: rawBranchOffices, totalPages } = response.data;

            const branchOffices = rawBranchOffices.map((branch: any) => ({
                ...branch,
                invoices: branch.invoices.map((invoice: any) => ({
                    ...invoice,
                    Total: parseFloat(invoice.Total),
                    Date: parseNeo4jDate(invoice.Date),
                })),
                buyOrders: branch.buyOrders.map((order: any) => ({
                    ...order,
                    Total: parseFloat(order.Total),
                    Date: parseNeo4jDate(order.Date),
                })),
            }));

            setGraph(branchOffices);
            setTotalPages(totalPages);
        } finally {
            setLoading(false);
        }
    };

    const setGraph = (branchOffices: BranchOffice[]) => {
        const newNodes: Node<NodeData>[] = [];
        const newEdges: Edge[] = [];

        branchOffices.forEach((branch, index) => {
            const yBase = index * 250;

            newNodes.push({
                id: branch.id,
                type: 'branchOffice',
                position: { x: 300, y: yBase },
                data: { type: 'branchOffice', branchOffice: branch, onDoubleClick: handleNodeDoubleClick },
                draggable: true,
            });

            branch.invoices.forEach((invoice, subIndex) => {
                const invoiceId = invoice.id;
                newNodes.push({
                    id: invoiceId,
                    type: 'invoice',
                    position: { x: 600, y: yBase + subIndex * 100 },
                    data: { type: 'invoice', invoice, onDoubleClick: handleNodeDoubleClick },
                    draggable: true,
                });

                newEdges.push({
                    id: `edge-${branch.id}-${invoiceId}`,
                    source: branch.id,
                    target: invoiceId,
                    label: invoice.relationshipType,
                    animated: true,
                });
            });

            branch.buyOrders.forEach((order, subIndex) => {
                const orderId = order.id;
                newNodes.push({
                    id: orderId,
                    type: 'buyOrder',
                    position: { x: 0, y: yBase + subIndex * 100 },
                    data: { type: 'buyOrder', buyOrder: order, onDoubleClick: handleNodeDoubleClick },
                    draggable: true,
                });

                newEdges.push({
                    id: `edge-${branch.id}-${orderId}`,
                    source: branch.id,
                    target: orderId,
                    label: order.relationshipType,
                    animated: true,
                });
            });
        });

        setNodes(newNodes);
        setEdges(newEdges);
    };

    useEffect(() => {
        fetchBranchOffices(page);
    }, [page]);


    const [search, setSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = () => {
        if (isSearching) {
            setSearch('');
            setIsSearching(false);
            fetchBranchOffices(page);
        } else {
            //fetchProvidersByName(search);
        }
    };

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    
    
    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

        const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const [openCreateDialogBranch, setOpenCreateDialogBranch] = useState(false);
    const [openCreateDialogInvoice, setOpenCreateDialogInvoice] = useState(false);
    
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
    
    const [openBuyOrderDialog, setOpenBuyOrderDialog] = useState(false);

    const handleBuyOrderCreated = (newBuyOrder: any) => {
        const newNode: Node = {
            id: newBuyOrder.id,  // Aquí usamos el `id` que retorna el backend (elementId de Neo4j)
            type: 'buyOrder',
            position: { x: 0, y: 300 },  // Puedes ajustar esta posición según lo que necesites
            data: { type: 'buyOrder', buyOrder: newBuyOrder, onDoubleClick: handleNodeDoubleClick },
            draggable: true,
        };
    
        setNodes((prevNodes) => [...prevNodes, newNode]);
    };

    const [relationDialogBranchOpen, setRelationDialogBranchOpen] = useState(false);


    const handleCreateBranchRelationship = async (
        sourceId: string,
        targetId: string,
        targetType: 'invoice' | 'buyOrder',
        fields: Record<string, any>
    ) => {
        const payload = {
            sourceId,
            targetId,
            targetType,
            ...fields
        };
    
        try {
            console.log('Creando relación (BranchOffice) con payload:', payload);
    
            await axiosInstance.post('/branchOffice/relationship', payload);
    
            toast.success('Relación creada exitosamente');
    
            setEdges((prevEdges) => [
                ...prevEdges,
                {
                    id: `${sourceId}-${targetId}`,
                    source: sourceId,
                    target: targetId,
                    label: targetType === 'invoice' ? 'EMITS' : 'CREATES_A',
                    animated: true,
                    style: { stroke: '#888' }
                }
            ]);
        } catch (error: any) {
            console.error('Error al crear relación (BranchOffice):', error);
            toast.error(`Error: ${error.response?.data?.message || error.message}`);
        }
    };
    
    
    

    return (
        <div style={{ width: '100%', height: '80vh', backgroundColor: '#F7F9FB' }}>
            {loading ? (
                <CircularProgress />
            ) : (
                <>

                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Buscar sucursal..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        />
                        
                        <IconButton color="primary" onClick={handleSearch}>
                        {isSearching ? (
                            <ClearIcon />
                        ) : (
                            <SearchIcon />
                        )}
                        </IconButton>


                        <IconButton color="primary" onClick={handleMenuOpen}>
                        <MoreVertIcon />
                        </IconButton>

                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                       
                           
                            <MenuItem onClick={() => { setOpenCreateDialogBranch(true); handleMenuClose(); }}>
                                <AddIcon fontSize="small" style={{ marginRight: 8 }} />
                                Agregar Branch Office
                            </MenuItem>
                            <MenuItem onClick={() => { setOpenCreateDialogInvoice(true); handleMenuClose(); }}>
                                <AddIcon fontSize="small" style={{ marginRight: 8 }} />
                                Agregar Invoice
                            </MenuItem>

                            <MenuItem onClick={() => { setOpenBuyOrderDialog(true); handleMenuClose(); }}>
                                <AddIcon fontSize="small" style={{ marginRight: 8 }} />
                                Agregar buy order
                            </MenuItem>

                            <MenuItem onClick={() => { setRelationDialogBranchOpen(true); handleMenuClose(); }}>
                                <AddIcon fontSize="small" style={{ marginRight: 8 }} />
                                Agregar Relación
                            </MenuItem>
                        </Menu>
                    </Box>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                        <Background variant={BackgroundVariant.Dots} />
                        <MiniMap />
                        <Controls />
                    </ReactFlow>

                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, newPage) => setPage(newPage)}
                    />

                    <CreateDialogBranch
                        open={openCreateDialogBranch}
                        onClose={() => setOpenCreateDialogBranch(false)}
                        onBranchCreated={handleBranchCreated}
                    />

                    <CreateDialogInvoice
                        open={openCreateDialogInvoice}
                        onClose={() => setOpenCreateDialogInvoice(false)}
                        onInvoiceCreated={handleInvoiceCreated}
                    />
                    <CreateDialogBuyOrder
                        open={openBuyOrderDialog}
                        onClose={() => setOpenBuyOrderDialog(false)}
                        onBuyOrderCreated={handleBuyOrderCreated}
                    />

                    <CreateRelationshipBranch
                        open={relationDialogBranchOpen}
                        onClose={() => setRelationDialogBranchOpen(false)}
                        onCreate={handleCreateBranchRelationship}
                    />



                    <Dialog open={!!selectedType} onClose={handleCloseDialog}>
                        <DialogTitle>Detalles de {selectedType}</DialogTitle>
                        <DialogContent>
                            <pre>{JSON.stringify(selectedItem, null, 2)}</pre>
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
