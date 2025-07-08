import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Nav,
  Navbar as BSNavbar,
  NavDropdown,
} from "react-bootstrap";
import {
  FaUserCircle,
  FaHeart,
  FaShoppingCart,
  FaComments,
  FaHome,
  FaBars,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaCogs,
  FaBoxOpen,
  FaPlusCircle,
  FaStore,
} from "react-icons/fa";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isAuthenticated = !!user;
  const role = user?.role;

  const isActive = (path: string) => location.pathname.startsWith(path);

  const getDashboardPath = () => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "business") return "/business/dashboard";
    return "/client/dashboard";
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <BSNavbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm">
      <Container>
        <BSNavbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center">
          <img
            src={logo}
            alt="TomiLink Logo"
            width="40"
            height="40"
            className="me-2 rounded-circle"
          />
          TomiLink
        </BSNavbar.Brand>

        <BSNavbar.Toggle aria-controls="main-navbar" />
        <BSNavbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" active={isActive("/")}>
              <FaHome className="me-1" /> Home
            </Nav.Link>
            <Nav.Link as={Link} to="/browse" active={isActive("/browse")}>
              <FaBars className="me-1" /> Browse
            </Nav.Link>
            <Nav.Link as={Link} to="/products" active={isActive("/products")}>
              <FaStore className="me-1" /> All Products
            </Nav.Link>

            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/favorites" active={isActive("/favorites")}>
                  <FaHeart className="me-1" /> Favorites
                </Nav.Link>
                <Nav.Link as={Link} to="/orders" active={isActive("/orders")}>
                  <FaShoppingCart className="me-1" /> Orders
                </Nav.Link>
                <Nav.Link as={Link} to="/chat" active={isActive("/chat")}>
                  <FaComments className="me-1" /> Chat
                </Nav.Link>
                <Nav.Link as={Link} to={getDashboardPath()} active={isActive(getDashboardPath())}>
                  <FaUserCircle className="me-1" /> Dashboard
                </Nav.Link>

                {role === "business" && (
                  <>
                    <Nav.Link
                      as={Link}
                      to="/business/products"
                      active={isActive("/business/products")}
                    >
                      <FaBoxOpen className="me-1" /> My Products
                    </Nav.Link>
                    <Nav.Link
                      as={Link}
                      to="/business/products/add"
                      active={isActive("/business/products/add")}
                    >
                      <FaPlusCircle className="me-1" /> Add Product
                    </Nav.Link>
                  </>
                )}
              </>
            )}
          </Nav>

          <Nav>
            {!isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/login" active={isActive("/login")}>
                  <FaSignInAlt className="me-1" /> Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register" active={isActive("/register")}>
                  <FaUserPlus className="me-1" /> Register
                </Nav.Link>
              </>
            ) : (
              <NavDropdown
                title={
                  <span>
                    <FaUserCircle className="me-1" /> Account
                  </span>
                }
                id="account-nav-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  <FaUserCircle className="me-2" /> Profile
                </NavDropdown.Item>

                {role === "admin" && (
                  <NavDropdown.Item as={Link} to="/admin/dashboard">
                    <FaCogs className="me-2" /> Admin Panel
                  </NavDropdown.Item>
                )}

                <NavDropdown.Item as={Link} to="/settings">
                  <FaCogs className="me-2" /> Settings
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" /> Logout
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;
