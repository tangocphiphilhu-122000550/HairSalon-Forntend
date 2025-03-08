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

function App() {
  return (
    <CartProvider>
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
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
      </Routes>
    </Router>
    </CartProvider>
  );
}

export default App;
