import { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';

// Definimos el tipo Product basado en la respuesta de tu backend
interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    tags: string[];
    expiration_date: string; // Convertimos a string para fácil manejo
}

interface PaginatedResponse {
    page: number;
    limit: number;
    totalPages: number;
    totalProducts: number;
    products: any[];
}

interface ProductRelationship {
    id: string;
    source: string;
    target: string;
    type: string; // opcional, por si decides mostrar el tipo de relación
}

export function useGetProducts(page: number = 1) {
    const [products, setProducts] = useState<Product[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.get<PaginatedResponse>(`/product?page=${page}&limit=10`);
                const { products: rawProducts, totalPages } = response.data;

                const formattedProducts = rawProducts.map((item: any) => ({
                    id: item.id,
                    name: item.Name,
                    category: item.Category,
                    price: parseFloat(item.Price), // Convertimos a número por seguridad
                    tags: item.TagsArray || [],    // Evitar null
                    expiration_date: item.Expiration_date
                }));

                setProducts(formattedProducts);
                setTotalPages(totalPages);
            } catch (err: any) {
                setError(err.message || 'Error al obtener productos');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [page]);  // Dependencia: page

    return { products, totalPages, loading, error };
}

export  function useGetProductRelationships(productId: string) {
    const [relationships, setRelationships] = useState<ProductRelationship[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!productId) return; // Si no hay id, no ejecuta

        const fetchRelationships = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.get(`/product/${productId}/relationships`);
                setRelationships(response.data);
            } catch (err: any) {
                setError(err.message || 'Error al obtener relaciones');
            } finally {
                setLoading(false);
            }
        };

        fetchRelationships();
    }, [productId]);

    return { relationships, loading, error };
}