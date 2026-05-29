import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShoppingCart, RefreshCw, Ticket as TicketIcon } from 'lucide-react';
import { ticketListingApi } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

import logo from '../../assets/images/logo.png';

const MarketplacePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await ticketListingApi.getAll();
      setListings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Lỗi tải danh sách chợ vé!";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = (listingId) => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để tiếp tục!");
      navigate('/login');
      return;
    }
    navigate(`/marketplace/${listingId}`);
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="min-h-screen bg-[#D9D9D9] font-montserrat flex flex-col">
      <main className="flex-grow max-w-[1440px] w-full mx-auto px-5 md:px-[122px] py-10 animate-fade-in">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 uppercase tracking-tight mb-2">
              Chợ Vé TickeZ
            </h1>
            <p className="text-gray-600 font-medium">Mua bán và trao đổi vé an toàn cùng cộng đồng</p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => navigate('/marketplace/my-listings')}
              className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg"
            >
              Vé bạn đang đăng bán
            </button>
          )}
        </div>

        {/* LISTINGS */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center gap-4 py-20 px-4">
            <img className="w-48 opacity-50 drop-shadow-md mb-2" src={logo} alt="Empty" />
            <h3 className="text-xl font-bold text-gray-800">Chợ vé đang trống</h3>
            <p className="text-gray-500 font-medium">Hiện tại chưa có vé nào được đăng bán hoặc trao đổi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 p-5">
                
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2 leading-tight">
                    {listing.eventName || 'Vé sự kiện'}
                  </h3>
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full whitespace-nowrap uppercase flex items-center gap-1 border ${
                    listing.exchangeType === 'TRADE' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-green-50 text-green-600 border-green-200'
                  }`}>
                    {listing.exchangeType === 'TRADE' ? <RefreshCw className="w-3 h-3" /> : null}
                    {listing.exchangeType === 'TRADE' ? 'Trao đổi' : 'Bán lại'}
                  </span>
                </div>
                
                {listing.ticketTypeName && (
                  <p className="text-sm font-bold text-primary mb-1 flex items-center gap-1.5">
                    <TicketIcon className="w-4 h-4" /> {listing.ticketTypeName}
                  </p>
                )}
                
                {listing.description && (
                  <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-4 h-10">
                    "{listing.description}"
                  </p>
                )}

                <div className="h-px bg-gray-200 w-full my-4" />

                <div className="mt-auto flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase mb-0.5">Mức giá</p>
                    <p className="text-xl font-extrabold text-gray-900">
                      {formatCurrency(listing.listingPrice)}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleBuy(listing.id)}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-bold text-white transition-colors shadow-md ${
                      listing.exchangeType === 'TRADE' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary hover:bg-red-600'
                    }`}
                  >
                    {listing.exchangeType === 'TRADE' ? 'Đổi vé' : 'Mua ngay'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

    </div>
  );
};

export default MarketplacePage;