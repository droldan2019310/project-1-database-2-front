import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Chip } from '@mui/material';
import { useCreateProduct } from '../hooks/useProduct';

// Interfaz para el producto creado
interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    tags: string[];
    expiration_date: string;
}

// Props del diálogo
interface CreateDialogProductClonedProps {
    open: boolean;
    onClose: () => void;
    onProductCreated: (newProduct: any) => void;  // Inyecta directamente el nuevo producto creado
}

const CreateDialogProductCloned: React.FC<CreateDialogProductClonedProps> = ({ open, onClose, onProductCreated }) => {
    const { createProduct, loading, error } = useCreateProduct();

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        expiration_date: '',
        tags: [] as string[],
        currentTag: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddTag = () => {
        if (formData.currentTag.trim()) {
            setFormData((prev) => ({
                ...prev,
                tags: [...prev.tags, prev.currentTag.trim()],
                currentTag: '',
            }));
        }
    };

    const handleRemoveTag = (tagToDelete: string) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((tag) => tag !== tagToDelete),
        }));
    };

    const handleSubmit = async () => {
        const payload = {
            name: formData.name,
            category: formData.category,
            price: parseFloat(formData.price),
            tags: formData.tags,
            expiration_date: formData.expiration_date,
        };

        const newProduct = await createProduct(payload);

        if (newProduct) {
            onProductCreated(newProduct);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Crear Nuevo Producto (Clonado)</DialogTitle>
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
                    label="Categoría"
                    name="category"
                    fullWidth
                    value={formData.category}
                    onChange={handleChange}
                    margin="dense"
                />
                <TextField
                    label="Precio"
                    name="price"
                    type="number"
                    fullWidth
                    value={formData.price}
                    onChange={handleChange}
                    margin="dense"
                />
                <TextField
                    label="Fecha de Expiración"
                    name="expiration_date"
                    type="date"
                    fullWidth
                    value={formData.expiration_date}
                    onChange={handleChange}
                    margin="dense"
                />
                <div style={{ marginTop: 10 }}>
                    <TextField
                        label="Agregar Tag"
                        value={formData.currentTag}
                        onChange={(e) => setFormData((prev) => ({ ...prev, currentTag: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        fullWidth
                        margin="dense"
                    />
                    <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {formData.tags.map((tag) => (
                            <Chip key={tag} label={tag} onDelete={() => handleRemoveTag(tag)} color="primary" />
                        ))}
                    </div>
                </div>

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

export default CreateDialogProductCloned;
