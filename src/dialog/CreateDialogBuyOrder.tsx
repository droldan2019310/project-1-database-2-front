import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Box, Chip } from '@mui/material';
import { useCreateBuyOrder } from '../hooks/useInvoice';

// Interfaz para la orden de compra recién creada (puedes ajustarla si necesitas)
interface BuyOrder {
    id: string;
    ID: string;
    Status: string;
    Total: number;
    Items: string[];
    Date: string;
    Voided: boolean;
}

// Props del Dialog
interface CreateDialogBuyOrderProps {
    open: boolean;
    onClose: () => void;
    onBuyOrderCreated: (newBuyOrder: BuyOrder) => void;
}

const CreateDialogBuyOrder: React.FC<CreateDialogBuyOrderProps> = ({ open, onClose, onBuyOrderCreated }) => {
    const { createBuyOrder, loading, error } = useCreateBuyOrder();

    const [formData, setFormData] = useState({
        id: '',
        status: '',
        total: '',
        items: [] as string[],
        date: '',
        voided: 'false'
    });

    const [currentItem, setCurrentItem] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddItem = () => {
        if (currentItem.trim()) {
            setFormData((prev) => ({ ...prev, items: [...prev.items, currentItem.trim()] }));
            setCurrentItem('');
        }
    };

    const handleRemoveItem = (itemToRemove: string) => {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.filter(item => item !== itemToRemove)
        }));
    };

    const handleSubmit = async () => {
        const dateParts = formData.date.split('-'); // YYYY-MM-DD
        const payload = {
            id: formData.id,
            status: formData.status,
            total: parseFloat(formData.total),
            items: formData.items,
            date: {
                year: parseInt(dateParts[0], 10),
                month: parseInt(dateParts[1], 10),
                day: parseInt(dateParts[2], 10),
            },
            voided: formData.voided === 'true'
        };

        const newBuyOrder = await createBuyOrder(payload);

        if (newBuyOrder) {
            onBuyOrderCreated(newBuyOrder);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Crear Nueva Orden de Compra</DialogTitle>
            <DialogContent dividers>
                <TextField
                    label="ID"
                    name="id"
                    fullWidth
                    value={formData.id}
                    onChange={handleChange}
                    margin="dense"
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
                    <MenuItem value="Approved">Aprobada</MenuItem>
                    <MenuItem value="Rejected">Rechazada</MenuItem>
                </TextField>
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
                    label="¿Anulada?"
                    name="voided"
                    fullWidth
                    select
                    value={formData.voided}
                    onChange={handleChange}
                    margin="dense"
                >
                    <MenuItem value="false">No</MenuItem>
                    <MenuItem value="true">Sí</MenuItem>
                </TextField>

                <Box mt={2}>
                    <TextField
                        label="Agregar Item"
                        value={currentItem}
                        onChange={(e) => setCurrentItem(e.target.value)}
                        fullWidth
                        margin="dense"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                    />
                    <Button onClick={handleAddItem} variant="outlined" size="small" sx={{ mt: 1 }}>Agregar Item</Button>
                </Box>

                <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
                    {formData.items.map((item) => (
                        <Chip
                            key={item}
                            label={item}
                            onDelete={() => handleRemoveItem(item)}
                            color="primary"
                        />
                    ))}
                </Box>

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

export default CreateDialogBuyOrder;
