import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebaseconfig";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "hospital" | "bloodbank" | "admin";
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAuthorized(false);
        setLoading(false);
        navigate("/admin");
        return;
      }

      if (!requiredRole) {
        setIsAuthorized(true);
        setLoading(false);
        return;
      }

      try {
        // 1. First check quick fallback in localStorage
        const cachedRole = localStorage.getItem("userType");
        if (cachedRole === requiredRole) {
          setIsAuthorized(true);
          setLoading(false);
          return;
        }

        // 2. Fetch ground truth directly from Firestore 'users' collection
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === requiredRole || userData.role === "admin") {
            localStorage.setItem("userType", userData.role);
            localStorage.setItem("uid", user.uid);
            setIsAuthorized(true);
          } else {
            console.warn("Role mismatch: user is", userData.role, "required:", requiredRole);
            navigate("/admin");
          }
        } else {
          // If no users doc exists, fallback check if document exists in 'hospitals' collection
          const hospitalDoc = await getDoc(doc(db, "hospitals", user.uid));
          if (hospitalDoc.exists() && requiredRole === "hospital") {
            localStorage.setItem("userType", "hospital");
            localStorage.setItem("uid", user.uid);
            setIsAuthorized(true);
          } else {
            navigate("/admin");
          }
        }
      } catch (error) {
        console.error("Error verifying user role:", error);
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm text-gray-500 font-medium">Verifying authorization...</p>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}