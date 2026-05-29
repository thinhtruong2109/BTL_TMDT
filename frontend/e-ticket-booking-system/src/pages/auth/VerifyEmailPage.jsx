import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import { authApi } from '../../api'; 

import logo from "../../assets/images/logo.png";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/');
      toast.info("Vui lòng đăng nhập hoặc đăng ký trước.");
    }
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().slice(0, 6);
    if (/^\d+$/.test(pasted)) {
      const newOtp = [...otp];
      pasted.split('').forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.warning('Vui lòng nhập đủ 6 số OTP');
      return;
    }

    setLoading(true);
    try {
      await authApi.verifyEmail({ email, otp: otpCode });
      toast.success('Xác thực email thành công! Vui lòng đăng nhập lại.');
      
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Mã OTP không hợp lệ hoặc đã hết hạn!";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendOtp({ email });
      toast.success('Mã OTP mới đã được gửi đến email của bạn');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Không thể gửi lại mã lúc này!";
      toast.error(errorMsg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D9D9D9] flex items-center justify-center p-4 font-montserrat">
      <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-10 flex flex-col items-center animate-fade-in">
        
        <div className="bg-primary p-3 rounded-xl mb-6 shadow-md cursor-pointer" onClick={() => navigate('/')}>
            <img src={logo} alt="TickeZ" className="h-8 w-auto" />
        </div>
        
        <h2 className="text-2xl font-extrabold uppercase text-gray-900 mb-2">Xác thực Email</h2>
        <p className="text-center text-gray-600 font-medium mb-6">
          Chúng tôi đã gửi mã xác nhận 6 số đến <br/>
          <span className="font-bold text-black">{email}</span>
        </p>

        {/* CÁC Ô NHẬP OTP */}
        <div className="flex gap-2 sm:gap-3 justify-center mb-6" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          ))}
        </div>

        <p className="text-sm text-gray-500 font-medium mb-6">
          Mã xác nhận hết hạn sau <span className="font-bold text-gray-800">5 phút</span>
        </p>

        {/* NÚT XÁC NHẬN */}
        <button
          onClick={handleVerify}
          disabled={loading || otp.some((d) => !d)}
          className="w-full h-12 bg-primary hover:bg-red-600 text-white font-bold rounded-lg disabled:opacity-50 transition-colors uppercase tracking-wide mb-4 shadow-lg shadow-primary/30"
        >
          {loading ? 'Đang xác thực...' : 'Xác nhận Email'}
        </button>

        <p className="text-gray-600 font-medium text-sm">
          Bạn chưa nhận được mã?{' '}
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-primary font-bold hover:underline disabled:opacity-50"
          >
            {resending ? 'Đang gửi...' : 'Gửi lại mã'}
          </button>
        </p>

        {/* GHI CHÚ BẢO MẬT */}
        <div className="mt-8 w-full bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 leading-relaxed text-center">
            <span className="font-bold text-gray-700">Lưu ý bảo mật:</span> Tuyệt đối không chia sẻ mã này cho bất kỳ ai. Nhân viên TickeZ. sẽ không bao giờ yêu cầu bạn cung cấp mã xác nhận.
          </p>
        </div>

      </div>
    </div>
  );
};

export default VerifyEmailPage;