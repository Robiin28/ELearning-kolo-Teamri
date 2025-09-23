import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useToast, Spinner, Center } from "@chakra-ui/react";
import axiosInstance from "../utils/AxiosInstance"; // Your axios instance

const ProtectedRoute = ({ children, requireAdmin }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Initially null to block content
  const [isLoading, setIsLoading] = useState(true); // Loading state for the auth check
  const [showRedirect, setShowRedirect] = useState(false); // Control when to redirect
  const toast = useToast();

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axiosInstance.get("/auth/check", { headers: { Authorization: `Bearer ${token}` } });

      if (response.data.status === "success") {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false); // End loading state after check
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      toast({
        title: "Authentication required.",
        description: "Please log in to access this page.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });

      const timer = setTimeout(() => {
        setShowRedirect(true);
      }, 2000);

      return () => clearTimeout(timer); // Clean up timeout if component unmounts
    }
  }, [isAuthenticated, toast]);

  // Show spinner while checking authentication status
  if (isLoading) {
    return (
      <Center height="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }
  if (showRedirect) {
    return <Navigate to="/" replace />;
  }

  // Check if the user is authenticated
  if (isAuthenticated) {
   
    const userRole = localStorage.getItem("userRole"); 
    if (requireAdmin && userRole !== "admin") {
      return <Navigate to="/" replace />; 
    }
    return children;
  }

  return null;
};

export default ProtectedRoute;
