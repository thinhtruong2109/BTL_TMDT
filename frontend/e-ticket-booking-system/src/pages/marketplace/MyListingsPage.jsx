import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { X, Trash2 } from 'lucide-react';
import { ticketListingApi } from '../../api';

const MyListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState({ open: false, id: null });

  const fetchListings = async () => {
    try {
      const res = await ticketListingApi.getMyListings();
      setListings(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi tải danh sách vé!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  const handleCancel = async () => {
    try {
      await ticketListingApi.cancel(cancelDialog.id);
      toast.success('Đã hủy niêm yết vé thành công!');
      setCancelDialog({ open: false, id: null });
      fetchListings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể hủy lúc này!");
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-[#D9D9D9] font-montserrat flex flex-col">
      <main className="flex-grow max-w-[1440px] w-full mx-auto px-5 md:px-[122px] py-10 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-gray-900 uppercase mb-8 tracking-tight">Vé đang đăng bán</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow-lg text-center">
            <p className="text-gray-500 font-bold text-lg">Bạn chưa đăng bán hoặc trao đổi vé nào trên chợ.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-x-auto border border-gray-100">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-900 text-white text-sm font-bold uppercase tracking-wider">
                  <th className="p-5 border-b border-gray-700">Sự kiện</th>
                  <th className="p-5 border-b border-gray-700">Loại vé</th>
                  <th className="p-5 border-b border-gray-700">Mức giá</th>
                  <th className="p-5 border-b border-gray-700">Trạng thái</th>
                  <th className="p-5 border-b border-gray-700">Ngày đăng</th>
                  <th className="p-5 border-b border-gray-700 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l, idx) => (
                  <tr key={l.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-5 border-b border-gray-100 font-bold text-gray-900 max-w-[250px] truncate">
                      {l.eventName || l.event?.name || '-'}
                    </td>
                    <td className="p-5 border-b border-gray-100 font-medium text-gray-600">
                      {l.ticketTypeName || l.ticketType?.name || '-'}
                    </td>
                    <td className="p-5 border-b border-gray-100 font-extrabold text-primary">
                      {formatCurrency(l.askingPrice || l.price)}
                    </td>
                    <td className="p-5 border-b border-gray-100">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase ${
                        l.status === 'FOR_SALE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {l.status === 'FOR_SALE' ? 'Đang bán' : l.status}
                      </span>
                    </td>
                    <td className="p-5 border-b border-gray-100 font-medium text-gray-500 text-sm">
                      {formatDateTime(l.createdAt)}
                    </td>
                    <td className="p-5 border-b border-gray-100 text-right">
                      {l.status === 'FOR_SALE' && (
                        <button 
                          onClick={() => setCancelDialog({ open: true, id: l.id })}
                          className="bg-red-50 hover:bg-red-100 text-red-500 p-2 rounded-lg transition-colors"
                          title="Hủy đăng bán"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Hủy Đăng Bán */}
        {cancelDialog.open && (
          <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setCancelDialog({ open: false, id: null })} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-fade-in relative">
                <button onClick={() => setCancelDialog({ open: false, id: null })} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
                  <X className="w-6 h-6" />
                </button>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Xác nhận Hủy?</h3>
                <p className="text-gray-600 font-medium text-sm mb-8">
                  Vé này sẽ bị gỡ khỏi Chợ vé và được trả lại vào túi "Vé của tôi". Bạn có chắc chắn muốn hủy?
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setCancelDialog({ open: false, id: null })} className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-colors">
                    Đóng
                  </button>
                  <button onClick={handleCancel} className="flex-1 py-3 bg-primary hover:bg-red-600 text-white font-bold rounded-xl transition-colors">
                    Hủy đăng bán
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

    </div>
  );
};

export default MyListingsPage;