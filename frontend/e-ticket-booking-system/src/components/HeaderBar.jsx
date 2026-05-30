// HeaderBar.jsx
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import LoginModal from "./Login.jsx";
import RegisterModal from "./Register.jsx";

import logo from "../assets/images/logo.png";
import "../index.css";
import { Search as SearchIcon, User } from "lucide-react";
import { BsTicketPerforatedFill } from "react-icons/bs";

const HeaderBar = () => {
    const [searchQuery, setSearchQuery] = useState("");

    // State điều khiển việc đóng/mở Modal
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    // LẤY TRẠNG THÁI VÀ THÔNG TIN USER TỪ AUTHCONTEXT
    const { isAuthenticated, logout, user } = useAuth();

    // XÁC ĐỊNH VAI TRÒ DỰA TRÊN THÔNG TIN USER ĐĂNG NHẬP
    const isAdmin = user?.role === 'ADMIN';
    const isOrganizer = user?.role === 'ORGANIZER';

    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/events?name=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
        } else {
            navigate(`/events`);
        }
    };

    const handleLogout = () => {
        logout(); // Gọi thẳng hàm logout của Context để dọn dẹp token
        navigate("/");
    };

    return (
        <>
            <header className="w-full bg-primary shadow-[0px_4px_6px_#00000026] sticky top-0 z-50 font-montserrat">
                <div className="flex items-center justify-between px-[20px] py-[8px] max-w-[1440px] mx-auto">
                    <a href="/">
                        <img className="w-[204px]" alt="TickeZ Logo" src={logo} />
                    </a>

                    <div className="flex items-center gap-10">
                        {/* THANH TÌM KIẾM */}
                        <div className="relative w-[450px]">
                            <form
                                onSubmit={handleSearch}
                                className="flex items-center bg-white rounded-lg shadow-[0px_4px_4px_#00000033] h-[45px]"
                            >
                                <div className="flex items-center justify-center w-[30px] h-[30px] bg-primary rounded-[5px] ml-2">
                                    <SearchIcon className="w-5 h-5 text-white" />
                                </div>

                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Bạn tìm sự kiện hót hòn họt gì nào?"
                                    className="flex-1 px-4 outline-none text-sm font-semibold text-gray-600 placeholder:text-gray-500 w-80"
                                />

                                <div className="w-px h-5 bg-gray-300 mx-2" />

                                <button
                                    type="submit"
                                    className="flex items-center justify-center w-[90px] h-[30px] bg-primary rounded-[5px] font-bold text-white text-xs hover:opacity-90 transition mr-2"
                                >
                                    Tìm kiếm
                                </button>
                            </form>
                        </div>

                        {/* Vé của tôi */}
                        <button
                            className="group h-[45px] rounded-[25px] border-2 border-white bg-transparent transition-all duration-300 flex items-center hover:bg-white px-5"
                            onClick={() => navigate("/my-tickets")}
                        >
                            <BsTicketPerforatedFill className="w-[25px] h-[25px] text-white mr-2 group-hover:text-primary transition-all duration-300" />
                            <span className="font-bold text-white text-xs group-hover:text-primary transition-all duration-200">
                                Vé của tôi
                            </span>
                        </button>

                        {/* Tạo sự kiện / Điều hướng theo quyền */}
                        {isAuthenticated && (
                            <button
                                className="h-[45px] rounded-[25px] border-2 border-transparent 
                                bg-white text-primary font-bold text-xs
                                hover:bg-primary hover:text-white hover:border-white hover:border-2
                                transition-colors duration-200 px-4"
                                onClick={() => {
                                    if (isAdmin) navigate('/admin/dashboard');
                                    else if (isOrganizer) navigate('/organizer/dashboard');
                                    else navigate('/organizer/dashboard');
                                }}
                            >
                                {isAdmin ? "Admin Portal" : isOrganizer ? "Organizer Portal" : "Tạo sự kiện"}
                            </button>
                        )}

                        {/* KIỂM TRA BẰNG isAuthenticated CỦA CONTEXT */}
                        {!isAuthenticated ? (
                            <div className="flex items-center gap-2 bg-white rounded-lg shadow-[0px_4px_4px_#00000033] w-[240px] h-[45px] px-4">
                                <button
                                    className="flex-1 h-full text-primary font-bold text-xs"
                                    onClick={() => setShowLogin(true)}
                                >
                                    Đăng nhập
                                </button>

                                <div className="w-px h-5 bg-gray-300" />

                                <button
                                    className="flex-1 h-full text-primary font-bold text-xs"
                                    onClick={() => setShowRegister(true)}
                                >
                                    Đăng ký
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 bg-primary px-5 py-2 rounded-lg">
                                <button
                                    className="hover:opacity-80"
                                    onClick={() => navigate("/profile")}
                                >
                                    <User className="w-6 h-6 text-white" />
                                </button>

                                <div className="w-px h-5 bg-white/80" />

                                <button
                                    onClick={handleLogout}
                                    className="ml-[10px] font-bold text-white text-xs hover:underline"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Gọi Modals ra */}
            {showLogin && (
                <LoginModal
                    isOpen={showLogin}
                    onClose={() => setShowLogin(false)}
                    openRegister={() => { setShowLogin(false); setShowRegister(true); }}
                />
            )}

            {showRegister && (
                <RegisterModal
                    isOpen={showRegister}
                    onClose={() => setShowRegister(false)}
                    openLogin={() => { setShowRegister(false); setShowLogin(true); }}
                />
            )}
        </>
    );
};

export default HeaderBar;