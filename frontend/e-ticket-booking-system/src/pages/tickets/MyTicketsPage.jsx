import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { ticketApi } from '../../api';
import { QrCode, User, Ticket as TicketIcon, Calendar, Store } from 'lucide-react';

import logo from '../../assets/images/logo.png'; 

const MyTicketsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState("all");

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để xem vé của bạn!");
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets();
    }
  }, [isAuthenticated]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await ticketApi.getMyTickets();
      setTickets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Lỗi tải danh sách vé!";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  const filteredTickets = tickets.filter(t => {
    if (statusTab === 'valid') return !t.checkedIn;
    if (statusTab === 'used') return t.checkedIn;
    return true;
  });

  const statusTabs = [
    { key: "all", label: "Tất cả" },
    { key: "valid", label: "Hợp lệ" },
    { key: "used", label: "Đã sử dụng" },
  ];

  const categories = [
    { label: "Thông tin tài khoản", active: false, icon: User, href: "/profile" },
    { label: "Vé của tôi", active: true, icon: TicketIcon, href: "/my-tickets" },
    { label: "Booking", active: false, icon: Calendar, href: "/my-bookings" },
  ];

  return (
    <div className="min-h-screen bg-[#D9D9D9] font-montserrat flex flex-col">
      <main className="flex-grow flex px-5 md:px-[122px] py-10 gap-8 max-w-[1440px] mx-auto w-full animate-fade-in">
        
        {/* SIDEBAR Tương tự Ticket.jsx */}
        <aside className="hidden md:flex w-[300px] flex-col items-center gap-6 bg-white p-6 rounded-2xl h-fit shadow-lg">
          <div className="w-24 h-24 bg-gray-800 text-white rounded-full flex items-center justify-center text-4xl font-extrabold shadow-md uppercase overflow-hidden">
             {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
             ) : (
                user?.fullName?.[0] || 'U'
             )}
          </div>
          <span className="font-bold text-gray-900 text-lg text-center">{user?.fullName || "Người dùng"}</span>

          <nav className="w-full flex flex-col gap-3 mt-2">
            {categories.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.href)}
                className={`flex items-center gap-4 px-5 py-3 rounded-xl transition-all w-full text-left ${
                  item.active 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <item.icon className={`w-[22px] h-[22px] ${item.active ? "text-primary" : "text-gray-400"}`} />
                <span className={`text-sm ${item.active ? "font-extrabold" : "font-semibold"}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <section className="flex-1">
          <h1 className="font-extrabold text-gray-900 text-[32px] mb-6 uppercase tracking-tight">QUẢN LÝ VÉ / QR</h1>

          {/* TABS TRẠNG THÁI */}
          <div className="flex w-full bg-white p-1.5 rounded-full mb-6 shadow-md border border-gray-200">
            {statusTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setStatusTab(t.key)}
                className={`flex-1 px-4 py-2.5 rounded-full text-sm font-bold transition-all ${
                  statusTab === t.key 
                    ? "bg-primary text-white shadow-md" 
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* DANH SÁCH VÉ */}
          <div className="w-full min-h-[500px]">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredTickets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                    
                    {/* Header Vé */}
                    <div className="bg-gray-900 text-white p-4">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <h3 className="font-bold text-base line-clamp-2 leading-tight">
                          {ticket.eventName || 'Sự kiện chưa cập nhật'}
                        </h3>
                        {ticket.checkedIn ? (
                          <span className="px-2.5 py-1 bg-white/20 text-white text-[10px] font-bold rounded-full whitespace-nowrap uppercase">
                            Đã dùng
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold rounded-full whitespace-nowrap uppercase">
                            Hợp lệ
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs font-medium mt-2 truncate">
                        {ticket.ticketTypeName || ticket.ticketCode}
                      </p>
                    </div>

                    {/* Vùng QR Code */}
                    <div className="bg-gray-50 flex justify-center py-6 border-b border-gray-200">
                      {ticket.qrCode ? (
                        <img src={ticket.qrCode} alt="QR Code" className="w-32 h-32 object-contain rounded-lg mix-blend-multiply" />
                      ) : (
                        <div className="w-32 h-32 border-2 border-dashed border-gray-300 flex items-center justify-center rounded-2xl bg-white shadow-sm">
                          <QrCode className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Chi tiết Vé */}
                    <div className="p-5 flex flex-col gap-3 flex-grow">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-xs font-bold uppercase">Mã vé</span>
                        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                          {ticket.ticketCode}
                        </span>
                      </div>
                      
                      {ticket.seatNumber && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-xs font-bold uppercase">Ghế ngồi</span>
                          <span className="font-bold text-gray-900">{ticket.seatNumber}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-xs font-bold uppercase">Chuyển nhượng</span>
                        <span className="font-bold text-gray-900">{ticket.transferable ? 'Cho phép' : 'Không'}</span>
                      </div>

                      {/* Nút Bán / Trao đổi */}
                      {ticket.transferable && !ticket.checkedIn && (
                        <div className="mt-auto pt-4">
                          <button
                            onClick={() => navigate('/marketplace/create', { state: { ticketId: ticket.id } })}
                            className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                          >
                            <Store className="w-4 h-4" />
                            <span className="uppercase text-sm">Bán / Trao đổi</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Empty State
              <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center gap-4 py-16 px-4 h-full">
                <img
                  className="w-[250px] h-auto object-contain opacity-50 drop-shadow-md mb-2"
                  src={logo}
                  alt="Trống"
                />
                <div className="text-lg text-gray-500 font-bold text-center">
                  {statusTab === 'all' 
                    ? "Bạn chưa có vé/QR nào." 
                    : `Không có vé nào ở trạng thái "${statusTabs.find(s=>s.key===statusTab)?.label}"`}
                </div>
                <button 
                  onClick={() => navigate('/')}
                  className="mt-4 bg-primary text-white text-sm border-2 border-primary hover:bg-white hover:text-primary font-bold py-3 px-8 rounded-full transition-all duration-300 uppercase tracking-wider shadow-lg shadow-primary/30"
                >
                  Khám phá sự kiện ngay
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

    </div>
  );
};

export default MyTicketsPage;