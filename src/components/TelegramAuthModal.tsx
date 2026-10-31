import React, { useState } from 'react';

interface TelegramAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AuthStep = 'phone' | 'code' | '2fa' | 'success';

export const TelegramAuthModal: React.FC<TelegramAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<AuthStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [password2FA, setPassword2FA] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [apiId, setApiId] = useState('');
  const [apiHash, setApiHash] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      setError('يرجى إدخال رقم الهاتف مع رمز الدولة (مثال: +966555123456)');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const apiIdNum = apiId.trim() ? parseInt(apiId.trim(), 10) : undefined;
      const apiHashStr = apiHash.trim() ? apiHash.trim() : undefined;

      const res = await (window as any).mohivxApi?.telegram?.sendCode(
        phoneNumber.trim(),
        apiIdNum,
        apiHashStr
      );

      if (res?.phoneCodeHash) {
        setStep('code');
      } else {
        setError('تعذر إرسال رمز التحقق. يرجى التأكد من صحة رقم الهاتف.');
      }
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء الاتصال بخوادم Telegram MTProto');
    } finally {
      setLoading(false);
    }
  };

  const handleSignInCode = async () => {
    if (!code.trim()) {
      setError('يرجى إدخال رمز التحقق (OTP) المكون من 5 أرقام');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await (window as any).mohivxApi?.telegram?.signInWithCode(code.trim());
      if (res?.success) {
        setStep('success');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      } else if (res?.requires2FA) {
        setStep('2fa');
      } else {
        setError('رمز التحقق غير صحيح، يرجى المحاولة مجدداً.');
      }
    } catch (err: any) {
      setError(err?.message || 'فشل تسجيل الدخول برمز التحقق');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn2FA = async () => {
    if (!password2FA.trim()) {
      setError('يرجى إدخال كلمة مرور التحقق بخطوتين (2FA)');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await (window as any).mohivxApi?.telegram?.signInWith2FA(password2FA.trim());
      if (res?.success) {
        setStep('success');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      } else {
        setError('كلمة المرور غير صحيحة');
      }
    } catch (err: any) {
      setError(err?.message || 'فشل التحقق بخطوتين');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 select-none animate-in fade-in duration-150">
      <div
        className="w-[440px] bg-[#141415] border border-white/10 rounded-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-[18px] py-[14px] flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-[8px]">
            <div className="w-[28px] h-[28px] rounded-[35%] bg-[#2EA4DB] flex items-center justify-center text-white">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z" />
              </svg>
            </div>
            <h2 className="text-[14px] font-semibold text-white">ربط حساب Telegram الحقيقي</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white p-[4px] rounded-full transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[16px] h-[16px]">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-[20px] space-y-[16px]">
          {error && (
            <div className="p-[10px] rounded-[10px] bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] leading-relaxed">
              {error}
            </div>
          )}

          {step === 'phone' && (
            <div className="space-y-[14px]">
              <p className="text-[13px] text-white/70 leading-relaxed">
                أدخل رقم هاتفك لتسجيل الدخول بأمان عبر بروتوكول <strong>Telegram MTProto</strong> الرسمي. سيصلك رمز التحقق في تطبيق تيليجرام أو برسالة نصية.
              </p>

              <div>
                <label className="text-[11px] font-semibold text-white/50 block mb-[6px]">
                  رقم الهاتف (مع رمز الدولة الدولي)
                </label>
                <div className="h-[40px] px-[12px] bg-[#1c1c1d] rounded-[10px] flex items-center border border-white/10 focus-within:border-[#2EA4DB] transition-all">
                  <input
                    type="tel"
                    autoFocus
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                    placeholder="+966 5X XXX XXXX"
                    dir="ltr"
                    className="flex-1 bg-transparent border-none outline-none text-[14px] text-white placeholder-white/30 font-mono"
                  />
                </div>
              </div>

              {/* Advanced API keys toggle */}
              <div>
                <button
                  type="button"
                  data-testid="tg-advanced-toggle"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-[11px] text-[#2EA4DB] hover:underline flex items-center gap-[4px]"
                >
                  <span>{showAdvanced ? 'إخفاء الإعدادات المتقدمة (مفاتيح API مخصصة)' : 'خيارات متقدمة (استخدام مفاتيح API خاصة)'}</span>
                </button>

                {showAdvanced && (
                  <div className="mt-[10px] p-[10px] rounded-[10px] bg-white/5 space-y-[8px] text-[12px]">
                    <div>
                      <label className="text-[10px] text-white/50 block mb-[2px]">API ID</label>
                      <input
                        type="text"
                        data-testid="tg-api-id-input"
                        value={apiId}
                        onChange={(e) => setApiId(e.target.value)}
                        placeholder="2040 (Telegram Desktop الافتراضي)"
                        className="w-full h-[32px] px-[8px] bg-[#1c1c1d] rounded-[6px] border border-white/10 text-white text-[12px] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/50 block mb-[2px]">API Hash</label>
                      <input
                        type="text"
                        data-testid="tg-api-hash-input"
                        value={apiHash}
                        onChange={(e) => setApiHash(e.target.value)}
                        placeholder="الافتراضي"
                        className="w-full h-[32px] px-[8px] bg-[#1c1c1d] rounded-[6px] border border-white/10 text-white text-[12px] outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                data-testid="tg-send-code"
                onClick={handleSendCode}
                disabled={loading}
                className="w-full h-[40px] bg-[#2EA4DB] hover:bg-[#2593c6] text-white rounded-full font-semibold text-[13px] transition-all flex items-center justify-center gap-[8px] shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-[18px] h-[18px] border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>إرسال رمز التحقق</span>
                )}
              </button>
            </div>
          )}

          {step === 'code' && (
            <div className="space-y-[14px]">
              <div className="p-[10px] bg-blue-500/10 border border-blue-500/20 rounded-[10px] text-[12px] text-blue-300">
                تم إرسال رمز التحقق إلى حسابك على Telegram للرقم: <span dir="ltr" className="font-mono font-bold">{phoneNumber}</span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-white/50 block mb-[6px]">
                  رمز التحقق (OTP)
                </label>
                <div className="h-[44px] px-[12px] bg-[#1c1c1d] rounded-[10px] flex items-center border border-white/10 focus-within:border-[#2EA4DB] transition-all">
                  <input
                    type="text"
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignInCode()}
                    placeholder="12345"
                    dir="ltr"
                    maxLength={10}
                    className="flex-1 bg-transparent border-none outline-none text-[18px] tracking-[6px] text-center text-white placeholder-white/30 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-[8px]">
                <button
                  onClick={() => setStep('phone')}
                  className="w-[100px] h-[40px] bg-white/5 hover:bg-white/10 text-white/70 rounded-full font-semibold text-[12px] transition-all"
                >
                  تغيير الرقم
                </button>
                <button
                  onClick={handleSignInCode}
                  disabled={loading}
                  className="flex-1 h-[40px] bg-[#2EA4DB] hover:bg-[#2593c6] text-white rounded-full font-semibold text-[13px] transition-all flex items-center justify-center gap-[8px] shadow-md disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-[18px] h-[18px] border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>تأكيد وتسجيل الدخول</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === '2fa' && (
            <div className="space-y-[14px]">
              <p className="text-[13px] text-white/70 leading-relaxed">
                حسابك محمي بخاصية التحقق بخطوتين (Two-Step Verification). يرجى إدخال كلمة المرور السحابية لحساب Telegram.
              </p>

              <div>
                <label className="text-[11px] font-semibold text-white/50 block mb-[6px]">
                  كلمة المرور السحابية (2FA Password)
                </label>
                <div className="h-[40px] px-[12px] bg-[#1c1c1d] rounded-[10px] flex items-center border border-white/10 focus-within:border-[#2EA4DB] transition-all">
                  <input
                    type="password"
                    autoFocus
                    value={password2FA}
                    onChange={(e) => setPassword2FA(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignIn2FA()}
                    placeholder="••••••••"
                    className="flex-1 bg-transparent border-none outline-none text-[14px] text-white placeholder-white/30"
                  />
                </div>
              </div>

              <button
                onClick={handleSignIn2FA}
                disabled={loading}
                className="w-full h-[40px] bg-[#2EA4DB] hover:bg-[#2593c6] text-white rounded-full font-semibold text-[13px] transition-all flex items-center justify-center gap-[8px] shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-[18px] h-[18px] border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>فتح الحساب</span>
                )}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="py-[24px] flex flex-col items-center justify-center text-center space-y-[10px]">
              <div className="w-[48px] h-[48px] rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-[24px] h-[24px]">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="text-[15px] font-semibold text-white">تم الاتصال بحساب Telegram بنجاح!</h3>
              <p className="text-[12px] text-white/60">يتم الآن جلب محادثاتك ورسائلك الحقيقية...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-[18px] py-[10px] bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[11px] text-white/50">
          <span>تشفير محلي للجلسة عبر Windows DPAPI</span>
          <span className="text-[#2EA4DB]">MTProto v2.0</span>
        </div>
      </div>
    </div>
  );
};
