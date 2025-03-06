import { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';



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

export interface Provider {
    id: string;
    Name: string;
    Location: string;
}

export interface BranchOffice {
    id: string;
    Name: string;
    Location: string;
    Income: string;
}

export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    tags: string[];
    expiration_date: string;
    provider: Provider | null;
    branchOffices: BranchOffice[];
}

interface PaginatedResponse {
    products: any[];
    totalPages: number;
}

// Hook actualizado
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
                const response = await axiosInstance.get<PaginatedResponse>(`/product?page=${page}&limit=5`);
                const { products: rawProducts, totalPages } = response.data;

                const formattedProducts: Product[] = rawProducts.map((item: any) => ({
                    id: item.id,
                    name: item.Name,
                    category: item.Category,
                    price: parseFloat(item.Price),
                    tags: item.TagsArray || [],
                    expiration_date: item.Expiration_date,
                    provider: item.provider
                        ? {
                            id: item.provider.id,
                            Name: item.provider.Name,
                            Location: item.provider.Location
                        }
                        : null,
                    branchOffices: item.branchOffices?.map((branch: any) => ({
                        id: branch.id,
                        Name: branch.Name,
                        Location: branch.Location,
                        Income: branch.Income
                    })) || []
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
    }, [page]);

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


interface CreateProductRequest {
    name: string;
    category: string;
    price: number;
    tags: string[];
    expiration_date: string;
}

interface CreatedProductResponse {
    id: string;
    Name: string;
    Category: string;
    Price: number;
    Tags: string[];
    Expiration_date: string;
    Voided: boolean;
}

export function useCreateProduct() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const createProduct = async (productData: CreateProductRequest) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.post<CreatedProductResponse>('/product', productData);
            return response.data;  
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear el producto');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { createProduct, loading, error };
}




export function useGetProductByName(name: string) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.get<Product>(`/product/name/${name}`);
                setProduct(response.data);
            } catch (err: any) {
                setError(err.message || 'Error al obtener producto');
            } finally {
                setLoading(false);
            }
        };

        if (name) {
            fetchProduct();
        } else {
            setProduct(null);  // Si no hay nombre, no buscar
        }
    }, [name]);

    return { product, loading, error };
}



export interface CreateProductRelationshipRequest {
    sourceId: string;
    targetId: string;
    relationshipType: string;
    stock?: number;
    create_date?: string;
    time_to_create?: string;
    actual_stock?: number;
    buy_date?: string;
    minimum_stock?: number;
}

export interface CreatedRelationshipResponse {
    message: string;
    sourceId: string;
    targetId: string;
    relationshipType: string;
    properties: Record<string, any>;
}

export function useCreateProductRelationship() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const createRelationship = async (data: CreateProductRelationshipRequest): Promise<CreatedRelationshipResponse | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.post<CreatedRelationshipResponse>("/product/relationship", data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || "Error al crear relación.");
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { createRelationship, loading, error };
}

