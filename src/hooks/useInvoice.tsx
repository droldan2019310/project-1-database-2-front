import { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';

// Definir la estructura de Date (porque viene como un objeto anidado en Neo4j)
interface Neo4jDate {
    year: { low: number; high: number };
    month: { low: number; high: number };
    day: { low: number; high: number };
}

// Estructura de un producto relacionado (si aplica)
interface Product {
    id: string;
    Name: string;
    Price: number;
    Category: string;
    relationshipType: string;
}

// Estructura de la factura
interface Invoice {
    id: string;
    Status: string;
    Cashier_main: string;
    Total: number;
    NIT: string;
    ID: number;
    Date: Neo4jDate;
    Notes: string;
    Name: string;
    products: Product[]; // Si ya el endpoint devuelve productos relacionados (opcional)
}

// Respuesta paginada completa
interface PaginatedInvoicesResponse {
    page: number;
    limit: number;
    totalPages: number;
    totalInvoices: number;
    invoices: Invoice[];
}

// Helper para convertir el Neo4jDate a un string legible (YYYY-MM-DD)
const formatNeo4jDate = (date?: Neo4jDate): string => {
    if (!date || !date.year || !date.month || !date.day) {
        return 'Fecha no disponible';
    }
    const year = date.year.low;
    const month = String(date.month.low).padStart(2, '0');
    const day = String(date.day.low).padStart(2, '0');
    return `${year}-${month}-${day}`;
};


export function useGetInvoices(page: number = 1) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInvoices = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.get<PaginatedInvoicesResponse>(`/invoices?page=${page}&limit=5`);

                // Convertimos la fecha de Neo4j (Date) a un string común para que sea más fácil de usar
                const formattedInvoices = response.data.invoices.map(invoice => ({
                    ...invoice,
                    formattedDate: formatNeo4jDate(invoice.Date)
                }));

                setInvoices(formattedInvoices);
                setTotalPages(response.data.totalPages);

            } catch (err: any) {
                setError(err.message || 'Error al obtener facturas');
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, [page]);

    return { invoices, totalPages, loading, error };
}
