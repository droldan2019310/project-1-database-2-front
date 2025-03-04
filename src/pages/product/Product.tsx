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
  Pagination
} from '@mui/material';

import 'reactflow/dist/style.css';
import { useGetProducts } from '../../hooks/useProduct';
import axiosInstance from '../../hooks/axiosInstance';
import { toast } from 'react-toastify';

interface ProductI {
  id: string;
  name: string;
  category: string;
  price: number;
  tags: string[];
  expiration_date: string;
}

// ProductNode para renderizar cada nodo
const ProductNode = ({ data }: { data: { product: ProductI; onDoubleClick: (product: ProductI) => void } }) => {
  return (
    <div
      onDoubleClick={() => data.onDoubleClick(data.product)}
      style={{
        padding: 10,
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
        borderRadius: 5,
        cursor: 'pointer',
        textAlign: 'center',
        minWidth: 150,
      }}
    >
      <strong>{data.product.name}</strong>
      <p>{data.product.category}</p>
      <p>Q{data.product.price}</p>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

const Product: React.FC = () => {
  const [page, setPage] = useState(1);

  const { products, totalPages, loading, error } = useGetProducts(page);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductI | null>(null);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
    handleCreateRelationship(connection.source, connection.target);
  }, []);

  async function handleCreateRelationship(sourceId?: any, targetId?: any) {
    try {
      await axiosInstance.post('/product/relationship', { sourceId, targetId });
      toast.success(`Relación creada entre ${sourceId} y ${targetId}`);
    } catch (error) {
      console.error('Error al crear la relación', error);
    }
  }

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  function handleNodeDoubleClick(product: ProductI) {
    setSelectedProduct(product);
  }

  const handleCloseDialog = () => {
    setSelectedProduct(null);
  };

  const nodeTypes = useMemo(() => ({ product: ProductNode }), []);

  useEffect(() => {
    if (products.length > 0) {
      const radius = 300;
      const centerX = 400;
      const centerY = 300;
      const angleStep = (2 * Math.PI) / products.length;

      const initialNodes = products.map((product, index) => ({
        id: product.id,
        type: 'product',
        position: {
          x: centerX + radius * Math.cos(index * angleStep),
          y: centerY + radius * Math.sin(index * angleStep),
        },
        data: { product, onDoubleClick: handleNodeDoubleClick },
      }));

      setNodes(initialNodes);
      fetchAllRelationships(products);
    }
  }, [products]);

  const fetchAllRelationships = async (products: ProductI[]) => {
    let allRelationships: Edge[] = [];

    for (const product of products) {
      try {
        const response = await axiosInstance.get(`/product/${product.id}/relationships`);
        const productRelationships = response.data.map((rel: any) => ({
          id: rel.id,
          source: rel.source,
          target: rel.target,
        }));
        allRelationships = allRelationships.concat(productRelationships);
      } catch (error) {
        console.error(`Error al cargar relaciones de ${product.name}`, error);
      }
    }

    setEdges(allRelationships);
  };

  const handlePageChange = (_: any, newPage: number) => {
    setPage(newPage);
  };

  return (
    <div style={{ width: '100%', height: '80vh', backgroundColor: '#F7F9FB' }}>
      {loading ? (
        <p>Cargando productos...</p>
      ) : error ? (
        <p>{error}</p>
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
            <Pagination count={totalPages} page={page} onChange={handlePageChange} />
          </div>

          {selectedProduct && (
            <Dialog open={!!selectedProduct} onClose={handleCloseDialog}>
              <DialogTitle>Detalles del Producto</DialogTitle>
              <DialogContent dividers>
                {selectedProduct && (
                  <>
                    <Typography variant="h6">{selectedProduct.name}</Typography>
                    <Typography><strong>Categoría:</strong> {selectedProduct.category}</Typography>
                    <Typography><strong>Precio:</strong> Q{selectedProduct.price}</Typography>
                    <Typography><strong>Fecha de Expiración:</strong> {selectedProduct.expiration_date}</Typography>
                    <Typography><strong>Tags:</strong></Typography>
                    <div style={{ marginTop: 8 }}>
                      {selectedProduct.tags.map(tag => (
                        <Chip key={tag} label={tag} style={{ marginRight: 5 }} />
                      ))}
                    </div>
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

export default Product;
