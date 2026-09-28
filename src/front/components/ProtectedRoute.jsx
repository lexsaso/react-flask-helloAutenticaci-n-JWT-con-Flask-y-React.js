import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const ProtectedRoute = ({ children }) => {
    const { actions } = useGlobalReducer();
    const [checking, setChecking] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        let mounted = true;

        const validate = async () => {
            const token = sessionStorage.getItem("token");
            if (!token) {
                if (mounted) {
                    setAuthorized(false);
                    setChecking(false);
                }
                return;
            }

            const ok = await actions.checkAuth();
            if (mounted) {
                setAuthorized(ok);
                setChecking(false);
            }
        };

        validate();

        return () => {
            mounted = false;
        };
    }, [actions]);

    if (checking) {
        return (
            <div className="container py-5">
                <p>Validando sesión...</p>
            </div>
        );
    }

    return authorized ? children : <Navigate to="/login" replace />;
};
