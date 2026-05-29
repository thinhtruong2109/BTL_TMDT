import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ChevronDownIcon, ChevronUpIcon, ChevronRightIcon } from "lucide-react";
import { eventApi, scheduleApi, ticketTypeApi } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

import HeaderBar from '../../components/HeaderBar';
import Footer from '../../components/Footer';
import TicketDetail from '../../components/TicketDetail'; // Sử dụng Component Header bo cong
import defaultAvatar from '../../assets/images/default_img.png';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // State điều khiển mở rộng mô tả và accordion vé
  const [expanded, setExpanded] = useState(false);
  const [openItem, setOpenItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventRes, schedulesRes, ticketTypesRes] = await Promise.all([
        eventApi.getEventById(id),
        scheduleApi.getAvailable(id).catch(() => ({ data: [] })),
        ticketTypeApi.getAvailable(id).catch(() => ({ data: [] })),
      ]);
      setEvent(eventRes.data);
      setSchedules(Array.isArray(schedulesRes.data) ? schedulesRes.data : []);
      setTicketTypes(Array.isArray(ticketTypesRes.data) ? ticketTypesRes.data : []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Lỗi tải thông tin sự kiện!";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleTicket = (ticketId) => {
    setOpenItem(openItem === ticketId ? null : ticketId);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#D9D9D9] flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (!event) return null;

  // Dữ liệu cắt gọn cho mô tả
  const description = event.description || "Đang cập nhật mô tả...";
  const shortText = description.slice(0, 300) + (description.length > 300 ? "..." : "");

  // Truyền data map cho TicketDetail (Header)
  const mappedEventForHeader = {
      id: event.id,
      title: event.name,
      eventTime: schedules.length > 0 ? schedules[0].startTime : null,
      location: event.venueName + (event.venueAddress ? ` - ${event.venueAddress}` : ""),
      event_banner_url: event.bannerImageUrl || defaultAvatar,
      event_thumbnailImageUrl: event.thumbnailImageUrl|| defaultAvatar,
      ticketTypes: ticketTypes // Để TicketDetail lấy minPrice
  };

  return (
    <div className="min-h-screen bg-[#D9D9D9] font-montserrat flex flex-col">

      <TicketDetail pageType="event" eventData={mappedEventForHeader} />

      {/* NỘI DUNG CHÍNH */}
      <main className="flex-grow pb-10">
        
        {/* ROW 1: GIỚI THIỆU & ĐƠN VỊ TỔ CHỨC */}
        <section className="max-w-7xl mx-auto px-4 py-4 flex gap-8 w-full">
            {/* GIỚI THIỆU */}
            <div className="flex-[2] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
                <div className="bg-white rounded-[10px] border-0 h-full">
                    <div className="p-6">
                        <h2 className="font-bold text-primary text-2xl mb-4 uppercase">
                            GIỚI THIỆU
                        </h2>
                        <p className="font-medium text-secondary text-sm leading-normal whitespace-pre-line text-justify">
                            {expanded ? description : shortText}
                        </p>
                        <div className="flex items-center justify-center">
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="mt-3 text-primary font-semibold text-sm hover:underline flex justify-center"
                            >
                                {expanded ? <ChevronUpIcon size={30} /> : <ChevronDownIcon size={30} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ĐƠN VỊ TỔ CHỨC */}
            <div className="flex-1 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
                <div className="bg-white rounded-[10px] border-0 h-full">
                    <div className="p-6">
                        <h2 className="font-bold text-primary text-2xl mb-4 uppercase">
                            Đơn vị tổ chức
                        </h2>
                        <div className="flex items-start gap-4">
                            <img
                                className="w-[100px] h-[100px] object-cover rounded-full border-gray-200 border-[2px]"
                                alt="Organization Logo"
                                src={event.organizerLogo || defaultAvatar}
                            />
                            <div>
                                <h3 className="font-bold text-black text-base mb-2">
                                    {event.organizerName || "Đang cập nhật"}
                                </h3>
                                <p className="font-medium text-secondary text-sm">
                                    {event.organizerInfo || "Thông tin nhà tổ chức đang được cập nhật."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* ROW 2: THÔNG TIN VÉ & BANNER ĐỨNG */}
        <section className="max-w-7xl mx-auto px-4 py-4 flex gap-8 w-full">
            {/* THÔNG TIN VÉ */}
            <div className="flex-[2] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]">
                <div className="bg-secondary rounded-[10px] border-0 h-full">
                    <div className="p-6">
                        {/* HEADER */}
                        <div className="flex items-center gap-2 mb-6">
                            <h2 className="font-extrabold text-white text-2xl uppercase">
                                Thông tin vé
                            </h2>
                        </div>

                        {/* LIST BẢNG VÉ ACCORDION */}
                        <div className="space-y-0">
                            {ticketTypes.map((ticket, index) => {
                                const isFirst = index === 0;
                                const isLast = index === ticketTypes.length - 1;
                                const isOpen = openItem === ticket.id;
                                const isSoldOut = ticket.availableQuantity <= 0;

                                return (
                                    <div key={ticket.id} className="border-0">
                                        {/* ITEM HEADER */}
                                        <div
                                            onClick={() => ticket.description && toggleTicket(ticket.id)}
                                            className={`
                                                px-6 py-4 cursor-pointer select-none relative
                                                ${index % 2 === 0 ? "bg-white" : "bg-[#D9D9D9]"}
                                                ${isFirst ? "rounded-t-[5px]" : ""}
                                                ${isLast && (!isOpen || !ticket.description) ? "rounded-b-[5px]" : ""}
                                                flex items-center justify-between
                                            `}
                                        >
                                            <div className="flex items-center gap-4">
                                                <ChevronRightIcon
                                                    className={`w-[25px] h-[30px] text-secondary transition-transform duration-200
                                                        ${isOpen ? "rotate-90" : ""} ${!ticket.description ? "opacity-30" : ""}`}
                                                />
                                                <span className="font-bold text-secondary text-base">
                                                    {ticket.name}
                                                </span>
                                            </div>

                                            <span className="font-extrabold text-primary text-xl mr-10">
                                                {ticket.price.toLocaleString("vi-VN")} đ
                                            </span>

                                            {isSoldOut && (
                                                <div
                                                    className={`
                                                        absolute top-0 right-0
                                                        bg-primary text-white
                                                        rounded-bl-[5px]
                                                        w-[55px] h-[25px]
                                                        flex items-center justify-center
                                                        text-[9px] font-bold
                                                        ${index === 0 ? "rounded-tr-[5px]" : ""}`}
                                                >
                                                    Hết vé
                                                </div>
                                            )}
                                        </div>

                                        {/* DETAILS ACCORDION */}
                                        {isOpen && ticket.description && (
                                            <div
                                                className={`px-6 py-4 
                                                            ${isLast ? "rounded-b-[5px]" : ""}
                                                            ${index % 2 === 0 ? "bg-white" : "bg-[#D9D9D9]"}`}
                                            >
                                                <div className="space-y-2">
                                                    <p className="font-semibold text-secondary text-base px-10">
                                                        {ticket.description}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {ticketTypes.length === 0 && (
                                <div className="bg-white p-6 rounded-[5px] text-center font-bold text-gray-500">
                                    Chưa có thông tin vé cho sự kiện này.
                                </div>
                            )}
                        </div>

                        {/* BUTTON */}
                        <div className="flex justify-center mt-8">
                            <button 
                                onClick={() => {
                                    if (!isAuthenticated) {
                                        toast.info("Vui lòng đăng nhập để mua vé!");
                                        navigate('/login');
                                    } else {
                                        navigate(`/events/${id}/booking`);
                                    }
                                }}
                                disabled={event.status !== 'PUBLISHED' || event.availableTickets <= 0}
                                className="w-48 bg-primary hover:bg-white text-white hover:text-primary font-bold py-3 rounded-2xl transition-colors text-lg border-[3px] border-primary disabled:opacity-50 disabled:hover:bg-primary disabled:hover:text-white disabled:cursor-not-allowed"
                            >
                                {(event.status === 'PUBLISHED' && event.availableTickets > 0) ? 'Mua vé ngay' : 'Hết vé'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* BANNER DỌC */}
            <div className="flex-1 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:800ms]">
                <img
                    className="bg-white rounded-[10px] border-0 w-full h-full object-cover shadow-sm"
                    alt="Event Poster"
                    src={event.thumbnailImageUrl || defaultAvatar}
                    onError={(e) => { e.target.src = defaultAvatar }}
                />
            </div>
        </section>

      </main>

    </div>
  );
};

export default EventDetailPage;