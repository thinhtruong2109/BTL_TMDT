import { X, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import authService from "../services/authService"; // Thêm dòng này (điều chỉnh đường dẫn cho đúng cấu trúc thư mục)

import logo from "../assets/images/logo.png";
import illu from "../assets/images/illu.png";
import logogg from "../assets/images/gglogo.png";

export default function RegisterModal({ isOpen, onClose, openLogin }) {
    const navigate = useNavigate();
    const { register } = useAuth(); 

    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp!");
            return;
        }
        
        if (password.length < 8) {
            toast.warning("Mật khẩu phải dài ít nhất 8 ký tự!");
            return;
        }

        setLoading(true);

        try {
            await register({
                email,
                password,
                fullName 
            });

            toast.success("Đăng ký thành công! Vui lòng xác thực email.");
            onClose(); 
            navigate('/verify-email', { state: { email } }); 

        } catch (err) {
            const message = err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
            toast.error(message);
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
                    {/* LEFT */}
                    <div className="flex-1 p-12 flex flex-col justify-center">
                        <div className="max-w-sm mx-auto w-full">
                            <h2 className="font-playwrite text-xl mb-2 mt-4">Xin chào,</h2>
                            <p className="text-xl text-gray-900 mb-6 font-extrabold uppercase">
                                Đăng ký tài khoản
                            </p>

                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <input
                                    type="text"
                                    placeholder="Họ và tên"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:border-primary outline-none font-medium"
                                    required
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:border-primary outline-none font-medium"
                                    required
                                />
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Mật khẩu"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-11 px-4 pr-12 border border-gray-300 rounded-lg focus:border-primary outline-none font-medium"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <input
                                    type="password"
                                    placeholder="Xác nhận mật khẩu"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:border-primary outline-none font-medium"
                                    required
                                />

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-red-600 text-white font-bold py-3 rounded-lg disabled:opacity-50 transition-colors uppercase tracking-wide mt-2"
                                >
                                    {loading ? "Đang xử lý..." : "Tạo tài khoản"}
                                </button>
                            </form>

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-white px-4 text-gray-500 font-semibold text-sm">HOẶC</span>
                                </div>
                            </div>

                            <button 
                                type="button"
                                className="w-full h-11 border border-gray-300 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
                                onClick={handleGoogleLogin}
                            >
                                <img src={logogg} alt="Google" className="w-5 h-5" />
                                <span className="font-bold text-gray-700">Đăng nhập với Google</span>
                            </button>

                            <p className="text-center mt-5 text-gray-600 font-medium">
                                Bạn đã có tài khoản? <br />
                                <button
                                    type="button"
                                    onClick={() => { onClose(); openLogin(); }}
                                    className="text-primary font-bold hover:underline mt-1"
                                >
                                    Đăng nhập
                                </button>
                            </p>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="bg-primary flex-1 relative hidden md:flex">
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-8">
                            <img src={logo} alt="TickeZ" className="w-60 mb-2" />
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