import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  Minus,
  Plus,
  InfoIcon,
  Armchair,
  Tag,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from 'lucide-react';
import { eventApi, scheduleApi, ticketTypeApi, bookingApi, promoCodeApi, seatApi } from '../../api';


const CreateBookingPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [quantities, setQuantities] = useState({});
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [promos, setPromos] = useState([]);
  const [showPromos, setShowPromos] = useState(false);
  const [loadingPromos, setLoadingPromos] = useState(false);

  // Seat selection state
  const [availableSeats, setAvailableSeats] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventRes, schedulesRes, ticketTypesRes] = await Promise.all([
        eventApi.getEventById(eventId),
        scheduleApi.getAvailable(eventId).catch(() => ({ data: [] })),
        ticketTypeApi.getAvailable(eventId).catch(() => ({ data: [] })),
      ]);
      setEvent(eventRes.data);
      const sched = Array.isArray(schedulesRes.data) ? schedulesRes.data : [];
      setSchedules(sched);
      if (sched.length === 1) setSelectedSchedule(sched[0].id);
      setTicketTypes(Array.isArray(ticketTypesRes.data) ? ticketTypesRes.data : []);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Lỗi tải dữ liệu";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = ticketTypes.reduce((acc, tt) => {
    return acc + (quantities[tt.id] || 0) * tt.price;
  }, 0);

  const itemCount = Object.values(quantities).reduce((a, b) => a + b, 0);

  const requiresSeats = useMemo(() => {
    return ticketTypes.some(
      (tt) => (quantities[tt.id] || 0) > 0 && tt.hasNumberedSeats === true
    );
  }, [ticketTypes, quantities]);

  const requiredSeatCount = useMemo(() => {
    return ticketTypes.reduce((acc, tt) => {
      if (tt.hasNumberedSeats === true) {
        return acc + (quantities[tt.id] || 0);
      }
      return acc;
    }, 0);
  }, [ticketTypes, quantities]);

  const seatRequirementsBySection = useMemo(() => {
    const map = {};
    ticketTypes.forEach((tt) => {
      if ((quantities[tt.id] || 0) > 0 && tt.hasNumberedSeats && tt.sectionId) {
        if (!map[tt.sectionId]) {
          map[tt.sectionId] = { sectionName: tt.sectionName, required: 0 };
        }
        map[tt.sectionId].required += (quantities[tt.id] || 0);
      }
    });
    return map;
  }, [ticketTypes, quantities]);

  const allowedSectionIds = useMemo(() => {
    return Object.keys(seatRequirementsBySection).map(Number);
  }, [seatRequirementsBySection]);

  const selectedSeatsBySection = useMemo(() => {
    const map = {};
    for (const seatId of selectedSeatIds) {
      const seat = availableSeats.find((s) => s.id === seatId);
      if (seat && seat.sectionId) {
        map[seat.sectionId] = (map[seat.sectionId] || 0) + 1;
      }
    }
    return map;
  }, [selectedSeatIds, availableSeats]);

  useEffect(() => {
    if (requiresSeats && selectedSchedule) {
      fetchAvailableSeats();
    } else {
      setAvailableSeats([]);
      setSelectedSeatIds([]);
    }
  }, [requiresSeats, selectedSchedule]);

  const fetchAvailableSeats = async () => {
    if (!selectedSchedule) return;
    setLoadingSeats(true);
    try {
      const res = await seatApi.getAvailableSeats(selectedSchedule);
      const seats = Array.isArray(res.data) ? res.data : [];
      setAvailableSeats(seats);
    } catch (err) {
      setAvailableSeats([]);
    } finally {
      setLoadingSeats(false);
    }
  };

  const filteredSeats = useMemo(() => {
    if (allowedSectionIds.length === 0) return availableSeats;
    return availableSeats.filter((s) => allowedSectionIds.includes(s.sectionId));
  }, [availableSeats, allowedSectionIds]);

  const seatsBySection = useMemo(() => {
    const map = {};
    for (const seat of filteredSeats) {
      const sectionKey = seat.sectionName || 'General';
      if (!map[sectionKey]) map[sectionKey] = {};
      const rowKey = seat.rowNumber || '-';
      if (!map[sectionKey][rowKey]) map[sectionKey][rowKey] = [];
      map[sectionKey][rowKey].push(seat);
    }
    for (const section of Object.values(map)) {
      for (const row of Object.keys(section)) {
        section[row].sort((a, b) => {
          const numA = parseInt(a.seatNumber) || 0;
          const numB = parseInt(b.seatNumber) || 0;
          return numA - numB;
        });
      }
    }
    return map;
  }, [filteredSeats]);

  const handleSeatToggle = (seatId) => {
    const seat = filteredSeats.find((s) => s.id === seatId);
    if (!seat) return;

    setSelectedSeatIds((prev) => {
      if (prev.includes(seatId)) return prev.filter((id) => id !== seatId);
      if (prev.length >= requiredSeatCount) {
        toast.info(`Bạn chỉ được chọn tối đa ${requiredSeatCount} ghế.`);
        return prev;
      }
      if (seat.sectionId && seatRequirementsBySection[seat.sectionId]) {
        const currentInSection = prev.filter((id) => {
          const s = availableSeats.find((x) => x.id === id);
          return s && s.sectionId === seat.sectionId;
        }).length;
        if (currentInSection >= seatRequirementsBySection[seat.sectionId].required) {
          toast.info(`Bạn đã chọn đủ ghế cho khu vực ${seat.sectionName}`);
          return prev;
        }
      }
      return [...prev, seatId];
    });
  };

  const handleQuantityChange = (ttId, delta, max) => {
    setQuantities((prev) => {
      const current = prev[ttId] || 0;
      const newVal = Math.max(0, Math.min(max, current + delta));
      return { ...prev, [ttId]: newVal };
    });

    setSelectedPromo(null);
    setSelectedSeatIds([]);
    setShowPromos(false);
  };

  const handleFetchPromos = async () => {
    if (itemCount === 0) {
      toast.warning("Vui lòng chọn vé trước khi áp dụng mã giảm giá!");
      return;
    }
    setLoadingPromos(true);
    setShowPromos(true);

    try {
      const items = Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([ticketTypeId, quantity]) => ({ ticketTypeId: parseInt(ticketTypeId), quantity }));

      const res = await promoCodeApi.getAvailable({ eventId: parseInt(eventId), items });

      const responseData = res.data || res;
      const fetchedPromos = Array.isArray(responseData)
        ? responseData
        : (responseData.availablePromoCodes || responseData.content || []);

      setPromos(fetchedPromos);
    } catch (err) {
      console.error("Lỗi fetch promo:", err);
      setPromos([]);
    } finally {
      setLoadingPromos(false);
    }
  };

  const discountAmount = selectedPromo?.discountAmount || 0;
  const finalAmount = totalAmount - discountAmount;

  const handleSubmit = async () => {
    if (itemCount === 0) {
      toast.error('Vui lòng chọn ít nhất 1 vé');
      return;
    }
    if (requiresSeats && !selectedSchedule) {
      toast.error('Vui lòng chọn lịch chiếu cho loại vé có số ghế');
      return;
    }
    if (requiresSeats && selectedSeatIds.length !== requiredSeatCount) {
      toast.error(`Vui lòng chọn đủ ${requiredSeatCount} ghế. Đã chọn: ${selectedSeatIds.length}`);
      return;
    }
    if (requiresSeats) {
      for (const [sectionId, req] of Object.entries(seatRequirementsBySection)) {
        const selected = selectedSeatsBySection[Number(sectionId)] || 0;
        if (selected !== req.required) {
          toast.error(`Khu vực "${req.sectionName}" yêu cầu ${req.required} ghế, nhưng bạn mới chọn ${selected}`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const items = Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([ticketTypeId, quantity]) => ({ ticketTypeId: parseInt(ticketTypeId), quantity }));

      const data = { eventId: parseInt(eventId), items };
      if (selectedSchedule) data.scheduleId = selectedSchedule;
      if (selectedPromo) data.promoCodeId = selectedPromo.id;
      if (requiresSeats && selectedSeatIds.length > 0) {
        data.seatIds = selectedSeatIds;
      }

      const res = await bookingApi.create(data);
      navigate(`/payment/${res.data.id}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Lỗi tạo đơn hàng";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper Formats
  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-[#D9D9D9] flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (!event) return null;

  return (
    <div className="min-h-screen bg-[#D9D9D9] font-montserrat flex flex-col">

      <main className="flex-grow max-w-[1440px] w-full mx-auto px-5 md:px-[122px] py-10 animate-fade-in">
        <button
          onClick={() => navigate(`/events/${eventId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary font-bold mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Trở lại Sự kiện
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative">

          {/* CỘT TRÁI */}
          <section className="md:col-span-8 space-y-6">

            {/* 1. CHỌN LỊCH CHIẾU */}
            {schedules.length > 1 && (
              <div className="bg-white rounded-2xl p-7 shadow-lg">
                <h2 className="font-bold text-primary text-xl mb-4 uppercase">Chọn Lịch Chiếu</h2>
                <select
                  value={selectedSchedule}
                  onChange={(e) => setSelectedSchedule(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-300 rounded-xl font-bold text-gray-700 outline-none focus:border-primary"
                >
                  <option value="" disabled>-- Vui lòng chọn lịch chiếu --</option>
                  {schedules.map((s) => (
                    <option key={s.id} value={s.id}>
                      {formatDateTime(s.startTime)} - {formatDateTime(s.endTime)} ({s.availableSeats} chỗ trống)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 2. CHỌN VÉ */}
            <div className="bg-white rounded-2xl p-7 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-primary text-xl uppercase">Chọn hạng vé</h2>
                <h2 className="font-bold text-primary text-xl uppercase">Số lượng</h2>
              </div>

              <div className="space-y-4">
                {ticketTypes.map((tt) => {
                  const currentQty = quantities[tt.id] || 0;
                  const maxAllowed = Math.min(tt.maxPerBooking, tt.availableQuantity);
                  const isSoldOut = tt.availableQuantity <= 0;

                  return (
                    <div key={tt.id} className="relative bg-[#d9d9d9] rounded-[10px] p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 text-lg leading-none">{tt.name}</h3>
                            {tt.hasNumberedSeats && (
                              <span className="bg-white border border-blue-400 text-blue-500 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
                                <Armchair className="w-3 h-3" /> Chọn ghế
                              </span>
                            )}
                          </div>
                          <p className="font-extrabold text-primary text-xl">
                            {formatCurrency(tt.price)}
                          </p>
                          <p className="text-xs italic text-gray-500 mt-1 font-medium">
                            {tt.sectionName ? `Khu vực: ${tt.sectionName} · ` : ''}
                            Còn lại: {tt.availableQuantity} vé (Tối đa {tt.maxPerBooking}/đơn)
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {isSoldOut ? (
                            <div className="absolute bg-primary top-0 right-0 text-white rounded-[0px_10px_0px_10px] h-[30px] px-4 flex items-center">
                              <span className="font-bold text-sm">Hết vé</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 shadow-sm">
                              <button
                                onClick={() => handleQuantityChange(tt.id, -1, maxAllowed)}
                                disabled={currentQty === 0}
                                className="disabled:opacity-30"
                              >
                                <Minus className="w-4 h-4 text-primary font-bold" />
                              </button>

                              <span className="font-bold text-primary text-sm min-w-[24px] text-center">
                                {currentQty}
                              </span>

                              <button
                                onClick={() => handleQuantityChange(tt.id, 1, maxAllowed)}
                                disabled={currentQty >= maxAllowed}
                                className="disabled:opacity-30"
                              >
                                <Plus className="w-4 h-4 text-primary font-bold" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {tt.description && (
                        <div className="bg-white rounded-lg p-3 mt-3">
                          <div className="flex items-start gap-2">
                            <InfoIcon className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                            <div className="font-medium text-gray-600 text-sm">
                              {tt.description}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. SƠ ĐỒ CHỌN GHẾ */}
            {requiresSeats && selectedSchedule && (
              <div className="bg-white rounded-2xl p-7 shadow-lg">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Armchair className="w-6 h-6 text-primary" />
                    <h2 className="font-bold text-gray-900 text-xl uppercase">Sơ đồ chọn ghế</h2>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase border ${selectedSeatIds.length === requiredSeatCount ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                    Đã chọn {selectedSeatIds.length} / {requiredSeatCount}
                  </span>
                </div>

                {loadingSeats ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredSeats.length === 0 ? (
                  <div className="bg-gray-50 text-gray-500 p-4 rounded-xl text-center font-medium text-sm">
                    Không có ghế trống cho lịch chiếu này.
                  </div>
                ) : (
                  <div>
                    {Object.keys(seatRequirementsBySection).length > 1 && (
                      <p className="text-sm font-bold text-blue-600 bg-blue-50 p-3 rounded-lg mb-4">
                        * Vui lòng chọn ghế tương ứng với các khu vực của vé bạn đã đặt.
                      </p>
                    )}

                    {Object.entries(seatsBySection).map(([sectionName, rows]) => {
                      const sectionEntry = Object.entries(seatRequirementsBySection).find(([, val]) => val.sectionName === sectionName);
                      const sectionId = sectionEntry ? Number(sectionEntry[0]) : null;
                      const sectionReq = sectionEntry ? sectionEntry[1].required : 0;
                      const sectionSelected = sectionId ? (selectedSeatsBySection[sectionId] || 0) : 0;
                      const sectionFull = sectionReq > 0 && sectionSelected >= sectionReq;

                      return (
                        <div key={sectionName} className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-gray-800 uppercase">{sectionName}</h3>
                            {sectionReq > 0 && (
                              <span className={`text-xs font-bold px-2 py-1 rounded ${sectionSelected === sectionReq ? 'bg-green-100 text-green-700' : 'bg-white text-gray-500 shadow-sm'}`}>
                                Đã chọn: {sectionSelected}/{sectionReq}
                              </span>
                            )}
                          </div>

                          {Object.entries(rows).map(([rowLabel, seats]) => (
                            <div key={rowLabel} className="flex items-center gap-3 mb-2">
                              <div className="w-8 text-center font-extrabold text-gray-400 bg-white shadow-sm rounded-md py-1">
                                {rowLabel}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {seats.map((seat) => {
                                  const isSelected = selectedSeatIds.includes(seat.id);
                                  const isDisabled = !seat.available;
                                  const isSectionFull = !isSelected && sectionFull;
                                  const isGlobalFull = !isSelected && selectedSeatIds.length >= requiredSeatCount;

                                  let btnClass = "w-9 h-9 text-xs font-bold rounded-md flex items-center justify-center transition-all ";
                                  if (isSelected) {
                                    btnClass += "bg-primary text-white shadow-md scale-105";
                                  } else if (isDisabled) {
                                    btnClass += "bg-gray-200 text-gray-400 cursor-not-allowed";
                                  } else if (isSectionFull || isGlobalFull) {
                                    btnClass += "border border-gray-300 text-gray-400 cursor-not-allowed opacity-50";
                                  } else {
                                    btnClass += "border border-primary text-primary hover:bg-primary hover:text-white cursor-pointer";
                                  }

                                  return (
                                    <button
                                      key={seat.id}
                                      disabled={isDisabled || isSectionFull || isGlobalFull}
                                      onClick={() => handleSeatToggle(seat.id)}
                                      className={btnClass}
                                    >
                                      {seat.seatNumber}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}

                    {/* Chú giải */}
                    <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-200 justify-center">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border border-primary rounded-md" />
                        <span className="text-xs font-bold text-gray-600">Trống</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-primary rounded-md shadow-sm" />
                        <span className="text-xs font-bold text-gray-600">Đang chọn</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-gray-200 rounded-md" />
                        <span className="text-xs font-bold text-gray-600">Đã bán</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {requiresSeats && !selectedSchedule && itemCount > 0 && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-xl font-bold flex items-center gap-3 shadow-sm">
                <InfoIcon className="w-5 h-5" /> Vui lòng chọn lịch chiếu bên trên để chọn ghế!
              </div>
            )}

            {/* 4. MÃ GIẢM GIÁ */}
            <div className="bg-white rounded-2xl p-7 shadow-lg">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => (showPromos ? setShowPromos(false) : handleFetchPromos())}
              >
                <h2 className="font-bold text-gray-900 text-xl uppercase flex items-center gap-2">
                  <Tag className="w-6 h-6 text-primary" /> Mã Giảm Giá
                </h2>
                {showPromos ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
              </div>

              {showPromos && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {loadingPromos ? (
                    <div className="text-sm font-medium text-gray-500 italic">Đang tìm mã giảm giá phù hợp...</div>
                  ) : promos.length === 0 ? (
                    <div className="text-sm font-medium text-gray-500 italic">Không có mã giảm giá nào áp dụng được cho đơn này.</div>
                  ) : (
                    <div className="space-y-3">
                      {promos.map((promo) => {
                        const isSelected = selectedPromo?.id === promo.id;
                        return (
                          <div
                            key={promo.id}
                            onClick={() => setSelectedPromo(isSelected ? null : promo)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
                              }`}
                          >
                            <div>
                              <p className="font-extrabold text-gray-900 uppercase flex items-center gap-2">
                                {promo.code}
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                              </p>
                              {promo.description && (
                                <p className="text-xs font-medium text-gray-500 mt-1">{promo.description}</p>
                              )}
                            </div>
                            <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-sm shadow-sm border border-green-200">
                              - {formatCurrency(promo.discountAmount)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

          </section>

          {/* CỘT PHẢI - TÓM TẮT ĐƠN HÀNG */}
          <aside className="md:col-span-4 relative">
            <div className="bg-gray-900 rounded-2xl shadow-xl sticky top-[100px] overflow-hidden">
              <div className="p-6 bg-gray-900">
                <h2 className="font-extrabold text-white text-xl text-center line-clamp-2 uppercase">
                  {event.name}
                </h2>
              </div>

              <div className="h-0.5 bg-white/20 mx-6" />

              <div className="bg-white rounded-xl m-6 p-6 shadow-sm">
                <h3 className="font-bold text-primary text-xl text-center mb-6 uppercase">
                  Tóm tắt đơn hàng
                </h3>

                <div className="space-y-4 mb-6">
                  {Object.entries(quantities)
                    .filter(([, qty]) => qty > 0)
                    .map(([ttId, qty]) => {
                      const tt = ticketTypes.find((t) => t.id === parseInt(ttId));
                      return (
                        <div key={ttId} className="flex justify-between items-start">
                          <span className="font-bold text-gray-700 text-sm w-2/3 pr-2 leading-tight">
                            {tt?.name} <span className="text-primary mx-1">x</span> {qty}
                          </span>
                          <span className="font-extrabold text-gray-900 text-sm">
                            {formatCurrency(tt?.price * qty)}
                          </span>
                        </div>
                      );
                    })}

                  {itemCount === 0 && (
                    <div className="text-center text-gray-400 font-medium text-sm italic">
                      Bạn chưa chọn vé nào
                    </div>
                  )}
                </div>

                {requiresSeats && selectedSeatIds.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-6">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Ghế đã chọn:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSeatIds.map((seatId) => {
                        const seat = filteredSeats.find((s) => s.id === seatId);
                        return (
                          <span key={seatId} className="bg-white border border-primary text-primary text-xs font-bold px-2 py-1 rounded shadow-sm">
                            {seat ? `${seat.rowNumber}${seat.seatNumber}` : seatId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-500 text-sm">Tạm tính:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
                  </div>

                  {selectedPromo && (
                    <div className="flex justify-between">
                      <span className="font-bold text-green-600 text-sm">Mã ({selectedPromo.code}):</span>
                      <span className="font-bold text-green-600">- {formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <span className="font-extrabold text-gray-900 text-lg uppercase">Tổng cộng:</span>
                    <span className="font-extrabold text-primary text-2xl">{formatCurrency(finalAmount)}</span>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || itemCount === 0 || (requiresSeats && selectedSeatIds.length !== requiredSeatCount)}
                    className="w-full bg-primary hover:bg-red-600 text-white font-bold py-3.5 rounded-xl transition-colors uppercase tracking-wide shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Đang xử lý...' : 'THANH TOÁN NGAY'}
                  </button>
                </div>

                <p className="text-[11px] font-bold text-gray-400 text-center mt-4 uppercase">
                  * Vé sẽ được giữ trong vòng 15 phút
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CreateBookingPage;