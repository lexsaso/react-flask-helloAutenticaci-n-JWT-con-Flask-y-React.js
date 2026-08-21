export const initialStore = () => {
  const token =
    typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
  return {
    message: null,
    token,
    user: null,
    isAuthenticated: !!token,
    authChecked: false,
    privateMessage: "",
    authError: null,
    todos: [
      {
        id: 1,
        title: "Make the bed",
        background: null,
      },
      {
        id: 2,
        title: "Do my homework",
        background: null,
      },
    ],
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_hello":
      return {
        ...store,
        message: action.payload,
      };

    case "add_task":
      const { id, color } = action.payload;

      return {
        ...store,
        todos: store.todos.map((todo) =>
          todo.id === id ? { ...todo, background: color } : todo,
        ),
      };

    case "set_auth":
      return {
        ...store,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
        authError: null,
        authChecked: true,
      };

    case "set_auth_checked":
      return {
        ...store,
        authChecked: true,
      };

    case "set_private_message":
      return {
        ...store,
        privateMessage: action.payload,
      };

    case "clear_auth":
      return {
        ...store,
        token: null,
        user: null,
        isAuthenticated: false,
        privateMessage: "",
        authChecked: true,
        authError: null,
      };

    case "set_auth_error":
      return {
        ...store,
        authError: action.payload,
      };

    default:
      throw Error("Unknown action.");
  }
}

export const createActions = ({ dispatch, getStore }) => {
  const getBackendUrl = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl)
      throw new Error("VITE_BACKEND_URL is not defined in .env file");
    return backendUrl;
  };

  const authHeaders = () => {
    const token = getStore().token || sessionStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const parseAuthError = async (response, fallbackMessage) => {
    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    const statusMessageMap = {
      400: "Debes completar email y contraseña.",
      401: "Email o contraseña incorrectos.",
      403: "No autorizado para realizar esta acción.",
      409: "Este email ya está registrado.",
      500: "Error interno del servidor. Intenta nuevamente.",
    };

    const message =
      data.msg || statusMessageMap[response.status] || fallbackMessage;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  };

  return {
    signup: async ({ email, password }) => {
      const response = await fetch(`${getBackendUrl()}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return parseAuthError(response, "No se pudo completar el registro.");
      }

      const data = await response.json();

      return data;
    },

    login: async ({ email, password }) => {
      const response = await fetch(`${getBackendUrl()}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return parseAuthError(response, "No se pudo iniciar sesión.");
      }

      const data = await response.json();

      if (!data.access_token) {
        const error = new Error("La respuesta no incluyó un token válido.");
        error.status = 500;
        throw error;
      }

      sessionStorage.setItem("token", data.access_token);
      dispatch({
        type: "set_auth",
        payload: {
          token: data.access_token,
          user: data.user || null,
        },
      });

      return data;
    },

    logout: () => {
      sessionStorage.removeItem("token");
      dispatch({ type: "clear_auth" });
    },

    checkAuth: async () => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        dispatch({ type: "clear_auth" });
        return false;
      }

      try {
        const response = await fetch(`${getBackendUrl()}/api/private`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
        });

        const data = await response.json();

        if (!response.ok) {
          sessionStorage.removeItem("token");
          dispatch({ type: "clear_auth" });
          return false;
        }

        dispatch({
          type: "set_auth",
          payload: {
            token,
            user: data.user || null,
          },
        });
        dispatch({
          type: "set_private_message",
          payload: data.msg || "Access granted",
        });
        return true;
      } catch {
        sessionStorage.removeItem("token");
        dispatch({ type: "clear_auth" });
        return false;
      }
    },

    fetchPrivate: async () => {
      const response = await fetch(`${getBackendUrl()}/api/private`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Unauthorized");

      dispatch({
        type: "set_private_message",
        payload: data.msg || "Access granted",
      });
      if (data.user) {
        dispatch({
          type: "set_auth",
          payload: {
            token: getStore().token || sessionStorage.getItem("token"),
            user: data.user,
          },
        });
      }
      return data;
    },
  };
};
