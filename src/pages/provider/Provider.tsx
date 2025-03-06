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
import { Pagination, CircularProgress, Dialog, DialogTitle, DialogContent, Typography, List, ListItem, ListItemText, DialogActions, Button, Box, TextField, IconButton, Menu, MenuItem } from '@mui/material';
import CreateDialogProvider from '../../dialog/CreateDialogProvider';
import CreateDialogBranch from '../../dialog/CreateDialogBranchOffice';
import { toast } from 'react-toastify';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import axiosInstance from '../../hooks/axiosInstance';
import CreateDialogRoute from '../../dialog/CreateDialogRoute';
import CreateRelationshipProvider from '../../dialog/CreateRelationshipProvider';

// Interfaces
type NodeType = 'product' | 'provider' | 'branchOffice' | 'route';

interface BranchOffice {
    id: string;
    Name: string;
    Location: string;
}
interface Route {
    id: string;
    Name: string;
    Distance_KM: string;
    relationshipType: string;
    Start_date: string;
    End_date: string;
    Voided: boolean;
    Company: string;
    ID: number;
}

interface BuyOrder {
    id: string;
    ID: number;
    Date: string;
    Total: string;
    Status: string;
    Items: string[];
    Voided: boolean;
}

interface Provider {
    id: string;
    ID: number;
    Name: string;
    Location: string;
    Voided: boolean;
    branchOffices: BranchOffice[];
    routes: Route[];
    buyOrders: BuyOrder[];
}

type NodeData = {
    name: string;
    type: 'provider' | 'branchOffice' | 'route' | 'buyOrder';
    provider?: Provider;
    branchOffice?: BranchOffice;
    route?: Route;
    buyOrder?: BuyOrder;
    onDoubleClick: (nodeData: NodeData) => void;
};

// Nodo de Proveedor
const ProviderNode = ({ data }: { data: { provider: any; onDoubleClick: (type: string, item: any) => void } }) => (
  <div onDoubleClick={() => data.onDoubleClick('provider', data.provider)} style={nodeStyle('#ffcccb', '#ff6f61')}>
    <strong>{data.provider.Name}</strong>
    <p>{data.provider.Location}</p>
    <p>Proveedor</p>
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
  </div>
);

// Nodo de Sucursal
const BranchOfficeNode = ({ data }: { data: { branch: any; onDoubleClick: (type: string, item: any) => void } }) => (
  <div onDoubleClick={() => data.onDoubleClick('branch', data.branch)} style={nodeStyle('#cce5ff', '#66b3ff')}>
    <strong>{data.branch.Name}</strong>
    <p>{data.branch.Location}</p>
    <p>Sucursal</p>
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
  </div>
);


const RouteNode  = ({ data }: { data: { route: any; onDoubleClick: (type: string, item: any) => void } }) => (
    <div onDoubleClick={() => data.onDoubleClick('route', data.route)} style={nodeStyle('#e6ffe6', '#66cc66')}>
        <strong>{data.route.Name}</strong>
        <p><strong>Empresa:</strong> {data.route.Company}</p>
        <p><strong>Distancia:</strong> {data.route.Distance_KM} km</p>
        <p><strong>Estado:</strong> {data.route.Voided ? 'Anulada' : 'Activa'}</p>
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
    </div>
);


// Nodo de Orden de Compra
const BuyOrderNode = ({ data }: { data: NodeData }) => (
    <div onDoubleClick={() => data.onDoubleClick(data)} style={nodeStyle('#fff3cd', '#ffcc00')}>
        <strong>Orden {data.buyOrder?.ID}</strong>
        <p>Compra</p>
        <Handle type="target" position={Position.Left} />
    </div>
);

const nodeStyle = (bgColor: string, borderColor: string) => ({
    padding: 10,
    backgroundColor: bgColor,
    border: `1px solid ${borderColor}`,
    borderRadius: 5,
    textAlign: 'center' as const,
    minWidth: 150,
    cursor: 'pointer',
});

