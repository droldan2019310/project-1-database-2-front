import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  Node,
  Edge,
  Connection,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  BackgroundVariant,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Pagination,
  TextField,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import 'reactflow/dist/style.css';

import axiosInstance from '../../hooks/axiosInstance';
import { toast } from 'react-toastify';
import CreateDialogProduct from '../../dialog/CreateDialogProduct';

import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import CreateDialogProvider from '../../dialog/CreateDialogProvider';
import CreateDialogBranch from '../../dialog/CreateDialogBranchOffice';
import { useCreateProductRelationship } from '../../hooks/useProduct';
import CreateRelationshipProduct from '../../dialog/CreateRelationshipProduct';

// Interfaces
interface ProductI {
  id: string;
  name: string;
  category: string;
  price: number;
  tags: string[];
  expiration_date: string;
  provider?: ProviderI;
  branchOffices: BranchOfficeI[];
}

interface ProviderI {
  id: string;
  Name: string;
  Location: string;
}
type NodeType = 'product' | 'provider' | 'branchOffice';

interface BranchOfficeI {
  id: string;
  Name: string;
  Location: string;
}

interface RelationDialogState {
  open: boolean;
  relationshipType: 'BELONGS_TO' | 'EXISTS_ON';
  sourceId: string;
  targetId: string;
  fields: {
      stock?: number;
      create_date?: string;
      time_to_create?: string;
      actual_stock?: number;
      buy_date?: string;
      minimum_stock?: number;
  };
}

// Estilo reutilizable para nodos
const nodeStyle = (bgColor: string, borderColor: string): React.CSSProperties => ({
  padding: 10,
  backgroundColor: bgColor,
  border: `1px solid ${borderColor}`,
  borderRadius: 5,
  cursor: 'pointer',
  textAlign: 'center' as const,
  minWidth: 150,
});

// Nodos
const ProductNode = ({ data }: { data: { product: ProductI; onDoubleClick: (type: string, item: any) => void } }) => (
  <div onDoubleClick={() => data.onDoubleClick('product', data.product)} style={nodeStyle('#f0f0f0', '#ccc')}>
    <strong>{data.product.name}</strong>
    <p>{data.product.category}</p>
    <p>Q{data.product.price}</p>
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
  </div>
);

const ProviderNode = ({ data }: { data: { provider: any; onDoubleClick: (type: string, item: any) => void } }) => (
  <div onDoubleClick={() => data.onDoubleClick('provider', data.provider)} style={nodeStyle('#ffcccb', '#ff6f61')}>
    <strong>{data.provider.name}</strong>
    <p>{data.provider.location}</p>
    <p>Proveedor</p>
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
  </div>
);

const BranchOfficeNode = ({ data }: { data: { branch: any; onDoubleClick: (type: string, item: any) => void } }) => (
  <div onDoubleClick={() => data.onDoubleClick('branch', data.branch)} style={nodeStyle('#cce5ff', '#66b3ff')}>
    <strong>{data.branch.name}</strong>
    <p>{data.branch.location}</p>
    <p>Sucursal</p>
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
  </div>
);

