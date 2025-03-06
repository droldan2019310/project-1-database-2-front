import { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';

interface BranchOffice {
    id: string;
    Name: string;
    relationshipType: string;
    ID: number;
    Location: string;
    Voided: boolean | null;
    Income: string;
}

interface Route {
    id: string;
    Name: string;
    Distance_KM: string;
    relationshipType: string;
    Start_date: string;
    End_date: string;
    Voided: boolean;
    Company: string;
    ID: number;
}

interface BuyOrder {
    id: string;
    ID: number;
    Date: string;
    Total: string;
    Status: string;
    Items: string[];
    Voided: boolean;
}

interface Provider {
    id: string;
    ID: number;
    Name: string;
    Location: string;
    Voided: boolean;
    branchOffices: BranchOffice[];
    routes: Route[];
    buyOrders: BuyOrder[];
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

                const formattedProviders = response.data.providers.map(provider => ({
                    id: provider.id,
                    ID: provider.ID,
                    Name: provider.Name,
                    Location: provider.Location,
                    Voided: provider.Voided,
                    branchOffices: provider.branchOffices.map(bo => ({
                        id: bo.id,
                        Name: bo.Name,
                        relationshipType: bo.relationshipType,
                        ID: bo.ID,
                        Location: bo.Location,
                        Voided: bo.Voided,
                        Income: bo.Income
                    })),
                    routes: provider.routes.map(route => ({
                        id: route.id,
                        Name: route.Name,
                        Distance_KM: route.Distance_KM,
                        relationshipType: route.relationshipType,
                        Start_date: route.Start_date,
                        End_date: route.End_date,
                        Voided: route.Voided,
                        Company: route.Company,
                        ID: route.ID
                    })),
                    buyOrders: provider.buyOrders.map(order => ({
                        id: order.id,
                        ID: order.ID,
                        Date: order.Date,
                        Total: order.Total,
                        Status: order.Status,
                        Items: order.Items,
                        Voided: order.Voided
                    }))
                }));

                setProviders(formattedProviders);
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


// Tipo para el request
interface CreateProviderRequest {
    id: number;
    name: string;
    location: string;
}

// Tipo para la respuesta
interface CreatedProviderResponse {
    id: string;
    ID: number;
    Voided: boolean;
    Name: string;
    Location: string;
}

// Hook para crear provider
export function useCreateProvider() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const createProvider = async (providerData: CreateProviderRequest): Promise<CreatedProviderResponse | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.post<CreatedProviderResponse>('/providers', providerData);
            return response.data;  // Retorna el proveedor creado
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear el proveedor');
            return null;  // En caso de error retorna null
        } finally {
            setLoading(false);
        }
    };

    return { createProvider, loading, error };
}

// El hook
export function useSearchProvider() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [providers, setProviders] = useState<Provider[]>([]);

    const searchProvider = async (name: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.get(`/providers/search/${encodeURIComponent(name)}`);
            setProviders(response.data.providers);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al buscar proveedor');
        } finally {
            setLoading(false);
        }
    };

    return {
        providers,
        loading,
        error,
        searchProvider
    };
}



// Tipos de relación entre provider y otros nodos
type ProviderRelationshipType = 'PROVIDES_TO' | 'USE';

// Request que espera el hook
interface CreateProviderRelationshipRequest {
    sourceId: string;
    targetId: string;
    sourceType: 'provider';
    targetType: 'branchOffice' | 'route';
    quantity_of_orders_in_time?: number;
    type_product?: string;
    range_client?: string;
    cost_of_operation?: number;
    status_payment?: string;
    type_vehicle?: string;
}

// Respuesta que devuelve el backend al crear la relación
interface CreatedProviderRelationshipResponse {
    message: string;
    sourceId: string;
    targetId: string;
    relationshipType: ProviderRelationshipType;
    properties: Record<string, any>;
}

// Hook para crear relaciones de providers
export function useCreateProviderRelationship() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const createProviderRelationship = async (data: CreateProviderRelationshipRequest): Promise<CreatedProviderRelationshipResponse | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.post<CreatedProviderRelationshipResponse>('/provider/relationshipProvider', data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear la relación');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { createProviderRelationship, loading, error };
}
