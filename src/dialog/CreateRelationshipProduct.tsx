import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    MenuItem,
    TextField,
    Typography
} from '@mui/material';

// Tipos de nodo
type NodeType = 'product' | 'provider' | 'branchOffice';

// Propiedades del componente
interface CreateRelationshipProductProps {
    open: boolean;
    onClose: () => void;
    onCreate: (
        sourceId: string,
        targetId: string,
        sourceType: NodeType,
        targetType: NodeType,
        fields: Record<string, any>
    ) => void;
}

// Campos base para cada tipo de relación
const relationFields = {
    product_provider: [
        { name: 'create_date', label: 'Fecha de Creación', type: 'date' },
        { name: 'time_to_create', label: 'Tiempo de Creación', type: 'text' },
    ],
    product_branchOffice: [
        { name: 'actual_stock', label: 'Stock Actual', type: 'number' },
        { name: 'buy_date', label: 'Fecha de Compra', type: 'date' },
        { name: 'minimum_stock', label: 'Stock Mínimo', type: 'number' },
    ]
};

const CreateRelationshipProduct: React.FC<CreateRelationshipProductProps> = ({ open, onClose, onCreate }) => {
    const [sourceId, setSourceId] = useState<string>('');
    const [targetId, setTargetId] = useState<string>('');
    const [sourceType, setSourceType] = useState<NodeType>('product');
    const [targetType, setTargetType] = useState<NodeType>('provider');
    const [fields, setFields] = useState<Record<string, any>>({});

    const handleTypeChange = (type: 'source' | 'target', value: NodeType) => {
        if (type === 'source') setSourceType(value);
        if (type === 'target') setTargetType(value);
        setFields({});  // Reiniciar campos dinámicos al cambiar tipo
    };

    const handleFieldChange = (name: string, value: any) => {
        setFields(prev => ({ ...prev, [name]: value }));
    };

    const handleCreate = () => {
        if (!sourceId || !targetId) {
            alert('Debes ingresar ambos IDs');
            return;
        }

        onCreate(sourceId, targetId, sourceType, targetType, fields);
        onClose();
    };

    const getFieldsForRelation = () => {
        if (sourceType === 'product' && targetType === 'provider') {
            return relationFields.product_provider;
        } else if (sourceType === 'product' && targetType === 'branchOffice') {
            return relationFields.product_branchOffice;
        }
        return [];
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Crear Relación Entre Nodos</DialogTitle>
            <DialogContent dividers>
                <Typography variant="subtitle1">Selecciona tipos de nodos e ingresa sus IDs:</Typography>

                <TextField
                    label="ID del Nodo Origen"
                    value={sourceId}
                    onChange={(e) => setSourceId(e.target.value)}
                    fullWidth
                    margin="dense"
                />
                
                <TextField
                    select
                    label="Tipo Nodo Origen"
                    value={sourceType}
                    onChange={(e) => handleTypeChange('source', e.target.value as NodeType)}
                    fullWidth
                    margin="dense"
                >
                    <MenuItem value="product">Producto</MenuItem>
                </TextField>

                <TextField
                    label="ID del Nodo Destino"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    fullWidth
                    margin="dense"
                />
                
                <TextField
                    select
                    label="Tipo Nodo Destino"
                    value={targetType}
                    onChange={(e) => handleTypeChange('target', e.target.value as NodeType)}
                    fullWidth
                    margin="dense"
                >
                    <MenuItem value="provider">Proveedor</MenuItem>
                    <MenuItem value="branchOffice">Sucursal</MenuItem>
                </TextField>

                {getFieldsForRelation().map(field => (
                    <TextField
                        key={field.name}
                        label={field.label}
                        type={field.type}
                        value={fields[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        fullWidth
                        margin="dense"
                    />
                ))}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">Cancelar</Button>
                <Button onClick={handleCreate} color="primary">Crear Relación</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateRelationshipProduct;
