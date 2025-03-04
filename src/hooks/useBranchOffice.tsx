import { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';

// Interfaces basadas en la estructura de respuesta

interface Invoice {
    id: string;
    Status: string;
    Cashier_main: string;
    Total: string;
    NIT: string;
    ID: number;
    Date: string;
    Notes: string;
    Name: string;
    relationshipType: string;
}

interface BranchOffice {
    id: string;
    Income: string;
    ID: number;
    Name: string;
    Location: string;
    invoices: Invoice[];
}

interface PaginatedBranchOfficesResponse {
    page: number;
    limit: number;
    totalPages: number;
    totalBranches: number;
    branchOffices: BranchOffice[];
}

export function useGetBranchOffices(page: number = 1) {
    const [branchOffices, setBranchOffices] = useState<BranchOffice[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBranchOffices = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.get<PaginatedBranchOfficesResponse>(`/branchoffice?page=${page}&limit=5`);

                setBranchOffices(response.data.branchOffices);
                setTotalPages(response.data.totalPages);
            } catch (err: any) {
                setError(err.message || 'Error al obtener sucursales');
            } finally {
                setLoading(false);
            }
        };

        fetchBranchOffices();
    }, [page]);

    return { branchOffices, totalPages, loading, error };
}
