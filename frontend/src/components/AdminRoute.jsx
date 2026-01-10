import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const { data } = await axios.get('https://tunist-user-service.onrender.com/api/v1/user/me', {
          headers: { token },
        });

        if (data.role === 'admin' || data.user?.role === 'admin') {
          setIsAdmin(true);
        } else {
          alert('Access Denied: Admin privileges required');
          navigate('/');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white text-xl">Verifying admin access...</div>
      </div>
    );
  }

  return isAdmin ? children : null;
};

export default AdminRoute;
