import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { useCreateRoute } from '../hooks/useRoute';

// Interfaz para la ruta creada
interface Route {
    id: string;
    Quantity: number;
    Delivery_name: string;
    Arrive_date: {
        year: { low: number };
        month: { low: number };
        day: { low: number };
    };
    Arrive_hour: string;
    Company: string;
    Distance_KM: number;
    Voided: boolean;
}

// Props del diálogo
interface CreateDialogRouteProps {
    open: boolean;
    onClose: () => void;
    onRouteCreated: (newRoute: Route) => void;  // Usa la interfaz correcta
}

const CreateDialogRoute: React.FC<CreateDialogRouteProps> = ({ open, onClose, onRouteCreated }) => {
    const { createRoute, loading, error } = useCreateRoute();

    const [formData, setFormData] = useState({
        quantity: '',
        delivery_name: '',
        arrive_date: '',
        arrive_hour: '',
        company: '',
        distance_km: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        const payload = {
            quantity: parseInt(formData.quantity, 10),
            delivery_name: formData.delivery_name,
            arrive_date: formData.arrive_date,
            arrive_hour: formData.arrive_hour,
            company: formData.company,
            distance_km: parseFloat(formData.distance_km)
        };

        const newRoute = await createRoute(payload);

        if (newRoute) {
            onRouteCreated(newRoute);  // Inyecta directamente el nodo
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Crear Nueva Ruta</DialogTitle>
            <DialogContent dividers>
                <TextField
                    label="Cantidad"
                    name="quantity"
                    type="number"
                    fullWidth
                    value={formData.quantity}
                    onChange={handleChange}
                    margin="dense"
                />
                <TextField
                    label="Nombre del Repartidor"
                    name="delivery_name"
                    fullWidth
                    value={formData.delivery_name}
                    onChange={handleChange}
                    margin="dense"
                />
                <TextField
                    label="Fecha de Llegada"
                    name="arrive_date"
                    type="date"
                    fullWidth
                    value={formData.arrive_date}
                    onChange={handleChange}
                    margin="dense"
                />
                <TextField
                    label="Hora de Llegada"
                    name="arrive_hour"
                    type="time"
                    fullWidth
                    value={formData.arrive_hour}
                    onChange={handleChange}
                    margin="dense"
                />
                <TextField
                    label="Compañía"
                    name="company"
                    fullWidth
                    value={formData.company}
                    onChange={handleChange}
                    margin="dense"
                />
                <TextField
                    label="Distancia (KM)"
                    name="distance_km"
                    type="number"
                    fullWidth
                    value={formData.distance_km}
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

export default CreateDialogRoute;
