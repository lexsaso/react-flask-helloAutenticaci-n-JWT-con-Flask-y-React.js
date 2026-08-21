import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Private = () => {
    const { store, actions } = useGlobalReducer();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadPrivateData = async () => {
            try {
                await actions.fetchPrivate();
            } catch (requestError) {
                setError(requestError.message || "No se pudo cargar la información privada.");
            } finally {
                setLoading(false);
            }
        };

        loadPrivateData();
    }, [actions]);

    if (loading) {
        return (
            <div className="container py-5">
                <p>Validando acceso...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h1 className="mb-3">Zona privada</h1>
            {error ? <div className="alert alert-warning">{error}</div> : null}
            <p className="lead mb-2">{store.privateMessage || "Acceso concedido"}</p>
            <p className="mb-0">
                Usuario autenticado: <strong>{store.user?.email || "Sin email disponible"}</strong>
            </p>
        </div>
    );
};
