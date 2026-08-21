import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
	const navigate = useNavigate();
	const { store, actions } = useGlobalReducer();

	const hasToken = !!(store.token || sessionStorage.getItem("token"));

	const handleLogout = () => {
		actions.logout();
		navigate("/login");
	};

	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container">
				<Link to="/">
					<span className="navbar-brand mb-0 h1">React Boilerplate</span>
				</Link>
				<div className="ml-auto">
					{!hasToken ? (
						<>
							<Link to="/signup" className="me-2">
								<button className="btn btn-outline-success">Signup</button>
							</Link>
							<Link to="/login">
								<button className="btn btn-primary">Login</button>
							</Link>
						</>
					) : (
						<>
							<Link to="/private" className="me-2">
								<button className="btn btn-outline-primary">Private</button>
							</Link>
							<button className="btn btn-danger" onClick={handleLogout}>Logout</button>
						</>
					)}
				</div>
			</div>
		</nav>
	);
};