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
type NodeType = 'branchOffice';
type TargetType = 'invoice' | 'buyOrder';

// Props del componente
interface CreateRelationshipBranchProps {
    open: boolean;
    onClose: () => void;
    onCreate: (
        sourceId: string,
        targetId: string,
        targetType: TargetType,
        fields: Record<string, any>
    ) => void;
}

// Campos base para cada tipo de relación
const relationFields = {
    invoice: [
        { name: 'nit_remitente', label: 'NIT Remitente', type: 'text' },
        { name: 'direccion_remitente', label: 'Dirección Remitente', type: 'text' },
        { name: 'telefono_remitente', label: 'Teléfono Remitente', type: 'text' },
    ],
    buyOrder: [
        { name: 'date_created', label: 'Fecha Creación', type: 'date' },
        { name: 'cashier', label: 'Cajero', type: 'text' },
        { name: 'type_payment', label: 'Tipo de Pago', type: 'text' },
    ]
};

const CreateRelationshipBranch: React.FC<CreateRelationshipBranchProps> = ({ open, onClose, onCreate }) => {
    const [sourceId, setSourceId] = useState<string>('');
    const [targetId, setTargetId] = useState<string>('');
    const [targetType, setTargetType] = useState<TargetType>('invoice');  // Por defecto 'invoice'
    const [fields, setFields] = useState<Record<string, any>>({});

    const handleFieldChange = (name: string, value: any) => {
        setFields(prev => ({ ...prev, [name]: value }));
    };

    const handleCreate = () => {
        if (!sourceId || !targetId) {
            alert('Debes ingresar ambos IDs');
            return;
        }

        onCreate(sourceId, targetId, targetType, fields);
        onClose();
    };

    const getFieldsForRelation = () => {
        return relationFields[targetType] || [];
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Crear Relación Entre Sucursal y {targetType === 'invoice' ? 'Factura' : 'Orden de Compra'}</DialogTitle>
            <DialogContent dividers>
                <Typography variant="subtitle1">Selecciona el tipo de nodo destino e ingresa sus IDs:</Typography>

                <TextField
                    label="ID de la Sucursal (Origen)"
                    value={sourceId}
                    onChange={(e) => setSourceId(e.target.value)}
                    fullWidth
                    margin="dense"
                />

                <TextField
                    select
                    label="Tipo Nodo Destino"
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as TargetType)}
                    fullWidth
                    margin="dense"
                >
                    <MenuItem value="invoice">Factura</MenuItem>
                    <MenuItem value="buyOrder">Orden de Compra</MenuItem>
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

export default CreateRelationshipBranch;
