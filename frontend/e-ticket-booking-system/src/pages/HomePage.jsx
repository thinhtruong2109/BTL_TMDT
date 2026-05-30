import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, RefreshCw, ShieldCheck } from 'lucide-react';

import Footer from '../components/Footer';
import HeaderBar from '../components/HeaderBar';
import CatalogBar from '../components/CatalogBar';
import HeroBanner from '../components/HeroBanner';
import ListEvent from '../components/ListEvent';
import AdvertisingBanner from '../components/AdvertisingBanner';
import Loader from '../components/TicketLoader';

// APIs
import { eventApi, categoryApi } from '../api';

// Assets
import defaultImage from '../assets/images/default_img.png';
import bgImage from '../assets/images/bg.jpg';

const HomePage = () => {
  const navigate = useNavigate();

  // State
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Logic fetch dữ liệu
  useEffect(() => {
    const loadData = async () => {
      try {
        const [evRes, catRes] = await Promise.all([
          eventApi.getPublishedEvents(),
          categoryApi.getAll(),
        ]);

        const rawEvents = Array.isArray(evRes.data)
          ? evRes.data
          : evRes.data?.content
          ? evRes.data.content
          : [];

        const mappedEvents = rawEvents.map((evt) => ({
          id: evt.id,
          title: evt.name,
          src: evt.bannerImageUrl || evt.event_banner_url || evt.event_picture || defaultImage,
          alt: evt.name,
          date: evt.eventTime,
          picture: evt.bannerImageUrl || evt.event_picture_url || evt.event_picture || defaultImage,
          categoryId: evt.categoryId || evt.category?.id,
          ...evt,
        }));

        setEvents(mappedEvents);
        setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((evt) => evt.eventTime && new Date(evt.eventTime) > now)
      .sort((a, b) => new Date(a.eventTime) - new Date(b.eventTime));
  }, [events]);

  if (loading) {
    return <Loader text="Đang tải sự kiện..." height="100vh" />;
  }

  return (
    <div className="bg-home relative min-h-screen isolate font-montserrat">
      <div
        className="fixed inset-0 -z-20 w-full h-full"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(3px)',
        }}
      ></div>

      <div className="fixed inset-0 bg-black/30 -z-10"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <HeaderBar />
        
        <CatalogBar categories={categories} />

        <HeroBanner />

        {/* SỰ KIỆN NỔI BẬT */}
        {upcomingEvents.length > 0 && (
          <ListEvent
            title="SỰ KIỆN NỔI BẬT"
            events={upcomingEvents.slice(0, 15)}
            imageWidth="260px"
            imageHeight="350px"
            gap={30}
          />
        )}

        {/* SỰ KIỆN TRENDING */}
        {events.length > 0 && (
          <ListEvent
            title="SỰ KIỆN TRENDING"
            events={events.slice(0, 10)}
            imageWidth="380px"
            imageHeight="160px"
            gap={30}
          />
        )}

        {/* CÁC DANH MỤC SỰ KIỆN */}
        {categories.length > 0 ? (
          categories.map((cat, index) => {
            const catEvents = events.filter(e => String(e.categoryId) === String(cat.id));
            if (catEvents.length === 0) return null;

            return (
              <React.Fragment key={cat.id || index}>
                {index === 1 && (
                  <AdvertisingBanner
                    banner="https://techcombank.com/content/dam/techcombank/public-site/articles/non-blog/Banner-cashback-ther-VISA-c6315ae326.jpg"
                    height={500}
                  />
                )}
                <ListEvent
                  title={cat.name.toUpperCase()}
                  events={catEvents} 
                  imageWidth="350px"
                  imageHeight="200px"
                  gap={30}
                />
              </React.Fragment>
            );
          })
        ) : (
          <>
            <ListEvent title="CONCERT GÌ NÀO ?" events={events} imageWidth="350px" imageHeight="200px" gap={30} />
            <AdvertisingBanner
              banner="https://techcombank.com/content/dam/techcombank/public-site/articles/non-blog/Banner-cashback-ther-VISA-c6315ae326.jpg"
              height={500}
            />
            <ListEvent title="NGHỆ THUẬT VÀ SÂN KHẤU" events={events} imageWidth="350px" imageHeight="200px" gap={30} />
            <ListEvent title="THỂ THAO" events={events} imageWidth="350px" imageHeight="200px" gap={30} />
          </>
        )}

        {/* SECTION MARKETPLACE - 3 CỘT */}
        <div className="max-w-[1440px] mx-auto px-5 md:px-[122px] pt-12 pb-4 w-full">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            <h2 className="font-extrabold text-white text-xl uppercase drop-shadow-md">
              Chợ vé TickeZ - Mua bán an toàn
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1: Mua vé an toàn */}
            <div 
              onClick={() => navigate('/marketplace')} 
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:-translate-y-2 transition-all cursor-pointer border border-white/50 group"
            >
               <ShieldCheck className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
               <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase">Mua vé an toàn</h3>
               <p className="text-gray-600 font-medium text-sm">Không lo lừa đảo. Tìm mua vé từ những người dùng khác với hệ thống bảo mật tuyệt đối của TickeZ.</p>
            </div>

            {/* Box 2: Pass vé dễ dàng */}
            <div 
              onClick={() => navigate('/marketplace/my-listings')} 
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:-translate-y-2 transition-all cursor-pointer border border-white/50 group"
            >
               <Store className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
               <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase">Nhượng vé dễ dàng</h3>
               <p className="text-gray-600 font-medium text-sm">Lỡ lịch không thể tham gia? Nhượng lại chiếc vé của bạn cho người đang cần chỉ với vài thao tác.</p>
            </div>

            {/* Box 3: Trao đổi linh hoạt */}
            <div 
              onClick={() => navigate('/marketplace')} 
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:-translate-y-2 transition-all cursor-pointer border border-white/50 group"
            >
               <RefreshCw className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
               <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase">Trao đổi vé</h3>
               <p className="text-gray-600 font-medium text-sm">Giao dịch, đổi lấy hạng vé xịn hơn hoặc đổi ngày xem mà bạn mong muốn một cách hoàn toàn linh hoạt.</p>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;