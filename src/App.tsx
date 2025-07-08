import React from "react";
import { Routes, Route } from "react-router-dom";

// Public Pages
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import AllProducts from "./pages/AllProducts";
import ProductDetail from "./pages/ProductDetail";
import BusinessProfile from "./pages/BusinessProfile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import PaymentPage from "./pages/PaymentPage"; // ✅ M-Pesa Payment Page

// Protected Pages
import Chat from "./pages/Chat";
import Orders from "./pages/Orders";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";

// Dashboards
import ClientDashboard from "./pages/dashboards/ClientDashboard";
import BusinessDashboard from "./pages/dashboards/BusinessDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";

// Business Pages
import BusinessProducts from "./pages/BusinessProducts";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import EditBusinessProfile from "./pages/EditBusinessProfile";
import ManageServices from "./pages/ManageServices";

// ✅ Global & Business-specific Services Page
import BusinessServices from "./pages/BusinessServices";

// Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Context and Route Protection
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1 py-4">
          <Routes>
            {/* ✅ Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/products" element={<AllProducts />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/business-profile/:id" element={<BusinessProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/payment" element={<PaymentPage />} /> {/* ✅ Added Payment Route */}
            <Route path="*" element={<NotFound />} />

            {/* ✅ Business Profile & Services */}
            <Route path="/business/:id" element={<BusinessProfile />} />
            <Route path="/business/:id/services" element={<BusinessServices />} />

            {/* ✅ Global Services (View All Services Offered) */}
            <Route path="/business-services" element={<BusinessServices />} />

            {/* ✅ Protected Shared Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/chat" element={<Chat />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* ✅ Client Dashboard */}
            <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
              <Route path="/client/dashboard" element={<ClientDashboard />} />
            </Route>

            {/* ✅ Business Dashboard */}
            <Route element={<ProtectedRoute allowedRoles={["business"]} />}>
              <Route path="/business/dashboard" element={<BusinessDashboard />} />
              <Route path="/business/products" element={<BusinessProducts />} />
              <Route path="/business/products/add" element={<AddProduct />} />
              <Route path="/business/products/edit/:id" element={<EditProduct />} />
              <Route path="/business/edit-profile" element={<EditBusinessProfile />} />
              <Route path="/business/services" element={<ManageServices />} />
            </Route>

            {/* ✅ Admin Dashboard */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;
