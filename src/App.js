import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./component/Auth.js";
import Home from "./component/Home.js";
import ChangePassword from "./component/ChangePassword.js";
import ReviewSlider from "./component/ReviewSlider.js";
import Profile from "./component/Profile.jsx";
import MainLayout from "./component/MainLayout.js";
import Service from "./component/Service.js";
import  History  from "./component/History.js";
import FeedbackForm from "./component/FeedbackForm.js";
import Products from "./component/Products.js";
import ProductDetail from "./component/ProductDetail.jsx";
import Cart from "./component/Cart.jsx";
import { CartProvider } from "./CartContext";
import OrderHistory from "./component/OrderHistory";
import About from "./component/About";
import ProtectedRoute from "./component/ProtectedRoute";
import Admin from "./Admin/Admin.js";
import UserManagement from "./Admin/UserManagement.js";
import ServiceManagement from "./Admin/ServiceManagement.js";
import ProductManagement from "./Admin/ProductManagement.js";
import OrderManagement from "./Admin/OrderManagement.js"
import ReviewManagement from "./Admin/ReviewManagement.js";
import AppointmentManagement from "./Admin/AppointmentManagement.js";
import { AppointmentProvider } from "./context/AppointmentContext";
import Layout from "./component/Layout";
import Account from "./component/Account";


function App() {
  return (
    <CartProvider>
      <AppointmentProvider>
    <Router>
      <Routes>
      <Route element={<Layout />}>
        
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/ChangePassword" element={<MainLayout><ChangePassword /></MainLayout>} />
        <Route path="/ReviewSlider" element={<MainLayout><ReviewSlider /></MainLayout>} />
        <Route path="/Profile" element={<MainLayout><Profile /></MainLayout>} />
        <Route path="/Service" element={<MainLayout><Service /></MainLayout>} />
        <Route path="/History" element={<MainLayout><History /></MainLayout>} />
        <Route path="/FeedbackForm" element={<MainLayout><FeedbackForm /></MainLayout>} />
        <Route path="/Products" element={<MainLayout><Products /></MainLayout>} />
        <Route path="/ProductDetail/:name" element={<MainLayout><ProductDetail /></MainLayout>} />
        <Route path="/cart" element={<MainLayout><Cart /></MainLayout>} />
        <Route path="/OrderHistory" element={<MainLayout><OrderHistory /></MainLayout>} />
        <Route path="/About" element={<MainLayout><About /></MainLayout>} />
        <Route path="/ProtectedRoute" element={<MainLayout><ProtectedRoute /></MainLayout>} />
        <Route path="/account" element={<Account />} />
        </Route>
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<ProtectedRoute allowedUserTypeId={1} />} />
        <Route path="/UserManagement" element={<UserManagement />} />
        <Route path="/ServiceManagement" element={<ServiceManagement />} />
        <Route path="/ProductManagement" element={<ProductManagement />} /> 
        <Route path="/OrderManagement" element={<OrderManagement />} />
        <Route path="/ReviewManagement" element={<ReviewManagement />} />
        <Route path="/AppointmentManagement" element={<AppointmentManagement />} />
      </Routes>
    </Router>
    </AppointmentProvider>
    </CartProvider>
  );
}

export default App;
