import { useIntegrations } from '../../contexts/IntegrationsContext';
import { RazorpayIntegrationService } from '../../services/integrations/razorpayService';
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  CheckCircle2,
  Lock,
  ArrowRight,
  Clock,
  Printer,
  X,
  Smartphone,
  Sparkles,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  customerName: string;
  customerMobile?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  title?: string;
  description?: string;
  onSuccess: (paymentData: {
    paymentId: string;
    referenceNo: string;
    method: 'UPI' | 'Bank Transfer' | 'Simulated Online';
    amount: number;
    date: string;
    notes?: string;
  }) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  amount,
  customerName,
  customerMobile,
  invoiceId,
  invoiceNumber,
  title = 'Harish Dairy Payment Gateway',
  description = 'Instant automated settlement via secure payment gateway',
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [step, setStep] = useState<'checkout' | 'processing' | 'success'>('checkout');
  const [processingStage, setProcessingStage] = useState('Connecting to Banking Gateway...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // UPI State
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'cred' | 'custom'>('gpay');
  const [upiId, setUpiId] = useState(
    customerMobile ? `${customerMobile}@okaxis` : 'customer@okaxis'
  );
  const [qrTimer, setQrTimer] = useState(180); // 3 mins

  // Card State
  const [cardNumber, setCardNumber] = useState('4532 8920 1928 4092');
  const [cardHolder, setCardHolder] = useState(customerName || 'Harish Dairy Customer');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('492');
  const [saveCard, setSaveCard] = useState(true);

  // Netbanking State
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Wallet State
  const [selectedWallet, setSelectedWallet] = useState('Paytm Wallet');

  // Completed Payment Info
  const { integrations } = useIntegrations();
  const razorpay = integrations.razorpay;
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  const [completedPayment, setCompletedPayment] = useState<{
    orderId?: string;
    isSimulated?: boolean;
    paymentId: string;
    referenceNo: string;
    methodLabel: string;
    timestamp: string;
  } | null>(null);

  // Timer countdown for QR
  useEffect(() => {
    if (!isOpen || step !== 'checkout' || activeTab !== 'upi') return;
    const interval = setInterval(() => {
      setQrTimer(prev => (prev > 1 ? prev - 1 : 180));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, step, activeTab]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setStep('checkout');
      setQrTimer(180);
      setCompletedPayment(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPayment = async (methodTitle: string) => {
    setErrorMessage(null);
    setStep('processing');
    setProcessingStage('Creating order with Razorpay gateway...');

    try {
      // 1. Create order on backend API
      const order = await RazorpayIntegrationService.createOrder(
        {
          amount,
          customerId: customerMobile || 'CUST-1001',
          customerName,
          invoiceId,
          notes: { method: methodTitle },
        },
        razorpay
      );

      setCreatedOrder(order);
      setProcessingStage('Authorizing & verifying payment signature...');

      // 2. Perform backend signature verification
      const paymentId = `pay_${Date.now().toString().slice(-8)}`;
      const verification = await RazorpayIntegrationService.verifyPayment(
        {
          orderId: order.orderId,
          paymentId,
          signature: `sig_${order.orderId}_${paymentId}`,
          amount,
          customerId: customerMobile || 'CUST-1001',
          invoiceId,
        },
        razorpay
      );

      if (!verification.verified) {
        throw new Error(verification.message || 'Payment signature verification failed.');
      }

      const now = new Date();
      const paymentInfo = {
        orderId: order.orderId,
        paymentId: verification.paymentId,
        referenceNo: `REF-${order.orderId.slice(-6).toUpperCase()}`,
        methodLabel: methodTitle,
        timestamp: `${now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
        isSimulated: verification.isSimulated,
      };

      setCompletedPayment(paymentInfo);
      setStep('success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
      setStep('checkout');
    }
  };

  const handleFinishSuccess = () => {
    if (!completedPayment) {
      onClose();
      return;
    }

    onSuccess({
      paymentId: completedPayment.paymentId,
      referenceNo: completedPayment.referenceNo,
      method: 'UPI',
      amount,
      date: new Date().toISOString().slice(0, 10),
      notes: `Settled via Harish Dairy Payment Gateway (${completedPayment.methodLabel})`,
    });
    onClose();
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative">
        {/* Top Gateway Secure Brand Bar */}
        <div className="bg-[#14532D] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-extrabold tracking-tight">Harish Dairy Gateway</h3>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                  256-bit SSL
                </span>
              </div>
              <p className="text-[11px] text-emerald-200">RBI Compliant • NPCI Verified</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-emerald-200 block uppercase font-medium">Payable Amount</span>
              <span className="text-base font-extrabold text-white tracking-tight">
                {formatCurrency(amount)}
              </span>
            </div>
            {step === 'checkout' && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors ml-1"
                title="Cancel & Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Invoice / Customer Context Pill */}
        <div className="bg-[#F7F9F7] px-5 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{customerName}</span>
            {customerMobile && <span className="text-slate-400">• {customerMobile}</span>}
          </div>
          {invoiceNumber && (
            <span className="font-mono text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
              {invoiceNumber}
            </span>
          )}
        </div>

        {/* Test Sandbox Mode Banner */}
        <div className="bg-amber-500/10 border-b border-amber-200 px-5 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>Razorpay Sandbox Mode Active</span>
          </div>
          <span className="font-mono text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-semibold">
            {razorpay?.keyId || 'rzp_test_milkerp_dev_2026'}
          </span>
        </div>

        {/* STEP 1: CHECKOUT VIEW */}
        {step === 'checkout' && (
          <div>
            {errorMessage && (
              <div className="mx-5 my-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center justify-between">
                <span>⚠️ {errorMessage}</span>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-red-500 hover:text-red-700 font-bold ml-2 text-sm"
                >
                  ✕
                </button>
              </div>
            )}
            {/* Gateway Methods Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('upi')}
                className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                  activeTab === 'upi'
                    ? 'border-[#16803D] text-[#14532D] bg-white shadow-xs font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>UPI / QR</span>
              </button>

              <button
                onClick={() => setActiveTab('card')}
                className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                  activeTab === 'card'
                    ? 'border-[#16803D] text-[#14532D] bg-white shadow-xs font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Cards</span>
              </button>

              <button
                onClick={() => setActiveTab('netbanking')}
                className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                  activeTab === 'netbanking'
                    ? 'border-[#16803D] text-[#14532D] bg-white shadow-xs font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Net Banking</span>
              </button>

              <button
                onClick={() => setActiveTab('wallet')}
                className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                  activeTab === 'wallet'
                    ? 'border-[#16803D] text-[#14532D] bg-white shadow-xs font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Wallets</span>
              </button>
            </div>

            {/* TAB CONTENT: UPI */}
            {activeTab === 'upi' && (
              <div className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-5 bg-gradient-to-br from-emerald-50/60 to-slate-50 p-4 rounded-2xl border border-emerald-100">
                  {/* High Quality Styled QR Code Simulation */}
                  <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200 text-center relative group">
                    <div className="w-36 h-36 bg-slate-900 rounded-xl p-2 relative flex flex-col justify-between overflow-hidden">
                      {/* Stylized QR grid elements */}
                      <div className="flex justify-between">
                        <div className="w-8 h-8 border-4 border-white bg-slate-900 flex items-center justify-center">
                          <div className="w-3 h-3 bg-white" />
                        </div>
                        <div className="w-8 h-8 border-4 border-white bg-slate-900 flex items-center justify-center">
                          <div className="w-3 h-3 bg-white" />
                        </div>
                      </div>
                      
                      {/* Center Rupee Badge */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-9 h-9 rounded-full bg-[#16803D] text-white font-extrabold flex items-center justify-center text-sm shadow-md border-2 border-white">
                          ₹
                        </div>
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="w-8 h-8 border-4 border-white bg-slate-900 flex items-center justify-center">
                          <div className="w-3 h-3 bg-white" />
                        </div>
                        <div className="w-6 h-6 border-2 border-emerald-400 bg-emerald-500/30 flex items-center justify-center text-[8px] text-white font-mono">
                          HD
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-center gap-1 text-[11px] font-bold text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Expires in {formatTimer(qrTimer)}</span>
                    </div>
                  </div>

                  {/* QR Scan Details & Fast Apps */}
                  <div className="flex-1 space-y-3 text-left w-full">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Scan with any UPI App
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Open GPay, PhonePe, Paytm, BHIM, or CRED to scan & authorize instantly.
                      </p>
                    </div>

                    {/* Instant UPI App Selector */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Or Pay directly via App
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'gpay', label: 'Google Pay', color: 'hover:border-blue-500 bg-blue-50/30 text-blue-900' },
                          { id: 'phonepe', label: 'PhonePe', color: 'hover:border-purple-500 bg-purple-50/30 text-purple-900' },
                          { id: 'paytm', label: 'Paytm UPI', color: 'hover:border-sky-500 bg-sky-50/30 text-sky-900' },
                          { id: 'cred', label: 'CRED UPI', color: 'hover:border-neutral-800 bg-neutral-50 text-neutral-900' },
                        ].map(app => (
                          <button
                            type="button"
                            key={app.id}
                            onClick={() => setSelectedUpiApp(app.id as any)}
                            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                              selectedUpiApp === app.id
                                ? 'border-[#16803D] bg-emerald-50 text-[#14532D] ring-2 ring-emerald-200'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            <span className="truncate">{app.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1-Click Sandbox Test Auto-Approval */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-left">
                    <p className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>1-Click Sandbox Test Payment</span>
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      Simulates customer UPI confirmation via {selectedUpiApp.toUpperCase()} without needing a mobile device.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStartPayment(`UPI Sandbox Simulator (${selectedUpiApp.toUpperCase()})`)}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <span>⚡ Instant Test Approve</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Custom UPI VPA */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 flex justify-between">
                    <span>Or enter UPI ID / VPA</span>
                    <span className="text-emerald-700 text-[11px] font-bold">Auto-verified</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@okhdfcbank"
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleStartPayment(`UPI (${upiId})`)}
                      className="px-4 py-2 bg-[#16803D] hover:bg-[#14532D] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <span>Pay {formatCurrency(amount)}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CARDS */}
            {activeTab === 'card' && (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleStartPayment(`Card ending in ${cardNumber.slice(-4)}`);
                }}
                className="p-5 space-y-3.5 text-xs"
              >
                {/* Test Card Quick Fill Pills */}
                <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Sandbox Quick Fill:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCardNumber('4111 2222 3333 4444');
                      setCardHolder(customerName || 'Test Visa User');
                      setCardExpiry('12/28');
                      setCardCvv('789');
                    }}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                  >
                    ⚡ Test Visa (4111...)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCardNumber('5081 2345 6789 1234');
                      setCardHolder(customerName || 'Test RuPay User');
                      setCardExpiry('10/29');
                      setCardCvv('456');
                    }}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                  >
                    ⚡ Test RuPay (5081...)
                  </button>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      placeholder="4532 •••• •••• 8890"
                      className="w-full pl-3 pr-16 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                      VISA / RuPay
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={e => setCardHolder(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Expiry Date</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">CVV / CVC</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value)}
                      placeholder="•••"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-slate-600 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveCard}
                    onChange={e => setSaveCard(e.target.checked)}
                    className="rounded text-[#16803D] focus:ring-emerald-500"
                  />
                  <span className="text-[11px]">Save card securely as per RBI tokenization guidelines</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-2.5 mt-2 bg-[#16803D] hover:bg-[#14532D] text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Authorize & Pay {formatCurrency(amount)}</span>
                </button>
              </form>
            )}

            {/* TAB CONTENT: NET BANKING */}
            {activeTab === 'netbanking' && (
              <div className="p-5 space-y-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Select Your Bank
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      'HDFC Bank',
                      'SBI',
                      'ICICI Bank',
                      'Axis Bank',
                      'Kotak Bank',
                      'PNB',
                    ].map(bank => (
                      <button
                        type="button"
                        key={bank}
                        onClick={() => setSelectedBank(bank)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          selectedBank === bank
                            ? 'border-[#16803D] bg-emerald-50 text-[#14532D] font-bold ring-2 ring-emerald-200'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <Building2 className="w-4 h-4 mx-auto mb-1 text-slate-500" />
                        <span className="truncate block text-[11px]">{bank}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Or choose other Indian Bank</label>
                  <select
                    value={selectedBank}
                    onChange={e => setSelectedBank(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                    <option value="Canara Bank">Canara Bank</option>
                    <option value="Union Bank of India">Union Bank of India</option>
                    <option value="IndusInd Bank">IndusInd Bank</option>
                    <option value="Yes Bank">Yes Bank</option>
                    <option value="IDFC FIRST Bank">IDFC FIRST Bank</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartPayment(`NetBanking (${selectedBank})`)}
                  className="w-full py-2.5 bg-[#16803D] hover:bg-[#14532D] text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Log in & Pay via {selectedBank}</span>
                </button>
              </div>
            )}

            {/* TAB CONTENT: WALLETS */}
            {activeTab === 'wallet' && (
              <div className="p-5 space-y-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Select Digital Wallet
                  </span>
                  <div className="space-y-2">
                    {[
                      { name: 'Paytm Wallet', desc: 'Direct linking with OTP authentication' },
                      { name: 'Amazon Pay', desc: 'Use Amazon Pay Balance & Cashback' },
                      { name: 'PhonePe Wallet', desc: 'Instant 1-click checkout' },
                      { name: 'MobiKwik', desc: 'ZIP Pay Later & Wallet Balance' },
                    ].map(w => (
                      <button
                        type="button"
                        key={w.name}
                        onClick={() => setSelectedWallet(w.name)}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                          selectedWallet === w.name
                            ? 'border-[#16803D] bg-emerald-50 ring-2 ring-emerald-200'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Wallet className="w-4 h-4 text-emerald-700" />
                          <div>
                            <p className="font-bold text-slate-800">{w.name}</p>
                            <p className="text-[10px] text-slate-500">{w.desc}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#14532D]">Available</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartPayment(`Wallet (${selectedWallet})`)}
                  className="w-full py-2.5 bg-[#16803D] hover:bg-[#14532D] text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Link & Pay {formatCurrency(amount)}</span>
                </button>
              </div>
            )}

            {/* Gateway Footer Security Info */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                End-to-End Encrypted Checkout
              </span>
              <span className="font-mono text-slate-400">HARISH-PG-v2.6</span>
            </div>
          </div>
        )}

        {/* STEP 2: PROCESSING OVERLAY */}
        {step === 'processing' && (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-emerald-100 border-t-[#16803D] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-[#16803D]" />
              </div>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Authorizing {formatCurrency(amount)}
              </h3>
              <p className="text-xs text-slate-500 mt-1 animate-pulse font-medium">
                {processingStage}
              </p>
            </div>

            <div className="max-w-xs bg-slate-50 p-3 rounded-xl border text-[11px] text-slate-600 space-y-1">
              <p>• Do not press back or refresh this screen</p>
              <p>• Transacting with Harish Dairy Merchant Account</p>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION & RECEIPT */}
        {step === 'success' && completedPayment && (
          <div className="p-6 space-y-5 text-center">
            {/* Success Ring Icon */}
            <div className="w-16 h-16 bg-emerald-100 text-[#16803D] rounded-full mx-auto flex items-center justify-center shadow-lg border-2 border-emerald-200">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                Payment Successful
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                {formatCurrency(amount)}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Paid to Harish Dairy & Farm Logistics
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-left space-y-2.5">
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-900">{completedPayment.paymentId}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Bank / UPI RRN:</span>
                <span className="font-mono text-slate-800">{completedPayment.referenceNo}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Payment Channel:</span>
                <span className="font-medium text-slate-900">{completedPayment.methodLabel}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold text-slate-900">{customerName}</span>
              </div>
              {invoiceNumber && (
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Invoice Settle:</span>
                  <span className="font-mono font-bold text-emerald-700">{invoiceNumber}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-slate-500">{completedPayment.timestamp}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>

              <button
                type="button"
                onClick={handleFinishSuccess}
                className="flex-1 py-2.5 px-4 bg-[#16803D] hover:bg-[#14532D] text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Done & Update Account</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
