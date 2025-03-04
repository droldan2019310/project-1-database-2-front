import { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';

interface BranchOffice {
    id: string;
    Name: string;
    relationshipType: string; // Si luego necesitas más propiedades de la relación, puedes ampliar aquí
}

interface Provider {
    id: string;
    Name: string;
    Voided: boolean;
    branchOffices: BranchOffice[];
}

interface PaginatedProvidersResponse {
    page: number;
    limit: number;
    totalPages: number;
    totalProviders: number;
    providers: Provider[];
}

export function useGetProviders(page: number = 1) {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProviders = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.get<PaginatedProvidersResponse>(`/providers?page=${page}&limit=5`);
                
                setProviders(response.data.providers);
                setTotalPages(response.data.totalPages);

            } catch (err: any) {
                setError(err.message || 'Error al obtener proveedores');
            } finally {
                setLoading(false);
            }
        };

        fetchProviders();
    }, [page]);

    return { providers, totalPages, loading, error };
}
