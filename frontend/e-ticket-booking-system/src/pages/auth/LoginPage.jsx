import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { getApiBaseUrl } from '../../utils/url';

import logo from "../../assets/images/logo.png";
import illu from "../../assets/images/illu.png";
import logogg from "../../assets/images/gglogo.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await login(form.email, form.password);
      if (userData?.status === 'INACTIVE') {
        navigate('/verify-email', { state: { email: form.email } });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Đăng nhập thất bại!";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${getApiBaseUrl()}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen bg-[#D9D9D9] flex items-center justify-center p-4 font-montserrat">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full min-h-[600px] flex overflow-hidden animate-fade-in">
        
        {/* LEFT - FORM */}
        <div className="flex-1 p-12 flex flex-col justify-center bg-white">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="font-playwrite text-2xl mb-2 mt-4">Xin chào,</h2>
            <p className="text-2xl text-gray-900 mb-8 font-extrabold uppercase">
              Đăng nhập tài khoản
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email của bạn"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full h-12 px-5 border border-gray-300 rounded-lg focus:border-primary outline-none transition-colors font-medium"
              />

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mật khẩu"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full h-12 px-5 pr-12 border border-gray-300 rounded-lg focus:border-primary outline-none transition-colors font-medium"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary hover:bg-red-600 text-white font-bold rounded-lg disabled:opacity-50 transition-colors uppercase tracking-wide mt-2"
              >
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-gray-500 text-sm font-semibold">
                  HOẶC
                </span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full h-12 border border-gray-300 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <img src={logogg} alt="Google" className="w-5 h-5" />
              <span className="font-bold text-gray-700">Đăng nhập với Google</span>
            </button>

            <p className="text-center mt-8 text-gray-600 font-medium">
              Bạn chưa có tài khoản?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Tạo tài khoản
              </Link>
            </p>
          </div>
        </div>

        {/* RIGHT - BANNER */}
        <div className="bg-primary flex-1 relative hidden md:flex">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-8">
            <img src={logo} alt="TickeZ" className="w-72 mb-4 drop-shadow-lg" />
            <p className="text-2xl font-bold tracking-wider mb-10 uppercase drop-shadow-md">
              Vé liền tay - TickeZ. ngay
            </p>
            <img
              src={illu}
              alt="Illustration"
              className="w-[90%] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;