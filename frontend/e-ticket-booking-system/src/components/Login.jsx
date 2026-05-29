import { X, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import authService from "../services/authService"; // Thêm dòng này (điều chỉnh đường dẫn cho đúng cấu trúc thư mục)

import logo from "../assets/images/logo.png";
import illu from "../assets/images/illu.png";
import logogg from "../assets/images/gglogo.png";

export default function LoginModal({ isOpen, onClose, setIsLoggedIn, openRegister }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useAuth(); 
    
    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userData = await login(email, password);

            if (userData?.status === 'INACTIVE') {
                onClose();
                navigate('/verify-email', { state: { email } });
            } else {
                if (typeof setIsLoggedIn === 'function') {
                    setIsLoggedIn(true);
                }
                toast.success("Đăng nhập thành công!");
                
                if (userData?.role === 'ADMIN') {
                    navigate('/admin/dashboard');
                } else {
                    onClose();
                }
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại!";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        authService.loginWithGoogle(); // Gọi hàm từ authService
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full h-[600px] flex animate-fade-in overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Left */}
                    <div className="flex-1 p-12 flex flex-col justify-center">
                        <div className="max-w-sm mx-auto w-full">
                            <h2 className="font-playwrite text-xl mb-2 mt-4">Xin chào,</h2>
                            <p className="text-xl text-gray-900 mb-6 font-extrabold uppercase">
                                Đăng nhập tài khoản
                            </p>

                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <input
                                    type="email"
                                    placeholder="Email của bạn"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-12 px-5 border border-gray-300 rounded-lg focus:border-primary outline-none font-medium"
                                    required
                                />

                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Mật khẩu"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-12 px-5 pr-12 border border-gray-300 rounded-lg focus:border-primary outline-none font-medium"
                                        required
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
                                    className="w-full h-12 bg-primary hover:bg-red-600 text-white font-bold rounded-lg disabled:opacity-50 transition-colors uppercase tracking-wide"
                                >
                                    {loading ? "Đang xử lý..." : "Đăng nhập"}
                                </button>
                            </form>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-4 text-gray-500 font-semibold text-sm">HOẶC</span>
                                </div>
                            </div>

                            <button 
                                className="w-full h-12 border border-gray-300 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
                                onClick={handleGoogleLogin}
                            >
                                <img src={logogg} alt="Google" className="w-5 h-5" />
                                <span className="font-bold text-gray-700">Đăng nhập với Google</span>
                            </button>

                            <p className="text-center mt-8 text-gray-600 font-medium">
                                Bạn chưa có tài khoản? <br />
                                <button
                                    type="button"
                                    onClick={() => { onClose(); openRegister(); }}
                                    className="text-primary font-bold hover:underline mt-1"
                                >
                                    Tạo tài khoản
                                </button>
                            </p>
                        </div>
                    </div>

                    {/* Right */}
                    <div className="bg-primary flex-1 relative hidden md:flex">
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-8">
                            <img src={logo} alt="TickeZ" className="w-60 mb-2 drop-shadow-md" />
                            <p className="text-xl font-bold tracking-wider mb-8 uppercase drop-shadow-md">
                                vé liền tay - tickeZ. ngay
                            </p>
                            <img src={illu} alt="Illustration" className="w-[100%] object-contain drop-shadow-2xl" />
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors"
                        >
                            <X size={24} className="text-white" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}