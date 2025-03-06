import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { useCreateBranchOffice } from '../hooks/useBranchOffice';

// Interfaz para la sucursal recién creada
interface BranchOffice {
    id: string;
    Income: number;
    ID: string;
    Voided: boolean;
    Name: string;
    Location: string;
}

// Props del dialog
interface CreateDialogBranchProps {
    open: boolean;
    onClose: () => void;
    onBranchCreated: (newBranch: BranchOffice) => void;  // Inserta directamente el nodo creado
}

const CreateDialogBranch: React.FC<CreateDialogBranchProps> = ({ open, onClose, onBranchCreated }) => {
    const { createBranchOffice, loading, error } = useCreateBranchOffice();

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        income: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        const payload = {
            name: formData.name,
            location: formData.location,
            income: parseFloat(formData.income)
        };

        const newBranch = await createBranchOffice(payload);

        if (newBranch) {
            onBranchCreated(newBranch);  // Inyecta el nodo creado al grafo actual
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Crear Nueva Sucursal</DialogTitle>
            <DialogContent dividers>
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
                <TextField
                    label="Ingresos"
                    name="income"
                    type="number"
                    fullWidth
                    value={formData.income}
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

export default CreateDialogBranch;
