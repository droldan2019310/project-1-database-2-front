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

interface BuyOrder {
    id: string;
    Status: string;
    Total: string;
    Items: string; // Esto parece un string tipo JSON, si quieres lo podemos convertir a un array real
    ID: number;
    Date: string;
    Voided: boolean;
    relationshipType: string;
}

interface BranchOffice {
    id: string;
    Income: string;
    ID: number;
    Name: string;
    Location: string;
    invoices: Invoice[];
    buyOrders: BuyOrder[];
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

                // Aseguramos que `buyOrders` esté siempre presente (por si alguna sucursal no tiene)
                const formattedBranchOffices = response.data.branchOffices.map(branch => ({
                    ...branch,
                    invoices: branch.invoices || [],
                    buyOrders: branch.buyOrders || []
                }));

                setBranchOffices(formattedBranchOffices);
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



// Interfaz de la request para crear
interface CreateBranchOfficeRequest {
    name: string;
    location: string;
    income: number;
}

// Interfaz de la respuesta al crear
interface CreatedBranchOfficeResponse {
    id: string;
    Income: number;
    ID: string;
    Voided: boolean;
    Name: string;
    Location: string;
}

// Hook de creación de sucursales
export function useCreateBranchOffice() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const createBranchOffice = async (branchOfficeData: CreateBranchOfficeRequest): Promise<CreatedBranchOfficeResponse | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.post<CreatedBranchOfficeResponse>('/branchoffice', branchOfficeData);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear sucursal');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { createBranchOffice, loading, error };
}


// Tipos de relación soportados para branch offices
type BranchRelationshipType = 'EMITS' | 'CREATES_A';

// Request que espera el backend para crear la relación
interface CreateBranchRelationshipRequest {
    sourceId: string;    // ID de la BranchOffice
    targetId: string;    // ID de la Invoice o BuyOrder
    targetType: 'invoice' | 'buyOrder';
    nit_remitente?: string;
    direccion_remitente?: string;
    telefono_remitente?: string;
    date_created?: string;   // formato: YYYY-MM-DD
    cashier?: string;
    type_payment?: string;
}

// Respuesta que devuelve el backend al crear la relación
interface CreatedBranchRelationshipResponse {
    message: string;
    sourceId: string;
    targetId: string;
    relationshipType: BranchRelationshipType;
    properties: Record<string, any>;
}

// Hook para crear relaciones de branch offices
export function useCreateBranchRelationship() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const createBranchRelationship = async (data: CreateBranchRelationshipRequest): Promise<CreatedBranchRelationshipResponse | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.post<CreatedBranchRelationshipResponse>('/branchOffice/relationship', data);
            return response.data;  // Relación creada
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear la relación');
            return null;  // Si hay error, regresa null
        } finally {
            setLoading(false);
        }
    };

    return { createBranchRelationship, loading, error };
}
