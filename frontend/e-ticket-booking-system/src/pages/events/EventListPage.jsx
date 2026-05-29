import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Search } from 'lucide-react';
import { eventApi, categoryApi } from '../../api';

import EventCard from '../../components/events/EventCard'; 
import logo from '../../assets/images/logo.png';

const EventListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState(searchParams.get('name') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');

  // Lấy danh sách Category
  useEffect(() => {
    categoryApi.getAll()
      .then((res) => setCategories(res.data))
      .catch(() => console.log("Lỗi tải danh mục"));
  }, []);

  // Gọi API lấy Events
  useEffect(() => {
    const nameFromUrl = searchParams.get('name') || '';
    const categoryFromUrl = searchParams.get('categoryId') || '';
    
    setSearchName(nameFromUrl);
    setSelectedCategory(categoryFromUrl);
    
    // Gọi fetch ngay khi params thay đổi
    fetchEvents(nameFromUrl, categoryFromUrl);
  }, [searchParams]);

  const fetchEvents = async (name = searchName, catId = selectedCategory) => {
    setLoading(true);
    try {
      const params = {};
      if (catId) params.categoryId = catId;
      if (name) params.name = name;
      
      const res = await eventApi.getPublishedEvents(params);
      // Giả định response trả về mảng trực tiếp hoặc nằm trong res.data
      const data = res.data || res;
      setEvents(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      toast.error("Không thể tải danh sách sự kiện!");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Thay vì gọi fetch trực tiếp, hãy cập nhật URL để useEffect bên trên tự xử lý
    setSearchParams({ name: searchName, categoryId: selectedCategory });
  };

  const handleCategoryChange = (catId) => {
    const newCat = catId === selectedCategory ? '' : catId;
    setSelectedCategory(newCat);
    setSearchParams({ name: searchName, categoryId: newCat });
  };

  return (
    <div className="min-h-screen bg-[#D9D9D9] font-montserrat flex flex-col">

      <main className="flex-grow max-w-[1440px] w-full mx-auto px-5 md:px-[122px] py-10 animate-fade-in">
        
        {/* HEADER TRANG */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 uppercase tracking-tight mb-2">
            Khám phá sự kiện
          </h1>
          <p className="text-gray-600 font-medium text-sm md:text-base">
            Tìm kiếm và đặt vé cho các sự kiện sắp diễn ra
          </p>
        </div>

        {/* BỘ LỌC VÀ TÌM KIẾM */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-10">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Bạn đang tìm sự kiện gì?"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-gray-800"
              />
              <button
                type="submit"
                className="absolute inset-y-2 right-2 bg-primary hover:bg-red-600 text-white font-bold px-6 rounded-lg transition-colors"
              >
                Tìm kiếm
              </button>
            </div>
          </form>

          {/* CATEGORY CHIPS */}
          {categories.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all border-2 ${
                  selectedCategory === '' 
                    ? 'bg-gray-900 text-white border-gray-900' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900'
                }`}
              >
                Tất cả
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(String(cat.id))}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all border-2 ${
                    selectedCategory === String(cat.id)
                      ? 'bg-primary text-white border-primary shadow-md' 
                      : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DANH SÁCH SỰ KIỆN */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center gap-4 py-20 px-4">
            <img className="w-48 opacity-50 drop-shadow-md mb-2" src={logo} alt="Empty" />
            <h3 className="text-xl font-bold text-gray-800">Không tìm thấy sự kiện nào</h3>
            <p className="text-gray-500 font-medium">Hãy thử thay đổi từ khóa hoặc bộ lọc danh mục.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>

    </div>
  );
};

export default EventListPage;