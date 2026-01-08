import React, { useState } from 'react';
import { Send, PlusCircle, ShieldCheck, Lock, Flame, History, AlertCircle, ArrowRight, Users, Search, Fuel } from 'lucide-react';
import { Toast, ToastType } from './Toast';

interface TokenInteractProps {
    account: string;
}

// Transaction History Type
interface Transaction {
    id: number;
    type: 'Transfer' | 'Approve' | 'Mint' | 'Burn' | 'Airdrop';
    amount: string;
    from: string;
    to: string;
    timestamp: string;
    status: 'success' | 'failed';
}

type TabType = 'actions' | 'history';
type ActionType = 'transfer' | 'approve' | 'admin' | 'tools';

// Validation Helpers
const isValidAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address);
const isValidAmount = (amount: string) => !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;

export const TokenInteract: React.FC<TokenInteractProps> = ({ account }) => {
    // UI State
    const [activeTab, setActiveTab] = useState<TabType>('actions');
    const [activeAction, setActiveAction] = useState<ActionType>('transfer');
    const [toast, setToast] = useState<{ msg: string, type: ToastType } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Validation State
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    // Data State
    const [balance, setBalance] = useState<string>("1000000");
    const [totalSupply, setTotalSupply] = useState<string>("1000000000");
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    
    // Mock Allowance State for Checker
    const [queriedAllowance, setQueriedAllowance] = useState<string | null>(null);

    // Inputs
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [spender, setSpender] = useState("");
    const [approveAmt, setApproveAmt] = useState("");
    const [burnAmount, setBurnAmount] = useState("");
    
    // Tools Inputs
    const [airdropList, setAirdropList] = useState(""); // CSV or new line
    const [checkOwner, setCheckOwner] = useState("");
    const [checkSpender, setCheckSpender] = useState("");

    // Helper: Show Toast
    const showToast = (message: string, type: ToastType) => {
        setToast({ msg: message, type });
    };

    // Helper: Add Transaction
    const addTransaction = (type: Transaction['type'], amount: string, from: string, to: string) => {
        const newTx: Transaction = {
            id: Date.now(),
            type,
            amount,
            from,
            to,
            timestamp: new Date().toLocaleTimeString(),
            status: 'success'
        };
        setTransactions(prev => [newTx, ...prev]);
    };

    // Helper: Clear Errors
    const clearError = (field: string) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    };

    // Actions
    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: {[key: string]: string} = {};
        if (!isValidAddress(recipient)) newErrors.recipient = "请输入有效的 0x 开头钱包地址";
        if (!isValidAmount(amount)) newErrors.amount = "请输入有效的正数金额";
        else if (parseFloat(amount) > parseFloat(balance)) newErrors.amount = "余额不足";
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setBalance(prev => (parseFloat(prev) - parseFloat(amount)).toString());
            addTransaction('Transfer', amount, account, recipient);
            showToast(`成功转账 ${amount} MTK`, "success");
            setAmount("");
            setRecipient("");
            setIsLoading(false);
        }, 1000);
    };

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: {[key: string]: string} = {};
        if (!isValidAddress(spender)) newErrors.spender = "请输入有效的合约或钱包地址";
        if (!isValidAmount(approveAmt)) newErrors.approveAmt = "请输入有效的正数金额";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            addTransaction('Approve', approveAmt, account, spender);
            showToast(`已授权 ${approveAmt} MTK`, "success");
            setApproveAmt("");
            setSpender("");
            setIsLoading(false);
        }, 800);
    };

    const handleMint = () => {
        setIsLoading(true);
        setTimeout(() => {
            const mintAmt = "10000";
            setTotalSupply(prev => (parseFloat(prev) + parseFloat(mintAmt)).toString());
            setBalance(prev => (parseFloat(prev) + parseFloat(mintAmt)).toString());
            addTransaction('Mint', mintAmt, "0x0000...0000", account);
            showToast("成功铸造 10,000 MTK", "success");
            setIsLoading(false);
        }, 1000);
    };

    const handleBurn = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: {[key: string]: string} = {};
        if (!isValidAmount(burnAmount)) newErrors.burnAmount = "请输入有效的正数金额";
        else if (parseFloat(burnAmount) > parseFloat(balance)) newErrors.burnAmount = "余额不足以销毁";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setTotalSupply(prev => (parseFloat(prev) - parseFloat(burnAmount)).toString());
            setBalance(prev => (parseFloat(prev) - parseFloat(burnAmount)).toString());
            addTransaction('Burn', burnAmount, account, "0x0000...0000");
            showToast(`成功销毁 ${burnAmount} MTK`, "success");
            setBurnAmount("");
            setIsLoading(false);
        }, 1000);
    };

    // New Features: Tools
    const handleAirdrop = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Parse addresses
        const lines = airdropList.split(/[\n,]+/).map(l => l.trim()).filter(l => l);
        const amountPerUser = "100"; // Fixed for simulation simplicity or add input
        const totalNeeded = lines.length * parseFloat(amountPerUser);

        const newErrors: {[key: string]: string} = {};
        if (lines.length === 0) newErrors.airdropList = "请输入至少一个地址";
        else if (lines.some(addr => !isValidAddress(addr))) newErrors.airdropList = "包含无效的地址格式，请检查";
        else if (totalNeeded > parseFloat(balance)) newErrors.airdropList = `余额不足，需要 ${totalNeeded} MTK`;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setBalance(prev => (parseFloat(prev) - totalNeeded).toString());
            addTransaction('Airdrop', totalNeeded.toString(), account, `Batch (${lines.length} users)`);
            showToast(`成功向 ${lines.length} 个地址发送空投`, "success");
            setAirdropList("");
            setIsLoading(false);
        }, 1500);
    };

    const handleCheckAllowance = (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: {[key: string]: string} = {};
        if (!isValidAddress(checkOwner)) newErrors.checkOwner = "无效的所有者地址";
        if (!isValidAddress(checkSpender)) newErrors.checkSpender = "无效的被授权者地址";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Simulate Query
        setIsLoading(true);
        setQueriedAllowance(null);
        setTimeout(() => {
            // Mock random result for demo purposes if not "Me"
            if (checkOwner.toLowerCase() === account.toLowerCase()) {
                setQueriedAllowance("50000.00"); // Mock data for demo
            } else {
                setQueriedAllowance("0.00");
            }
            setIsLoading(false);
        }, 600);
    };

    // Components
    const IOSTab = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
        <button 
            onClick={onClick}
            className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                isActive ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
            }`}
        >
            {label}
        </button>
    );

    const IOSInput = ({ value, onChange, placeholder, type = "text", error, name, multiline }: any) => (
        <div className="relative">
            {multiline ? (
                <textarea
                    value={value}
                    onChange={(e) => {
                        onChange(e);
                        if (error) clearError(name);
                    }}
                    placeholder={placeholder}
                    rows={4}
                    className={`w-full bg-slate-800/50 border rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 transition-all outline-none font-mono text-xs ${
                        error 
                        ? 'border-red-500/50 focus:ring-red-500/20' 
                        : 'border-transparent focus:ring-indigo-500/50'
                    }`}
                />
            ) : (
                <input 
                    type={type}
                    value={value}
                    onChange={(e) => {
                        onChange(e);
                        if (error) clearError(name);
                    }}
                    placeholder={placeholder}
                    className={`w-full bg-slate-800/50 border rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 transition-all outline-none ${
                        error 
                        ? 'border-red-500/50 focus:ring-red-500/20' 
                        : 'border-transparent focus:ring-indigo-500/50'
                    }`}
                />
            )}
            {!multiline && error && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                     <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
            )}
            {error && (
                <p className="text-xs text-red-400 mt-2 ml-1 animate-in slide-in-from-top-1">{error}</p>
            )}
        </div>
    );

    const GasEstimator = () => (
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-2 ml-1">
            <Fuel className="w-3 h-3" />
            <span>预估 Gas: <span className="text-slate-300">0.0004 ETH</span></span>
        </div>
    );

    const IOSButton = ({ children, onClick, variant = 'primary', disabled }: any) => {
        const baseStyle = "w-full py-4 rounded-xl font-semibold text-white active:scale-95 transition-transform duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed";
        const variants = {
            primary: "bg-blue-600 hover:bg-blue-500",
            success: "bg-emerald-600 hover:bg-emerald-500",
            danger: "bg-red-600 hover:bg-red-500",
            secondary: "bg-slate-700 hover:bg-slate-600",
            purple: "bg-purple-600 hover:bg-purple-500"
        };
        return (
            <button onClick={onClick} className={`${baseStyle} ${variants[variant as keyof typeof variants]}`} disabled={disabled}>
                {isLoading ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span> : children}
            </button>
        );
    };

    const shortenAddress = (addr: string) => {
        if (!addr) return "";
        if (addr === "Me" || addr === "0x0000...0000") return addr;
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            {/* Wallet Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e] rounded-[2rem] p-8 shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-white tracking-tight">MyToken</h2>
                            <p className="text-slate-400 font-medium">ERC20 Asset</p>
                        </div>
                        <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/5">
                            <span className="text-xs font-mono text-slate-300">Sepolia</span>
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <p className="text-5xl font-bold text-white tracking-tighter">
                            {parseFloat(balance).toLocaleString()} 
                            <span className="text-2xl text-slate-500 ml-2 font-normal">MTK</span>
                        </p>
                        <p className="text-sm text-slate-500 font-medium">
                            ≈ $0.00 USD (Testnet)
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500"></div>
                            <span className="text-xs font-mono text-slate-400">{shortenAddress(account)}</span>
                         </div>
                         <div className="text-xs text-slate-500">
                             总供应: {(parseFloat(totalSupply) / 1000000).toFixed(1)}M
                         </div>
                    </div>
                </div>
            </div>

            {/* Main Interface */}
            <div className="bg-[#1c1c1e]/80 backdrop-blur-xl rounded-[2rem] border border-white/5 overflow-hidden shadow-xl">
                {/* Segmented Control */}
                <div className="p-2 bg-black/20 m-4 rounded-full flex">
                    <IOSTab label="操作" isActive={activeTab === 'actions'} onClick={() => setActiveTab('actions')} />
                    <IOSTab label="记录" isActive={activeTab === 'history'} onClick={() => setActiveTab('history')} />
                </div>

                {activeTab === 'actions' && (
                    <div className="p-6 pt-2">
                        {/* Action Sub-Selector */}
                        <div className="flex gap-4 mb-6 overflow-x-auto pb-2 no-scrollbar">
                            {[
                                { id: 'transfer', label: '转账', icon: Send },
                                { id: 'approve', label: '授权', icon: ShieldCheck },
                                { id: 'admin', label: '管理', icon: Lock },
                                { id: 'tools', label: '工具', icon: Users },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveAction(item.id as ActionType)}
                                    className={`flex flex-col items-center gap-2 min-w-[70px] p-3 rounded-2xl transition-all ${
                                        activeAction === item.id ? 'bg-indigo-600 text-white' : 'bg-slate-800/50 text-slate-400'
                                    }`}
                                >
                                    <item.icon className="w-6 h-6" />
                                    <span className="text-xs font-medium">{item.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="min-h-[300px] animate-in slide-in-from-right-4 duration-300">
                            {activeAction === 'transfer' && (
                                <form onSubmit={handleTransfer} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400 ml-1">接收地址</label>
                                        <IOSInput 
                                            name="recipient"
                                            value={recipient} 
                                            onChange={(e: any) => setRecipient(e.target.value)} 
                                            placeholder="0x..." 
                                            error={errors.recipient}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400 ml-1">金额 (MTK)</label>
                                        <IOSInput 
                                            name="amount"
                                            value={amount} 
                                            onChange={(e: any) => setAmount(e.target.value)} 
                                            placeholder="0.0" 
                                            type="number" 
                                            error={errors.amount}
                                        />
                                    </div>
                                    <div className="pt-4">
                                        <IOSButton variant="primary">确认转账</IOSButton>
                                        <GasEstimator />
                                    </div>
                                </form>
                            )}

                            {activeAction === 'approve' && (
                                <form onSubmit={handleApprove} className="space-y-4">
                                    <div className="p-4 bg-indigo-500/10 rounded-xl mb-4 border border-indigo-500/10">
                                        <p className="text-sm text-indigo-300">允许第三方合约或地址支配您的代币。</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400 ml-1">Spender 地址</label>
                                        <IOSInput 
                                            name="spender"
                                            value={spender} 
                                            onChange={(e: any) => setSpender(e.target.value)} 
                                            placeholder="0x..." 
                                            error={errors.spender}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400 ml-1">授权额度</label>
                                        <IOSInput 
                                            name="approveAmt"
                                            value={approveAmt} 
                                            onChange={(e: any) => setApproveAmt(e.target.value)} 
                                            placeholder="0.0" 
                                            type="number" 
                                            error={errors.approveAmt}
                                        />
                                    </div>
                                    <div className="pt-4">
                                        <IOSButton variant="success">确认授权</IOSButton>
                                        <GasEstimator />
                                    </div>
                                </form>
                            )}

                            {activeAction === 'admin' && (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">铸造代币 (Mint)</h3>
                                        <IOSButton onClick={handleMint} variant="secondary">
                                            <PlusCircle className="w-5 h-5" /> 铸造 10,000 MTK
                                        </IOSButton>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-white/5">
                                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">销毁代币 (Burn)</h3>
                                        <form onSubmit={handleBurn} className="space-y-3">
                                            <IOSInput 
                                                name="burnAmount"
                                                value={burnAmount} 
                                                onChange={(e: any) => setBurnAmount(e.target.value)} 
                                                placeholder="销毁数量" 
                                                type="number" 
                                                error={errors.burnAmount}
                                            />
                                            <div className="pt-2">
                                                <IOSButton variant="danger">
                                                    <Flame className="w-5 h-5" /> 销毁
                                                </IOSButton>
                                                <GasEstimator />
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {activeAction === 'tools' && (
                                <div className="space-y-8">
                                    {/* Airdrop Tool */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users className="w-5 h-5 text-purple-400" />
                                            <h3 className="text-sm font-bold text-white">批量空投 (Airdrop)</h3>
                                        </div>
                                        <form onSubmit={handleAirdrop} className="space-y-3">
                                            <div className="space-y-2">
                                                <label className="text-xs text-slate-500 ml-1">地址列表 (每行一个或逗号分隔)</label>
                                                <IOSInput 
                                                    name="airdropList"
                                                    value={airdropList} 
                                                    onChange={(e: any) => setAirdropList(e.target.value)} 
                                                    placeholder="0x123...&#10;0x456...&#10;0x789..." 
                                                    multiline
                                                    error={errors.airdropList}
                                                />
                                            </div>
                                            <div className="pt-2">
                                                <IOSButton variant="purple">
                                                    <Send className="w-5 h-5" /> 发送空投 (100 MTK/人)
                                                </IOSButton>
                                                <GasEstimator />
                                            </div>
                                        </form>
                                    </div>

                                    <div className="border-t border-white/5"></div>

                                    {/* Allowance Checker */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Search className="w-5 h-5 text-indigo-400" />
                                            <h3 className="text-sm font-bold text-white">查询授权 (Check Allowance)</h3>
                                        </div>
                                        <form onSubmit={handleCheckAllowance} className="space-y-3">
                                            <IOSInput 
                                                name="checkOwner"
                                                value={checkOwner} 
                                                onChange={(e: any) => setCheckOwner(e.target.value)} 
                                                placeholder="Owner 地址 (0x...)" 
                                                error={errors.checkOwner}
                                            />
                                            <IOSInput 
                                                name="checkSpender"
                                                value={checkSpender} 
                                                onChange={(e: any) => setCheckSpender(e.target.value)} 
                                                placeholder="Spender 地址 (0x...)" 
                                                error={errors.checkSpender}
                                            />
                                            <IOSButton variant="secondary">
                                                查询额度
                                            </IOSButton>
                                        </form>
                                        
                                        {queriedAllowance !== null && (
                                            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex justify-between items-center animate-in zoom-in duration-300">
                                                <span className="text-sm text-indigo-200">当前授权额度:</span>
                                                <span className="text-xl font-bold text-white">{queriedAllowance} MTK</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="min-h-[400px]">
                        {transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
                                <History className="w-12 h-12 mb-3 opacity-20" />
                                <p>暂无交易记录</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {transactions.map((tx) => (
                                    <div key={tx.id} className="p-4 hover:bg-white/5 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                    tx.type === 'Transfer' ? 'bg-blue-500/20 text-blue-400' :
                                                    tx.type === 'Mint' ? 'bg-purple-500/20 text-purple-400' :
                                                    tx.type === 'Burn' ? 'bg-red-500/20 text-red-400' :
                                                    tx.type === 'Airdrop' ? 'bg-pink-500/20 text-pink-400' :
                                                    'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                    {tx.type === 'Transfer' && <Send className="w-5 h-5" />}
                                                    {tx.type === 'Mint' && <PlusCircle className="w-5 h-5" />}
                                                    {tx.type === 'Burn' && <Flame className="w-5 h-5" />}
                                                    {tx.type === 'Approve' && <ShieldCheck className="w-5 h-5" />}
                                                    {tx.type === 'Airdrop' && <Users className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{tx.type}</p>
                                                    <p className="text-xs text-slate-500">{tx.timestamp}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-mono font-bold ${
                                                    tx.type === 'Transfer' || tx.type === 'Burn' || tx.type === 'Airdrop' ? 'text-white' : 'text-emerald-400'
                                                }`}>
                                                    {tx.type === 'Transfer' || tx.type === 'Burn' || tx.type === 'Airdrop' ? '-' : '+'}{tx.amount}
                                                </p>
                                                <p className="text-xs text-slate-500">MTK</p>
                                            </div>
                                        </div>
                                        
                                        {/* Transaction Details (From -> To) */}
                                        <div className="bg-black/20 rounded-lg p-2 flex items-center justify-between gap-2 text-xs font-mono">
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-slate-500 text-[10px] uppercase">From</span>
                                                <span className="text-slate-300 truncate w-24 sm:w-auto">
                                                    {shortenAddress(tx.from)}
                                                </span>
                                            </div>
                                            <ArrowRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
                                            <div className="flex flex-col min-w-0 items-end">
                                                <span className="text-slate-500 text-[10px] uppercase">To</span>
                                                <span className="text-slate-300 truncate w-24 sm:w-auto">
                                                    {shortenAddress(tx.to)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};