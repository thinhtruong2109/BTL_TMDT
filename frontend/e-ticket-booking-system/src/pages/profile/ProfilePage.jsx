import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { userApi } from '../../api';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' hoặc 'security'

  // Form Thông tin cá nhân
  const [profile, setProfile] = useState({ fullName: '', phoneNumber: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Form Đổi mật khẩu
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Đổ dữ liệu user vào form khi load
  useEffect(() => {
    if (user) {
      setProfile({ fullName: user.fullName || '', phoneNumber: user.phoneNumber || '' });
    }
  }, [user]);

  // Xử lý Cập nhật thông tin
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await userApi.updateProfile(profile);
      await refreshUser(); // Cập nhật lại context
      toast.success('Cập nhật thông tin thành công!');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Lỗi cập nhật thông tin!";
      toast.error(errorMsg);
    } finally {
      setProfileLoading(false);
    }
  };

  // Xử lý Đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (password.newPassword !== password.confirmPassword) {
      toast.warning('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (password.newPassword.length < 8) {
      toast.warning('Mật khẩu mới phải có ít nhất 8 ký tự!');
      return;
    }

    setPasswordLoading(true);
    try {
      await userApi.changePassword({
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });
      toast.success('Đổi mật khẩu thành công!');
      // Reset form mật khẩu
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Đổi mật khẩu thất bại!";
      toast.error(errorMsg);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) return null; // Tránh render khi chưa có dữ liệu

  return (
    <div className="max-w-[1440px] mx-auto px-5 md:px-[122px] py-10 font-montserrat animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* CỘT TRÁI - TÓM TẮT USER */}
        <div className="md:col-span-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
            {/* Avatar chữ cái đầu */}
            <div className="w-28 h-28 bg-gray-800 text-white rounded-full flex items-center justify-center text-5xl font-extrabold mb-4 shadow-md uppercase">
              {user?.fullName?.[0] || 'U'}
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.fullName}</h2>
            <p className="text-sm font-medium text-gray-500 mb-4">{user?.email}</p>
            
            {/* Phân quyền Badge */}
            <span className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-full text-xs font-bold uppercase tracking-wider">
              {user?.role || 'CUSTOMER'}
            </span>
          </div>
        </div>

        {/* CỘT PHẢI - NỘI DUNG TABS */}
        <div className="md:col-span-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            
            {/* Tiêu đề Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-4 text-sm font-bold uppercase transition-colors ${
                  activeTab === 'profile'
                    ? 'text-primary border-b-4 border-primary'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                Thông tin cá nhân
              </button>
              <button
                className={`flex-1 py-4 text-sm font-bold uppercase transition-colors ${
                  activeTab === 'security'
                    ? 'text-primary border-b-4 border-primary'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('security')}
              >
                Bảo mật & Mật khẩu
              </button>
            </div>

            {/* Nội dung Tab Thông tin cá nhân */}
            {activeTab === 'profile' && (
              <div className="p-8 animate-fade-in">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Chi tiết hồ sơ</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email (Không thể thay đổi)</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full h-12 px-5 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 font-medium cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên</label>
                    <input
                      type="text"
                      required
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      className="w-full h-12 px-5 border border-gray-300 rounded-lg focus:border-primary outline-none transition-colors font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại</label>
                    <input
                      type="text"
                      value={profile.phoneNumber}
                      onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                      className="w-full h-12 px-5 border border-gray-300 rounded-lg focus:border-primary outline-none transition-colors font-medium"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="w-full sm:w-auto px-8 h-12 bg-primary hover:bg-red-600 text-white font-bold rounded-lg disabled:opacity-50 transition-colors uppercase tracking-wide mt-4"
                  >
                    {profileLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </form>
              </div>
            )}

            {/* Nội dung Tab Bảo mật */}
            {activeTab === 'security' && (
              <div className="p-8 animate-fade-in">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Đổi mật khẩu</h3>
                <form onSubmit={handleChangePassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      required
                      value={password.currentPassword}
                      onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
                      className="w-full h-12 px-5 border border-gray-300 rounded-lg focus:border-primary outline-none transition-colors font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu mới</label>
                    <input
                      type="password"
                      required
                      value={password.newPassword}
                      onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                      className="w-full h-12 px-5 border border-gray-300 rounded-lg focus:border-primary outline-none transition-colors font-medium"
                      placeholder="Ít nhất 8 ký tự"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      required
                      value={password.confirmPassword}
                      onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
                      className="w-full h-12 px-5 border border-gray-300 rounded-lg focus:border-primary outline-none transition-colors font-medium"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full sm:w-auto px-8 h-12 bg-gray-900 hover:bg-black text-white font-bold rounded-lg disabled:opacity-50 transition-colors uppercase tracking-wide mt-4"
                  >
                    {passwordLoading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;