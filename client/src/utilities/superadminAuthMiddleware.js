"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

export const useSuperadminAuth = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify`,
          {
            withCredentials: true,
          }
        );

        if (
          response.data.authenticated &&
          response.data.user.role === "superadmin"
        ) {
          setIsAuthenticated(true);
          setUser(response.data.user);
        } else {
          // Not authenticated or not superadmin
          toast.error("Please log in to access the superadmin panel", {
            duration: 3000,
            position: "top-right",
          });
          setTimeout(() => {
            router.push("/superadmin-auth");
          }, 1000); // Redirect after 1 second
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        toast.error("Authentication required. Please log in.", {
          duration: 3000,
          position: "top-right",
        });
        setTimeout(() => {
          router.push("/superadmin-auth");
        }, 1000); // Redirect after 1 second
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return { isAuthenticated, isLoading, user };
};

// Higher-order component for protecting superadmin routes
export const withSuperadminAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading } = useSuperadminAuth();

    // Always render loading spinner initially
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying authentication...</p>
          </div>
        </div>
      );
    }

    // After loading, if not authenticated, render nothing (client will handle redirect)
    if (!isAuthenticated) {
      return null;
    }

    // Authenticated: render the protected component
    return <Component {...props} />;
  };
};
