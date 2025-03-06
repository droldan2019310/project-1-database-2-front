import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem } from '@mui/material';
import { useCreateInvoice } from '../hooks/useInvoice';

// Interfaz para la factura recién creada
interface Invoice {
    id: string;
    ID: number;
    Name: string;
    NIT: string;
    Total: number;
    Cashier_main: string;
    Date: string;
    Status: string;
    Notes: string;
    Voided: boolean;
}

// Props del dialog
interface CreateDialogInvoiceProps {
    open: boolean;
    onClose: () => void;
    onInvoiceCreated: (newInvoice: Invoice) => void;  // Callback para devolver la factura creada
}

const CreateDialogInvoice: React.FC<CreateDialogInvoiceProps> = ({ open, onClose, onInvoiceCreated }) => {
    const { createInvoice, loading, error } = useCreateInvoice();

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        nit: '',
        total: '',
        cashier_main: '',
        date: '',
        status: '',
        notes: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        const payload = {
            id: parseInt(formData.id, 10),
            name: formData.name,
            nit: formData.nit,
            total: parseFloat(formData.total),
            cashier_main: formData.cashier_main,
            date: formData.date, // Formato YYYY-MM-DD
            status: formData.status,
            notes: formData.notes,
        };

        const newInvoice = await createInvoice(payload);

        if (newInvoice) {
            onInvoiceCreated(newInvoice);  // Devuelve la nueva factura creada
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Crear Nueva Factura</DialogTitle>
            <DialogContent dividers>
                <TextField
                    label="ID"
                    name="id"
                    fullWidth
                    type="number"
                    value={formData.id}
                    onChange={handleChange}
                    margin="dense"
                />
                <TextField
                    label="Nombre"
                    name="name"
                    fullWidth
                    value={formData.name}
                    onChange={handleChange}
                    margin="dense"
                />
                <TextField
                    label="NIT"
                    name="nit"
                    fullWidth
                    value={formData.nit}
                    onChange={handleChange}
                    margin="dense"
                />
                <TextField
                    label="Total"
                    name="total"
                    fullWidth
                    type="number"
                    value={formData.total}
                    onChange={handleChange}
                    margin="dense"
                />
                <TextField
                    label="Cajero Principal"
                    name="cashier_main"
                    fullWidth
                    value={formData.cashier_main}
                    onChange={handleChange}
                    margin="dense"
                />
                <TextField
                    label="Fecha"
                    name="date"
                    fullWidth
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="Estado"
                    name="status"
                    fullWidth
                    select
                    value={formData.status}
                    onChange={handleChange}
                    margin="dense"
                >
                    <MenuItem value="Pending">Pendiente</MenuItem>
                    <MenuItem value="Paid">Pagada</MenuItem>
                    <MenuItem value="Canceled">Cancelada</MenuItem>
                </TextField>
                <TextField
                    label="Notas"
                    name="notes"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    margin="dense"
                />

                {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">Cancelar</Button>
                <Button onClick={handleSubmit} color="primary" disabled={loading}>
                    {loading ? 'Creando...' : 'Crear'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateDialogInvoice;
