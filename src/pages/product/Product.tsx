import React, { useState, useCallback, useMemo } from 'react';
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
  } from '@mui/material';

import 'reactflow/dist/style.css';

interface ProductI {
  id: string;
  name: string;
  category: string;
  price: number;
  tags: string[];
  expiration_date: string;
}

const initialProducts: ProductI[] = [
  { id: '1', name: 'Producto 1', category: 'Alimentos', price: 20, tags: ['comida', 'fresco'], expiration_date: '2025-12-31' },
  { id: '2', name: 'Producto 2', category: 'Bebidas', price: 15, tags: ['bebida', 'refresco'], expiration_date: '2025-06-30' },
];

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
  const [nodes, setNodes] = useState<Node[]>(initialProducts.map(product => ({
    id: product.id,
    type: 'product',
    position: { x: Math.random() * 400, y: Math.random() * 400 },
    data: { product, onDoubleClick: handleNodeDoubleClick }
  })));

  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductI | null>(null);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, []);

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

  return (
    <div style={{ width: '100%', height: '80vh', backgroundColor: '#F7F9FB' }}>
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
    </div>
  );
};

export default Product;
