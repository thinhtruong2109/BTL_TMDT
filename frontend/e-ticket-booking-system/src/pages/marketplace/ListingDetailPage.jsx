import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, ShoppingCart, RefreshCw, Ticket as TicketIcon } from 'lucide-react';
import { ticketListingApi, ticketApi } from '../../api';


const PAYMENT_METHODS = ['VNPAY', 'MOMO', 'CREDIT_CARD']; // Thay bằng constant của bạn nếu cần

const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('VNPAY');

  const [myTickets, setMyTickets] = useState([]);
  const [tradeTicketId, setTradeTicketId] = useState('');

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    setLoading(true);
    try {
      const res = await ticketListingApi.getById(id);
      setListing(res.data);

      if (res.data.exchangeType === 'TRADE' || res.data.exchangeType === 'BOTH') {
        const ticketsRes = await ticketApi.getMyTickets();
        const available = (Array.isArray(ticketsRes.data) ? ticketsRes.data : [])
          .filter((t) => t.transferable && !t.checkedIn);
        setMyTickets(available);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi tải thông tin vé!");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    setSubmitting(true);
    try {
      await ticketListingApi.createExchange({
        ticketListingId: parseInt(id),
        transactionType: 'PURCHASE',
        paymentMethod,
      });
      toast.success("Mua vé thành công!");
      navigate('/my-ticket'); // Đổi thành route vé của bạn
    } catch (err) {
      toast.error(err.response?.data?.message || "Giao dịch thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrade = async () => {
    if (!tradeTicketId) {
      toast.warning("Vui lòng chọn vé để trao đổi!");
      return;
    }
    setSubmitting(true);
    try {
      await ticketListingApi.createExchange({
        ticketListingId: parseInt(id),
        transactionType: 'TRADE',
        tradeTicketId: parseInt(tradeTicketId),
      });
      toast.success("Đề xuất trao đổi thành công!");
      navigate('/my-ticket');
    } catch (err) {
      toast.error(err.response?.data?.message || "Trao đổi thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  if (loading) return (
    <div className="min-h-screen bg-[#D9D9D9] flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (!listing) return null;

  return (
    <div className="min-h-screen bg-[#D9D9D9] font-montserrat flex flex-col">

      <main className="flex-grow max-w-[1000px] w-full mx-auto px-5 py-10 animate-fade-in">
        
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary font-bold mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Trở lại Chợ vé
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* CỘT TRÁI - CHI TIẾT */}
          <div className="md:col-span-7">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase">Thông tin vé bán</h2>
              <div className="w-12 h-1 bg-primary mb-6"></div>

              <div className="space-y-4">
                {listing.eventName && (
                  <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                    <span className="text-gray-500 font-bold uppercase text-sm">Sự kiện</span>
                    <span className="text-gray-900 font-bold text-right max-w-[60%]">{listing.eventName}</span>
                  </div>
                )}
                {listing.ticketTypeName && (
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <span className="text-gray-500 font-bold uppercase text-sm">Loại vé</span>
                    <span className="text-primary font-bold">{listing.ticketTypeName}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-gray-500 font-bold uppercase text-sm">Hình thức</span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md font-bold text-xs uppercase">
                    {listing.exchangeType}
                  </span>
                </div>
                {listing.description && (
                  <div className="pt-2">
                    <span className="text-gray-500 font-bold uppercase text-sm block mb-2">Mô tả từ người bán</span>
                    <p className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm font-medium italic">
                      "{listing.description}"
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
                <p className="text-sm font-bold text-gray-500 uppercase mb-1">Mức giá niêm yết</p>
                <p className="text-4xl font-extrabold text-primary">{formatCurrency(listing.listingPrice)}</p>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI - THANH TOÁN / ĐỔI */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Box MUA VÉ */}
            {(listing.exchangeType === 'SELL' || listing.exchangeType === 'BOTH') && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-primary">
                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" /> Mua vé này
                </h3>
                
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phương thức thanh toán</label>
                  <select 
                    value={paymentMethod} 
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full h-12 px-4 border border-gray-300 rounded-xl font-bold text-gray-700 outline-none focus:border-primary"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={submitting}
                  className="w-full h-14 bg-primary hover:bg-red-600 text-white font-bold rounded-xl transition-colors uppercase shadow-lg shadow-primary/30 disabled:opacity-50"
                >
                  {submitting ? 'Đang xử lý...' : `Thanh toán ${formatCurrency(listing.listingPrice)}`}
                </button>
              </div>
            )}

            {/* Box ĐỔI VÉ */}
            {(listing.exchangeType === 'TRADE' || listing.exchangeType === 'BOTH') && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-500">
                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-blue-500" /> Trao đổi vé
                </h3>
                
                {myTickets.length === 0 ? (
                  <p className="text-sm text-gray-500 font-medium bg-gray-50 p-4 rounded-xl border border-gray-200">
                    Bạn hiện không có vé nào hợp lệ (cho phép chuyển nhượng) để đem ra trao đổi.
                  </p>
                ) : (
                  <>
                    <div className="mb-6">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Chọn vé của bạn</label>
                      <select 
                        value={tradeTicketId} 
                        onChange={(e) => setTradeTicketId(e.target.value)}
                        className="w-full h-12 px-4 border border-gray-300 rounded-xl font-bold text-gray-700 outline-none focus:border-blue-500"
                      >
                        <option value="" disabled>-- Chọn vé --</option>
                        {myTickets.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.ticketCode} - {t.eventName || 'Vé sự kiện'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleTrade}
                      disabled={submitting || !tradeTicketId}
                      className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors uppercase shadow-lg shadow-blue-600/30 disabled:opacity-50"
                    >
                      {submitting ? 'Đang xử lý...' : 'Đề xuất trao đổi'}
                    </button>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default ListingDetailPage;