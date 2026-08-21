import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Login = () => {
    const navigate = useNavigate();
    const { actions } = useGlobalReducer();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [errorStatus, setErrorStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const onChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setErrorStatus(null);

        const email = formData.email.trim().toLowerCase();
        const password = formData.password;

        if (!email || !password) {
            setError("Email y password son obligatorios.");
            return;
        }

        try {
            setLoading(true);
            await actions.login({ email, password });
            navigate("/private");
        } catch (submitError) {
            setErrorStatus(submitError.status || null);
            setError(submitError.message || "Credenciales inválidas.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5" style={{ maxWidth: "560px" }}>
            <h1 className="mb-4">Iniciar sesión</h1>

            <form onSubmit={onSubmit} className="card p-4 shadow-sm">
                <div className="mb-3">
                    <label htmlFor="loginEmail" className="form-label">Email</label>
                    <input
                        id="loginEmail"
                        name="email"
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={onChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="loginPassword" className="form-label">Contraseña</label>
                    <input
                        id="loginPassword"
                        name="password"
                        type="password"
                        className="form-control"
                        value={formData.password}
                        onChange={onChange}
                        autoComplete="current-password"
                    />
                </div>

                {error ? (
                    <div className="alert alert-danger" role="alert">
                        <strong>Error:</strong> {error}
                        {errorStatus === 401 ? (
                            <div className="mt-2">Verifica tu email y contraseña e inténtalo nuevamente.</div>
                        ) : null}
                    </div>
                ) : null}

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Ingresando..." : "Entrar"}
                </button>
            </form>

            <p className="mt-3 mb-0">
                ¿No tienes cuenta? <Link to="/signup">Regístrate</Link>
            </p>
        </div>
    );
};
