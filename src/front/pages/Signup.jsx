import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Signup = () => {
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

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        try {
            setLoading(true);
            await actions.signup({ email, password });
            navigate("/login");
        } catch (submitError) {
            setErrorStatus(submitError.status || null);
            setError(submitError.message || "No se pudo completar el registro.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5" style={{ maxWidth: "560px" }}>
            <h1 className="mb-4">Crear cuenta</h1>

            <form onSubmit={onSubmit} className="card p-4 shadow-sm">
                <div className="mb-3">
                    <label htmlFor="signupEmail" className="form-label">Email</label>
                    <input
                        id="signupEmail"
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
                    <label htmlFor="signupPassword" className="form-label">Contraseña</label>
                    <input
                        id="signupPassword"
                        name="password"
                        type="password"
                        className="form-control"
                        value={formData.password}
                        onChange={onChange}
                        placeholder="Mínimo 6 caracteres"
                        autoComplete="new-password"
                    />
                </div>

                {error ? (
                    <div className="alert alert-danger" role="alert">
                        <strong>Error:</strong> {error}
                        {errorStatus === 409 ? (
                            <div className="mt-2">Prueba iniciar sesión o usar otro email.</div>
                        ) : null}
                    </div>
                ) : null}

                <button type="submit" className="btn btn-success" disabled={loading}>
                    {loading ? "Creando cuenta..." : "Registrarme"}
                </button>
            </form>

            <p className="mt-3 mb-0">
                ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
        </div>
    );
};
