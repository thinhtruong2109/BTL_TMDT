// CatalogBar.jsx
import React, { useState, useEffect } from "react";
import { Menu as MenuIcon } from "lucide-react";
import categoryService from "../services/categoryService.js";

const CatalogBar = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        
        // Kiểm tra cấu trúc phản hồi từ API để gán dữ liệu chính xác
        if (Array.isArray(response)) {
          setCategories(response);
        } else if (response && Array.isArray(response.data)) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh mục sự kiện:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <nav className="w-full bg-white shadow-md animate-fade-in opacity-100 [--animation-delay:200ms]">
      <div className="flex items-center justify-between max-w-[1440px] mx-auto h-[45px] px-4 sm:px-6 md:px-8">
        {/* Menu + Categories */}
        <div className="flex items-center gap-4 md:gap-6 overflow-x-auto no-scrollbar py-1">
          <button className="hover:opacity-80 transition-opacity p-1 flex-shrink-0">
            <MenuIcon className="w-6 h-6 text-primary" />
          </button>

          {loading ? (
            <span className="text-xs text-gray-400 font-medium">Đang tải danh mục...</span>
          ) : (
            categories.map((category, index) => (
              <React.Fragment key={category.id || index}>
                {index > 0 && <div className="h-5 w-[2px] bg-primary opacity-75 mx-3 flex-shrink-0" />}
                <a
                  // Chuyển hướng tìm kiếm theo categoryId tương ứng từ API
                  href={`/eticket/events?categoryId=${category.id}`}
                  className="font-semibold text-primary text-xs hover:text-myred transition-all whitespace-nowrap flex-shrink-0"
                >
                  {category.name}
                </a>
              </React.Fragment>
            ))
          )}
        </div>
      </div>
    </nav>
  );
};

export default CatalogBar;