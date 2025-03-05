import { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';

// Interfaces según la respuesta que compartiste
interface BranchOffice {
    id: string;
    Income: string;
    ID: number;
    Name: string;
    Location: string;
}

interface Provider {
    id: string;
    ID: number;
    Name: string;
    Location: string;
    Voided?: boolean | string;
}

interface Route {
    id: string;
    Company: string;
    Distance_KM: number;
    ID: number;
    Start_date: string;
    End_date: string;
    Name: string;
    Voided?: boolean;
}

// Estructura de un item de la respuesta
interface BadDistributedBranch {
    branchOffice: BranchOffice;
    provider: Provider;
    route: Route;
}

// Hook principal
export function useGetBadDistributedBranches() {
    const [data, setData] = useState<BadDistributedBranch[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBadDistributedBranches = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.get<BadDistributedBranch[]>('/branchoffice/needs-distribution');

                // Si quieres, puedes limpiar el dato de Voided o hacer transformaciones
                const cleanData = response.data.map(item => ({
                    ...item,
                    provider: {
                        ...item.provider,
                        Voided: item.provider.Voided === "True" || item.provider.Voided === true
                    }
                }));

                setData(cleanData);

            } catch (err: any) {
                setError(err.message || 'Error al obtener sucursales con mala distribución');
            } finally {
                setLoading(false);
            }
        };

        fetchBadDistributedBranches();
    }, []);

    return { data, loading, error };
}




// Definir la interfaz para cada sucursal
interface BranchOffice {
    id: string;
    Income: string;
    ID: number;
    Name: string;
    Location: string;
    salesCount: number;
}

export function useGetTopSalesBranchOffices() {
    const [branchOffices, setBranchOffices] = useState<BranchOffice[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTopSalesBranches = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.get<BranchOffice[]>('/branchoffice/top-sales');
                setBranchOffices(response.data);
            } catch (err: any) {
                setError(err.message || 'Error al obtener las sucursales con más ventas');
            } finally {
                setLoading(false);
            }
        };

        fetchTopSalesBranches();
    }, []);

    return { branchOffices, loading, error };
}





// Hook personalizado para obtener la ruta más cargada
export const useGetMostLoadedRoute = () => {
    const [route, setRoute] = useState<Route | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMostLoadedRoute = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.get("/route/most-loaded");
                setRoute(response.data);  // Solo trae 1 objeto
            } catch (err: any) {
                setError(err.message || "Error al obtener la ruta más cargada");
            } finally {
                setLoading(false);
            }
        };

        fetchMostLoadedRoute();
    }, []);

    return { route, loading, error };
};



interface ProviderSales {
    provider: string;
    sales: number;
}

export function useGetTopProviders() {
    const [topProviders, setTopProviders] = useState<ProviderSales[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTopProviders = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.get('/providers/top-providers');
                
                const formattedProviders = response.data.map((item: any) => ({
                    provider: item.provider,
                    sales: item.sales.low // Solo tomamos el 'low', ya que 'high' es parte de la estructura interna de Neo4j (INT).
                }));

                setTopProviders(formattedProviders);
            } catch (err: any) {
                setError(err.message || "Error al obtener los proveedores con más ventas");
            } finally {
                setLoading(false);
            }
        };

        fetchTopProviders();
    }, []);

    return { topProviders, loading, error };
}




// Definir la interfaz del producto más comprado
interface MostPurchasedProduct {
    id: string;
    Category: string;
    Price: string;
    Expiration_date: string;
    ID: number;
    Name: string;
    TagsArray: string[];
    purchaseCount: number;
}

export const useGetMostPurchasedProduct = () => {
    const [product, setProduct] = useState<MostPurchasedProduct | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMostPurchasedProduct = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.get('/product/most-purchased');
                setProduct(response.data);
            } catch (err: any) {
                setError(err.message || 'Error al obtener el producto más comprado');
            } finally {
                setLoading(false);
            }
        };

        fetchMostPurchasedProduct();
    }, []);

    return { product, loading, error };
};



// Interfaz para la estructura de la respuesta
interface DatePart {
    low: number;
    high: number;
}

interface ArriveDate {
    year: DatePart;
    month: DatePart;
    day: DatePart;
}

interface LongestTimeRoute {
    id: string;
    Arrive_hour: string;
    Quantity: number;
    Delivery_name: string;
    Arrive_date: ArriveDate;
    Voided: boolean;
    duration: string | null;
}

// Hook
export const useGetLongestTimeRoute = () => {
    const [route, setRoute] = useState<string>('Desconocida');
    const [deliveryName, setDeliveryName] = useState<string>('Desconocido');
    const [arriveDate, setArriveDate] = useState<string>('Desconocida');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLongestTimeRoute = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.get<LongestTimeRoute>('/route/longest-time');
                const data = response.data;

                const formattedDate = `${data.Arrive_date.year.low}-${String(data.Arrive_date.month.low).padStart(2, '0')}-${String(data.Arrive_date.day.low).padStart(2, '0')}`;

                setRoute(`Llegada: ${formattedDate} ${data.Arrive_hour}`);
                setDeliveryName(data.Delivery_name);
                setArriveDate(formattedDate);
            } catch (err: any) {
                setError(err.message || 'Error al obtener la ruta con mayor tiempo');
            } finally {
                setLoading(false);
            }
        };

        fetchLongestTimeRoute();
    }, []);

    return { route, deliveryName, arriveDate, loading, error };
};
