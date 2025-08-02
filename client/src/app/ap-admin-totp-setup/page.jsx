"use client";
import TOTPSetup from "../../component/adminPanelComponent/TOTPSetup";
import { useAuth } from "../../utilities/authMiddleware";

export default function TOTPSetupPage() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
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

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null; // Router will handle redirect
  }

  return <TOTPSetup />;
}
