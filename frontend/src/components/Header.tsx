import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-hot-toast';

export default function Header() {
  const { isLoggedIn, setUser } = useAuth();

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL_USER}/logout`, {
        method: "POST",
        credentials: "include"
      });
      setUser(null);
      localStorage.removeItem("user");
      toast.success("Logout successful!");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed! Please try again.");
    }
  };

  return (
    <header className="bg-[#81BFDA] text-black shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link to="/" className="text-xl font-bold">Fastest Fingers</Link>
        <nav className="flex gap-4 items-center">
          <Link to="/leaderboard" className="hover:text-gray-700">Leaderboard</Link>
          <Link to="/dashboard" className="hover:text-gray-700">My Stats</Link>

          {isLoggedIn ? (
            <>
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded bg-yellow-500 text-black hover:bg-yellow-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-700">Login</Link>
              <Link to="/register" className="hover:text-gray-700">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
