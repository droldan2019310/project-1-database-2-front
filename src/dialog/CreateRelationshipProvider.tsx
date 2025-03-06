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
type NodeType = 'provider' | 'branchOffice' | 'route';

// Propiedades del componente
interface CreateRelationshipProviderProps {
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
    provider_branchOffice: [
        { name: 'quantity_of_orders_in_time', label: 'Cantidad de Órdenes', type: 'number' },
        { name: 'type_product', label: 'Tipo de Producto', type: 'text' },
        { name: 'range_client', label: 'Rango de Cliente', type: 'text' },
    ],
    provider_route: [
        { name: 'cost_of_operation', label: 'Costo de Operación', type: 'number' },
        { name: 'status_payment', label: 'Estado de Pago', type: 'text' },
        { name: 'type_vehicle', label: 'Tipo de Vehículo', type: 'text' },
    ]
};

const CreateRelationshipProvider: React.FC<CreateRelationshipProviderProps> = ({ open, onClose, onCreate }) => {
    const [sourceId, setSourceId] = useState<string>('');
    const [targetId, setTargetId] = useState<string>('');
    const [sourceType] = useState<NodeType>('provider'); // Siempre es provider
    const [targetType, setTargetType] = useState<NodeType>('branchOffice'); // Default branchOffice
    const [fields, setFields] = useState<Record<string, any>>({});

    const handleTypeChange = (value: NodeType) => {
        setTargetType(value);
        setFields({}); // Limpiar campos al cambiar tipo
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
        if (targetType === 'branchOffice') {
            return relationFields.provider_branchOffice;
        } else if (targetType === 'route') {
            return relationFields.provider_route;
        }
        return [];
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Crear Relación Entre Proveedor y Otro Nodo</DialogTitle>
            <DialogContent dividers>
                <Typography variant="subtitle1">Selecciona nodo destino e ingresa sus IDs:</Typography>

                <TextField
                    label="ID del Proveedor (Origen)"
                    value={sourceId}
                    onChange={(e) => setSourceId(e.target.value)}
                    fullWidth
                    margin="dense"
                />
                
                <TextField
                    select
                    label="Tipo Nodo Destino"
                    value={targetType}
                    onChange={(e) => handleTypeChange(e.target.value as NodeType)}
                    fullWidth
                    margin="dense"
                >
                    <MenuItem value="branchOffice">Sucursal</MenuItem>
                    <MenuItem value="route">Ruta</MenuItem>
                </TextField>

                <TextField
                    label="ID del Nodo Destino"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    fullWidth
                    margin="dense"
                />

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

export default CreateRelationshipProvider;
