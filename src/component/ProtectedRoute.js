import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom"; // Bỏ Outlet nếu không cần
import { getToken } from "../utils/tokenStorage";
import { jwtDecode } from "jwt-decode";
import Admin from "../Admin/Admin.js"; // Import trực tiếp Admin

const ProtectedRoute = ({ allowedUserTypeId = 1 }) => {
  const [userTypeId, setUserTypeId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserType = async () => {
      try {
        const token = await getToken();
        if (token) {
          const decodedToken = jwtDecode(token);
          setUserTypeId(decodedToken.user_type_id);
        } else {
          setUserTypeId(null);
        }
      } catch (error) {
        setUserTypeId(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserType();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (userTypeId !== allowedUserTypeId) {
    return <Navigate to="/" replace />;
  }
  return <Admin />; // Render trực tiếp thay vì Outlet
};

export default ProtectedRoute;