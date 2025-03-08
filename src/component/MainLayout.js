import React from "react";
import Header from "./Header.js";
import Footer from "./Footer.js";

const MainLayout = ({ children }) => {
  return (
    <div className="layout-container">
      <Header />
      <main className="content">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
