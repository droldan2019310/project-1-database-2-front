import { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';

// Interfaces según el JSON que me diste
interface BranchOffice {
    id: string;
    Income: string;
    ID: number;
    Name: string;
    Location: string;
    relationshipType: string;
}

interface Product {
    id: string;
    Category: string;
    Price: string;
    Expiration_date: string;
    ID: number;
    Name: string;
    TagsArray: string[];
    relationshipType: string;
}

interface Route {
    id: string;
    Company: string;
    Distance_KM: string;
    ID: number;
    Start_date: string;
    End_date: string;
    Name: string;
    branchOffice: BranchOffice | null;
    products: Product[];
}

interface PaginatedRoutesResponse {
    page: number;
    limit: number;
    totalPages: number;
    totalRoutes: number;
    routes: Route[];
}

// Hook
export function useGetRoutes(page: number = 1) {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRoutes = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.get<PaginatedRoutesResponse>(`/route?page=${page}&limit=5`);
                
                setRoutes(response.data.routes);
                setTotalPages(response.data.totalPages);

            } catch (err: any) {
                setError(err.message || 'Error al obtener rutas');
            } finally {
                setLoading(false);
            }
        };

        fetchRoutes();
    }, [page]);

    return { routes, totalPages, loading, error };
}



interface CreateRouteRequest {
    quantity: number;
    delivery_name: string;
    arrive_date: string;
    arrive_hour: string;
    company: string;
    distance_km: number;
}

interface CreatedRouteResponse {
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

export function useCreateRoute() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const createRoute = async (routeData: CreateRouteRequest): Promise<CreatedRouteResponse | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.post<CreatedRouteResponse>('/route', routeData);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear la ruta');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { createRoute, loading, error };
}