const ProductGraph: React.FC = () => {
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<ProductI[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openCreateDialogProvider, setOpenCreateDialogProvider] = useState(false);
  const [openCreateDialogBranch, setOpenCreateDialogBranch] = useState(false);

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ProductI | ProviderI | BranchOfficeI | null>(null);
 
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [relationData, setRelationData] = useState<{ sourceId: string; targetId: string; type: string } | null>(null);

  const { createRelationship } = useCreateProductRelationship();
  const [relationDialog, setRelationDialog] = useState<RelationDialogState | null>(null);

  const updateRelationField = (field: keyof RelationDialogState['fields'], value: string) => {
    if (relationDialog) {
        setRelationDialog({
            ...relationDialog,
            fields: {
                ...relationDialog.fields,
                [field]: value
            }
        });
    }
  };

  const [relationDialogOpen, setRelationDialogOpen] = useState(false);
  const openCreateRelationDialog = () => setRelationDialogOpen(true);

  const onConnect = useCallback((connection: Connection) => {
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);

    if (sourceNode && targetNode) {
        setRelationSource({ id: sourceNode.id, type: sourceNode.type as NodeType });
        setRelationTarget({ id: targetNode.id, type: targetNode.type as NodeType });
        setRelationDialogOpen(true);
    } else {
        toast.error('Nodos no encontrados.');
    }
    setEdges((eds) => addEdge(connection, eds));
  }, []);

  


  const fetchProductByName = async (name: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(`/product/name/${name}`);
      setProductData([response.data], 1);
      setIsSearching(true);
    } catch (err: any) {
      setError(err.message || 'Producto no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const setProductData = (rawProducts: any[], pages: number) => {
    const formattedProducts = rawProducts.map((item: any) => ({
      id: item.id,
      name: item.Name,
      category: item.Category,
      price: parseFloat(item.Price),
      tags: item.TagsArray || [],
      expiration_date: item.Expiration_date,
      provider: item.provider ? {
        id: item.provider.id,
        Name: item.provider.Name,
        Location: item.provider.Location,
      } : undefined,
      branchOffices: item.branchOffices?.map((branch: any) => ({
        id: branch.id,
        name: branch.Name,
        location: branch.Location,
      })) || [],
    }));

    setProducts(formattedProducts);
    setTotalPages(pages);
  };

  const fetchProducts = async (currentPage: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(`/product?page=${currentPage}&limit=5`);
      const { products: rawProducts, totalPages } = response.data;
      const formattedProducts = rawProducts.map((item: any) => ({
        id: item.id,
        name: item.Name,
        category: item.Category,
        price: parseFloat(item.Price),
        tags: item.TagsArray || [],
        expiration_date: item.Expiration_date,
        provider: item.provider ? {
          id: item.provider.id,
          name: item.provider.Name,
          location: item.provider.Location,
        } : undefined,
        branchOffices: item.branchOffices?.map((branch: any) => ({
          id: branch.id,
          name: branch.Name,
          location: branch.Location,
        })) || [],
      }));

      setProducts(formattedProducts);
      setTotalPages(totalPages);
    } catch (err: any) {
      setError(err.message || 'Error al obtener productos');
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = () => fetchProducts(page);

  const handleOpenDialog = (type: string, item: any) => {
    setSelectedType(type);
    setSelectedItem(item);
  };

  const handleCloseDialog = () => {
    setSelectedType(null);
    setSelectedItem(null);
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  useEffect(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    products.forEach((product, index) => {
      newNodes.push({
        id: product.id,
        type: 'product',
        position: { x: 200, y: index * 150 },
        data: { product, onDoubleClick: handleOpenDialog },
      });

      if (product.provider) {
        newNodes.push({
          id: product.provider.id,
          type: 'provider',
          position: { x: 0, y: index * 150 },
          data: { provider: product.provider, onDoubleClick: handleOpenDialog },
        });

        newEdges.push({ id: `${product.provider.id}-${product.id}`, source: product.provider.id, target: product.id, label: 'Belongs to' });
      }

      product.branchOffices.forEach((branch, bIndex) => {
        newNodes.push({
          id: branch.id,
          type: 'branchOffice',
          position: { x: 400, y: index * 150 + bIndex * 50 },
          data: { branch, onDoubleClick: handleOpenDialog },
        });

        newEdges.push({ id: `${product.id}-${branch.id}`, source: product.id, target: branch.id, label: 'Exists on' });
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [products]);

  const handleSearch = () => {
    if (isSearching) {
      setSearch('');
      setIsSearching(false);
      fetchProducts(page);
    } else {
      fetchProductByName(search);
    }
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };


  const handleProviderCreated = (newProvider: any) => {
    const newNode: Node = {
        id: newProvider.id,
        type: 'provider',
        position: { x: 100, y: nodes.length * 150 },  // Ajusta posición según lo que necesites
        data: {
            name: newProvider.Name,
            type: 'provider',
            provider: newProvider,
            onDoubleClick: handleOpenDialog
        },
    };

    

    setNodes((prevNodes) => [...prevNodes, newNode]); 
  };

  const handleBranchCreated = (newBranch: BranchOfficeI) => {
    const newNode: Node = {
        id: newBranch.id,
        type: 'branchOffice',
        position: { x: 400, y: nodes.length * 150 },
        data: {
            branch: newBranch, // 👈 Aquí envías 'branch' en vez de 'branchOffice'
            onDoubleClick: handleOpenDialog
        },
    };

    setNodes((prevNodes) => [...prevNodes, newNode]);
  };

  const getRelationLabel = (sourceType: string, targetType: string): string => {
    if (sourceType === 'product' && targetType === 'provider') {
        return 'Belongs to';
    }
    if (sourceType === 'product' && targetType === 'branchOffice') {
        return 'Exists on';
    }
    return 'Relates to';
  };

  const [relationSource, setRelationSource] = useState<{ id: string; type: NodeType } | null>(null);
  const [relationTarget, setRelationTarget] = useState<{ id: string; type: NodeType } | null>(null);


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
        console.log('Creando relación con payload:', payload);

        await axiosInstance.post('/product/relationshipProducts', payload);

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
    <div style={{ width: '100%', height: '80vh', backgroundColor: '#F7F9FB' }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Buscar producto..."
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
          <MenuItem onClick={() => { setOpenCreateDialog(true); handleMenuClose(); }}>
            <AddIcon fontSize="small" style={{ marginRight: 8 }} />
            Agregar Producto
          </MenuItem>
          <MenuItem onClick={() => { setOpenCreateDialogProvider(true); handleMenuClose(); }}>
            <AddIcon fontSize="small" style={{ marginRight: 8 }} />
            Agregar Provider
          </MenuItem>
          <MenuItem onClick={() => { setOpenCreateDialogBranch(true); handleMenuClose(); }}>
            <AddIcon fontSize="small" style={{ marginRight: 8 }} />
            Agregar Branch Office
          </MenuItem>
          <MenuItem onClick={() => { setRelationDialogOpen(true); handleMenuClose(); }}>
              <AddIcon fontSize="small" style={{ marginRight: 8 }} />
              Agregar Relación
          </MenuItem>
        </Menu>
      </Box>
        <CreateDialogProduct open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} onProductCreated={refreshProducts} />
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

      <ReactFlow onConnect={onConnect} nodes={nodes} edges={edges} onNodesChange={(changes) => setNodes((nds) => applyNodeChanges(changes, nds))} onEdgesChange={(changes) => setEdges((eds) => applyEdgeChanges(changes, eds))} nodeTypes={useMemo(() => ({ product: ProductNode, provider: ProviderNode, branchOffice: BranchOfficeNode }), [])} fitView>
        <Background variant={BackgroundVariant.Dots} />
        <MiniMap />
        <Controls />
      </ReactFlow>

      <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} />
          
      <CreateRelationshipProduct
        open={relationDialogOpen}
        onClose={() => setRelationDialogOpen(false)}
        onCreate={handleCreateRelation}
      />

      <Dialog open={!!selectedType} onClose={handleCloseDialog}>
        <DialogTitle>Detalles de {selectedType}</DialogTitle>
        <DialogContent>
          <pre>{JSON.stringify(selectedItem, null, 2)}</pre>
        </DialogContent>
        <DialogActions><Button onClick={handleCloseDialog}>Cerrar</Button></DialogActions>
      </Dialog>
    </div>
  );
};

export default ProductGraph;
