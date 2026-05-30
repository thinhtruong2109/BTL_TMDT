import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Loader from "./TicketLoader";

import eventService from "../services/eventService";
import defaultImage from "../assets/images/default_img.png";

const HeroBanner = () => {
    const [events, setEvents] = useState([]);
    const [randomEvents, setRandomEvents] = useState([]); 
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAndProcessData = async () => {
            try {
                const response = await eventService.getPublishedEvents();
                
                // 1. Trích xuất data an toàn (Hỗ trợ cả phân trang content của Spring Boot)
                const rawEvents = Array.isArray(response.data) 
                    ? response.data 
                    : response.data?.content 
                    ? response.data.content 
                    : Array.isArray(response)
                    ? response
                    : response?.content
                    ? response.content
                    : [];

                // 2. Map lại dữ liệu
                let processedEvents = rawEvents.map(evt => {
                    return {
                        id: evt.id,
                        title: evt.name,
                        subtitle: evt.eventTime ? new Date(evt.eventTime).toLocaleDateString("vi-VN", {
                            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        }).toUpperCase() + (evt.destination ? ` - ${evt.destination}` : '') : 'TBA',
                        eventTime: evt.eventTime,
                        // Bắt đúng tên trường ảnh
                        image: evt.bannerImageUrl || evt.event_banner_url || evt.event_picture || defaultImage, 
                    };
                });

                const now = new Date();
                
                // Lọc sự kiện sắp diễn ra
                let upcomingEvents = processedEvents
                    .filter(evt => evt.eventTime && new Date(evt.eventTime) > now)
                    .sort((a, b) => new Date(a.eventTime) - new Date(b.eventTime));

                // 3. Fallback: Nếu data test trong DB toàn ngày quá khứ, lấy luôn sự kiện cũ ra để hiển thị (tránh lỗi trắng trang)
                if (upcomingEvents.length === 0) {
                    upcomingEvents = processedEvents; 
                }

                upcomingEvents = upcomingEvents.slice(0, 10);
                setEvents(upcomingEvents);

                // Random 2 sự kiện cho 2 ô bên phải
                if (upcomingEvents.length > 0) {
                    const shuffled = [...upcomingEvents].sort(() => 0.5 - Math.random());
                    setRandomEvents(shuffled.slice(0, 2));
                }

            } catch (error) {
                console.error("Lỗi tải HeroBanner:", error); 
            } finally {
                setLoading(false);
            }
        };

        fetchAndProcessData();
    }, []);

    // --- Logic Carousel ---
    const nextSlide = () => {
        if (events.length === 0) return;
        setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
    };

    const prevSlide = () => {
        if (events.length === 0) return;
        setCurrentIndex((prevIndex) => (prevIndex - 1 + events.length) % events.length);
    };

    // Auto slide sau 5s
    useEffect(() => {
        if (events.length <= 1) return; 
        
        const interval = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(interval);
    }, [events.length]);


    if (loading) return(
        <Loader text="Đang tải..." height="250px"/>
    );
    
    // Nếu vẫn không có data sau khi lọc
    if (!events || events.length === 0) {
        return (
            <div className="flex-grow py-8 w-full flex justify-center items-center h-[480px] bg-gray-100 rounded-lg">
                <p className="text-gray-500 font-semibold">Chưa có sự kiện nổi bật nào.</p>
            </div>
        );
    }

    const currentEvent = events[currentIndex];

    return (
        <div className="flex-grow py-8">
            <div className="w-full relative">
                <div className="max-w-[1440px] mx-auto px-5 md:px-[122px]">
                    <div className="grid grid-cols-12 gap-4">

                        {/* --- Ô TRÁI (SLIDER CHÍNH) --- */}
                        <div className="relative col-span-8">
                            <Link to={`/events/${currentEvent.id}`}>
                                <div className="w-full h-[480px] bg-gray-200 rounded-lg shadow-2xl overflow-hidden cursor-pointer group relative border border-gray-100">
                                    <img
                                        src={currentEvent.image}
                                        alt={currentEvent.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => { e.target.onerror = null; e.target.src = defaultImage }}
                                    />

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 group-hover:to-black/60 transition-all duration-300"></div>

                                    {/* Nội dung */}
                                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                        <h3 className="text-3xl font-extrabold mb-2 drop-shadow-lg uppercase leading-tight line-clamp-2">
                                            {currentEvent.title}
                                        </h3>
                                    </div>
                                </div>
                            </Link>

                            {/* Dots indicators */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                                {events.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setCurrentIndex(index);
                                        }}
                                        className={`w-3 h-3 rounded-full transition-all shadow ${
                                            index === currentIndex 
                                                ? 'bg-primary scale-125' 
                                                : 'bg-white/50 hover:bg-white'
                                        }`}
                                    />
                                ))}
                            </div>

                            {/* Nút Prev */}
                            <button
                                onClick={(e) => { e.preventDefault(); prevSlide(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-primary rounded-full p-3 text-white transition-all backdrop-blur-sm"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            {/* Nút Next */}
                            <button
                                onClick={(e) => { e.preventDefault(); nextSlide(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-primary rounded-full p-3 text-white transition-all backdrop-blur-sm"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* --- Ô PHẢI (2 SỰ KIỆN RANDOM) --- */}
                        <div className="col-span-4 grid grid-rows-2 gap-4 h-[480px]">
                            {randomEvents.map((item) => (
                                <Link to={`/events/${item.id}`} key={item.id} className="h-full">
                                    <div className="relative w-full h-full bg-gray-200 rounded-lg shadow-xl overflow-hidden cursor-pointer group border border-gray-100">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => { e.target.onerror = null; e.target.src = defaultImage }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <h4 className="text-white font-bold text-lg leading-tight uppercase line-clamp-2">
                                                {item.title}
                                            </h4>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroBanner;