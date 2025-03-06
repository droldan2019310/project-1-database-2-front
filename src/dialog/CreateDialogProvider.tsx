import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { useCreateProvider } from '../hooks/useProvider';

// Interfaz para el proveedor que se crea
interface Provider {
    id: string;
    ID: number;
    Name: string;
    Location: string;
    Voided: boolean;
}

// Props del dialog
interface CreateDialogProviderProps {
    open: boolean;
    onClose: () => void;
    onProviderCreated: (newProvider: Provider) => void;  // Recibe el nuevo proveedor creado
}

const CreateDialogProvider: React.FC<CreateDialogProviderProps> = ({ open, onClose, onProviderCreated }) => {
    const { createProvider, loading, error } = useCreateProvider();

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        location: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        const payload = {
            id: parseInt(formData.id, 10),
            name: formData.name,
            location: formData.location,
        };

        const newProvider = await createProvider(payload);

        if (newProvider) {
            onProviderCreated(newProvider);  // Manda el nodo recién creado al grafo
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Crear Nuevo Proveedor</DialogTitle>
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
                    label="Ubicación"
                    name="location"
                    fullWidth
                    value={formData.location}
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

export default CreateDialogProvider;
