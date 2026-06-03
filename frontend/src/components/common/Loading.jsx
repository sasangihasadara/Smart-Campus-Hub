import { useEffect, useContext } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"; // Adapted to existing AuthContext

const Loading = () => {
  const { path } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  // Adapted to existing context structure if available
  // const { backendUrl, getToken } = useContext(AppContext); 
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const verifyStripePayment = async () => {
      if (sessionId) {
        try {
          // Token logic depends on your Auth implementation
          // await axios.post(`${backendUrl}/verify-purchase`, { sessionId }, { headers: { Authorization: `Bearer ${token}` }});
          console.log("Verifying payment for session:", sessionId);
        } catch (error) {
          console.log(error);
        }
      }
    };

    if (path) {
      if (sessionId) {
          verifyStripePayment();
      }

      const timer = setTimeout(() => {
        navigate(`/${path}`);
      }, sessionId ? 2000 : 5000);

      // Cleanup the timer on component unmount
      return () => clearTimeout(timer);
    }
  }, [path, sessionId, navigate, backendUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-16 sm:w-20 aspect-square border-4 border-blue-100 border-t-4 border-t-blue-600 rounded-full animate-spin shadow-lg"></div>
    </div>
  );
};

export default Loading;
