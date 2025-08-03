"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

export const useUserAuth = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const refreshUser = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-user`,
        {
          withCredentials: true,
        }
      );

      if (response.data.authenticated) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        console.log("User refreshed:", response.data.user);
      }
    } catch (error) {
      console.error("User refresh failed:", error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-user`,
          {
            withCredentials: true,
          }
        );

        if (response.data.authenticated) {
          setIsAuthenticated(true);
          setUser(response.data.user);
          console.log(response.data.user);
        } else {
          // Not authenticated
          toast.error("Please log in to access the chat", {
            duration: 3000,
            position: "top-right",
          });
          setTimeout(() => {
            router.push("/auth");
          }, 1000); // Redirect after 1 second
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        toast.error("Authentication required. Please log in.", {
          duration: 3000,
          position: "top-right",
        });
        setTimeout(() => {
          router.push("/auth");
        }, 1000); // Redirect after 1 second
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return { isAuthenticated, isLoading, user, refreshUser };
};

// Higher-order component for protecting user routes
export const withUserAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading } = useUserAuth();

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

    if (!isAuthenticated) {
      return null; // Router will handle redirect
    }

    return <Component {...props} />;
  };
};
