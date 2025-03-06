import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography
} from '@mui/material';

// Props del componente
interface CreateRelationshipInvoiceProps {
    open: boolean;
    onClose: () => void;
    onCreate: (
        sourceId: string,
        targetId: string,
        fields: Record<string, any>
    ) => void;
}

const CreateRelationshipInvoice: React.FC<CreateRelationshipInvoiceProps> = ({ open, onClose, onCreate }) => {
    const [invoiceId, setInvoiceId] = useState<string>('');
    const [productId, setProductId] = useState<string>('');
    const [fields, setFields] = useState<Record<string, any>>({
        quantity: '',
        discount: '',
        price: '',
        sub_total: ''
    });

    const handleFieldChange = (name: string, value: string) => {
        setFields(prev => ({ ...prev, [name]: value }));
    };

    const handleCreate = () => {
        if (!invoiceId || !productId) {
            alert('Debes ingresar el ID de la Factura y del Producto');
            return;
        }

        onCreate(invoiceId, productId, {
            quantity: parseInt(fields.quantity, 10) || 0,
            discount: parseFloat(fields.discount) || 0,
            price: parseFloat(fields.price) || 0,
            sub_total: parseFloat(fields.sub_total) || 0
        });

        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Crear Relación Invoice → Product (CONTAINS)</DialogTitle>
            <DialogContent dividers>
                <Typography variant="subtitle1">Ingresa los IDs de la Factura y el Producto:</Typography>

                <TextField
                    label="ID de la Factura (Invoice)"
                    value={invoiceId}
                    onChange={(e) => setInvoiceId(e.target.value)}
                    fullWidth
                    margin="dense"
                />

                <TextField
                    label="ID del Producto"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    fullWidth
                    margin="dense"
                />

                <Typography variant="subtitle1" sx={{ mt: 2 }}>Datos de la Relación:</Typography>

                <TextField
                    label="Cantidad"
                    type="number"
                    value={fields.quantity}
                    onChange={(e) => handleFieldChange('quantity', e.target.value)}
                    fullWidth
                    margin="dense"
                />

                <TextField
                    label="Descuento"
                    type="number"
                    value={fields.discount}
                    onChange={(e) => handleFieldChange('discount', e.target.value)}
                    fullWidth
                    margin="dense"
                />

                <TextField
                    label="Precio"
                    type="number"
                    value={fields.price}
                    onChange={(e) => handleFieldChange('price', e.target.value)}
                    fullWidth
                    margin="dense"
                />

                <TextField
                    label="Subtotal"
                    type="number"
                    value={fields.sub_total}
                    onChange={(e) => handleFieldChange('sub_total', e.target.value)}
                    fullWidth
                    margin="dense"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">Cancelar</Button>
                <Button onClick={handleCreate} color="primary">Crear Relación</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateRelationshipInvoice;