const ProviderGraph: React.FC = () => {
    const [page, setPage] = useState(1);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
    const [relationDialogOpen, setRelationDialogOpen] = useState(false);


    const handleNodesChange = useCallback((changes: NodeChange[]) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, []);
    
    const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
        setEdges((eds) => applyEdgeChanges(changes, eds));
    }, []);




    const nodeTypes = useMemo(() => ({
        provider: ProviderNode,
        branchOffice: BranchOfficeNode,
        route: RouteNode,
        buyOrder: BuyOrderNode,
    }), []);

    const [search, setSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = () => {
        if (isSearching) {
          setSearch('');
          setIsSearching(false);
          fetchProviders(page);
        } else {
          fetchProvidersByName(search);
        }
    };

    const fetchProvidersByName = async (name: string) => {
        setLoading(true);
        setError(null);
    
        try {
          const response = await axiosInstance.get(`/providers/search/${name}`);
          setProviderData(response.data.providers, 1);
          setIsSearching(true);
        } catch (err: any) {
          setError(err.message || 'Producto no encontrado');
        } finally {
          setLoading(false);
        }
    };

    const setProviderData = (rawProvider: any[], pages: number) => {
        console.log(rawProvider)
        const formattedProviders = rawProvider.map((provider:any) => ({
            id: provider.id,
            ID: provider.ID,
            Name: provider.Name,
            Location: provider.Location,
            Voided: provider.Voided,
            branchOffices: provider.branchOffices.map((bo:any) => ({
                id: bo.id,
                Name: bo.Name,
                relationshipType: bo.relationshipType,
                ID: bo.ID,
                Location: bo.Location,
                Voided: bo.Voided,
                Income: bo.Income
            })),
            routes: provider.routes.map((route:any) => ({
                id: route.id,
                Name: route.Name,
                Distance_KM: route.Distance_KM,
                relationshipType: route.relationshipType,
                Start_date: route.Start_date,
                End_date: route.End_date,
                Voided: route.Voided,
                Company: route.Company,
                ID: route.ID
            })),
            buyOrders: provider.buyOrders.map((order:any) => ({
                id: order.id,
                ID: order.ID,
                Date: order.Date,
                Total: order.Total,
                Status: order.Status,
                Items: order.Items,
                Voided: order.Voided
            }))
        }));

        setProviders(formattedProviders);
        setTotalPages(pages);
    };


    const fetchProviders = async (currentPage: number) => {
        setLoading(true);
        setError(null);
    
        try {
            const response = await axiosInstance.get(`/providers?page=${currentPage}&limit=5`);
            const formattedProviders = response.data.providers.map((provider:any) => ({
                id: provider.id,
                ID: provider.ID,
                Name: provider.Name,
                Location: provider.Location,
                Voided: provider.Voided,
                branchOffices: provider.branchOffices.map((bo:any) => ({
                    id: bo.id,
                    Name: bo.Name,
                    relationshipType: bo.relationshipType,
                    ID: bo.ID,
                    Location: bo.Location,
                    Voided: bo.Voided,
                    Income: bo.Income
                })),
                routes: provider.routes.map((route:any) => ({
                    id: route.id,
                    Name: route.Name,
                    Distance_KM: route.Distance_KM,
                    relationshipType: route.relationshipType,
                    Start_date: route.Start_date,
                    End_date: route.End_date,
                    Voided: route.Voided,
                    Company: route.Company,
                    ID: route.ID
                })),
                buyOrders: provider.buyOrders.map((order:any) => ({
                    id: order.id,
                    ID: order.ID,
                    Date: order.Date,
                    Total: order.Total,
                    Status: order.Status,
                    Items: order.Items,
                    Voided: order.Voided
                }))
            }));

            setProviders(formattedProviders);
            setTotalPages(response.data.totalPages);
        } catch (err: any) {
          setError(err.message || 'Error al obtener productos');
        } finally {
          setLoading(false);
        }
    };

     useEffect(() => {
        fetchProviders(page);
      }, [page]);
    
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);


    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    
      const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const [openCreateDialogProvider, setOpenCreateDialogProvider] = useState(false);
    const [openCreateDialogBranch, setOpenCreateDialogBranch] = useState(false);


    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<Route | Provider | BranchOffice | null>(null);

    const handleOpenDialog = (type: string, item: any) => {
        setSelectedType(type);
        setSelectedItem(item);
    };

    const handleCloseDialog = () => {
    setSelectedType(null);
    setSelectedItem(null);
    };

    const handleProviderCreated = (newProvider: any) => {
        const newNode: Node = {
            id: newProvider.id,
            type: 'provider',
            position: { x: 100, y:  150 },  // Ajusta posición según lo que necesites
            data: {
                name: newProvider.Name,
                type: 'provider',
                provider: newProvider,
                onDoubleClick: handleOpenDialog
            },
        };
    
        
    
        setNodes((prevNodes) => [...prevNodes, newNode]); 
    };

    const handleBranchCreated = (newBranch: BranchOffice) => {
        const newNode: Node = {
            id: newBranch.id,
            type: 'branchOffice',
            position: { x: 400, y: 150 },
            data: {
                branch: newBranch, // 👈 Aquí envías 'branch' en vez de 'branchOffice'
                onDoubleClick: handleOpenDialog
            },
        };
    
        setNodes((prevNodes) => [...prevNodes, newNode]);
    };

    useEffect(() => {
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];
    
        providers.forEach((provider, index) => {
            // Nodo principal del proveedor
            newNodes.push({
                id: provider.id,
                type: 'provider',
                position: { x: 200, y: index * 150 },
                data: { provider, onDoubleClick: handleOpenDialog },
            });
    
            // Nodos de sucursales relacionadas (branchOffices)
            provider.branchOffices.forEach((branch, bIndex) => {
              
                newNodes.push({
                    id: branch.id,
                    type: 'branchOffice', // Este es de tipo 'branchOffice'
                    position: { x: 0, y: index * 150 + bIndex * 50 }, // Espaciado
                    data: { branch, onDoubleClick: handleOpenDialog },
                });
    
                newEdges.push({
                    id: `${branch.id}-${provider.id}`,
                    source: branch.id,
                    target: provider.id,
                    label:  'Provides',
                });
            });
    
            // (Opcional) Si luego quieres agregar nodos para rutas o buyOrders, puedes extenderlo así:
            provider.routes.forEach((route, rIndex) => {
                const routeNodeId = `${provider.id}-route-${rIndex}`;
                newNodes.push({
                    id: routeNodeId,
                    type: 'route',
                    position: { x: 400, y: index * 150 + rIndex * 50 },
                    data: { route, onDoubleClick: handleOpenDialog },
                });
    
                newEdges.push({
                    id: `${provider.id}-${routeNodeId}`,
                    source: provider.id,
                    target: routeNodeId,
                    label: route.relationshipType || 'Uses',
                });
            });
    
            // buyOrders (si lo quisieras mostrar también, aunque no es estrictamente necesario aquí)
            provider.buyOrders.forEach((order, oIndex) => {
                const orderNodeId = `${provider.id}-order-${oIndex}`;
                newNodes.push({
                    id: orderNodeId,
                    type: 'buyOrder',
                    position: { x: 600, y: index * 150 + oIndex * 50 },
                    data: { order, onDoubleClick: handleOpenDialog },
                });
    
                newEdges.push({
                    id: `${provider.id}-${orderNodeId}`,
                    source: provider.id,
                    target: orderNodeId,
                    label:  'Receives',
                });
            });
        });
    
        setNodes(newNodes);
        setEdges(newEdges);
    }, [providers]);

    const [openCreateDialogRoute, setOpenCreateDialogRoute] = useState(false);

    const handleRouteCreated = (newRoute: any) => {
        const newNode: Node = {
            id: newRoute.id,
            type: 'route',
            position: { x: 600, y: 150 },
            data: {
                route: newRoute,  // 👈 La data es 'route'
                onDoubleClick: handleOpenDialog
            },
        };
    
        setNodes((prevNodes) => [...prevNodes, newNode]);
    };

    

    const getRelationLabel = (sourceType: NodeType, targetType: NodeType) => {
        if (sourceType === 'product' && targetType === 'provider') return 'Belongs to';
        if (sourceType === 'product' && targetType === 'branchOffice') return 'Exists on';
        if (sourceType === 'provider' && targetType === 'branchOffice') return 'Provides to';
        if (sourceType === 'provider' && targetType === 'route') return 'Use';
    
        return 'Relación';
    };
    
    const handleCreateRelation = async (
        sourceId: string,
        targetId: string,
        sourceType: NodeType,
        targetType: NodeType,
        fields: Record<string, any>
    ) => {
        const payload = {
            sourceId,
            targetId,
            sourceType,
            targetType,
            ...fields
        };
    
        try {
            console.log('Creando relación (Provider) con payload:', payload);
    
            await axiosInstance.post('/providers/relationshipProvider', payload);
    
            toast.success('Relación creada exitosamente');
    
            setEdges((prevEdges) => [
                ...prevEdges,
                {
                    id: `${sourceId}-${targetId}`,
                    source: sourceId,
                    target: targetId,
                    label: getRelationLabel(sourceType, targetType),
                    animated: true,
                    style: { stroke: '#888' },
                }
            ]);
        } catch (error: any) {
            console.error('Error al crear relación:', error);
            toast.error(`Error: ${error.response?.data?.message || error.message}`);
        }
    };
    
    

    return (
        <div style={{ width: '100%', height: '80vh' }}>
            {loading ? <CircularProgress /> : error ? <p>{error}</p> : (
                <>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Buscar proveedor..."
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
                       
                            <MenuItem onClick={() => { setOpenCreateDialogProvider(true); handleMenuClose(); }}>
                                <AddIcon fontSize="small" style={{ marginRight: 8 }} />
                                Agregar Provider
                            </MenuItem>
                            <MenuItem onClick={() => { setOpenCreateDialogBranch(true); handleMenuClose(); }}>
                                <AddIcon fontSize="small" style={{ marginRight: 8 }} />
                                Agregar Branch Office
                            </MenuItem>
                            <MenuItem onClick={() => { setOpenCreateDialogRoute(true); handleMenuClose(); }}>
                                <AddIcon fontSize="small" style={{ marginRight: 8 }} />
                                Agregar Route
                            </MenuItem>
                            <MenuItem onClick={() => { setRelationDialogOpen(true); handleMenuClose(); }}>
                                <AddIcon fontSize="small" style={{ marginRight: 8 }} />
                                Agregar Relación
                            </MenuItem>
                        </Menu>
                    </Box>
                        <CreateDialogProvider
                            open={openCreateDialogProvider}
                            onClose={() => setOpenCreateDialogProvider(false)}
                            onProviderCreated={handleProviderCreated}
                        />
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

                        <CreateRelationshipProvider
                                open={relationDialogOpen}
                                onClose={() => setRelationDialogOpen(false)}
                                onCreate={handleCreateRelation}
                        />
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={handleNodesChange}
                        onEdgesChange={handleEdgesChange}
                        onConnect={(connection) => setEdges((eds) => addEdge(connection, eds))}
                        nodeTypes={nodeTypes}
                        fitView
                    >                        
                        <Background variant={BackgroundVariant.Dots} />
                        <MiniMap />
                        <Controls />
                    </ReactFlow>

                    <Pagination count={totalPages} page={page} onChange={(_, newPage) => setPage(newPage)} />

                    <Dialog open={!!selectedType} onClose={handleCloseDialog}>
                        <DialogTitle>Detalles de {selectedType}</DialogTitle>
                        <DialogContent>
                            <pre>{JSON.stringify(selectedItem, null, 2)}</pre>
                        </DialogContent>
                        <DialogActions><Button onClick={handleCloseDialog}>Cerrar</Button></DialogActions>
                    </Dialog>
                </>
            )}
        </div>
    );
};

export default ProviderGraph;
