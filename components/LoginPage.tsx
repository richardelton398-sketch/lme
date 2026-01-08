import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Box, Loader2, Code2 } from 'lucide-react';

interface LoginPageProps {
    onLogin: (address: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const connectWallet = async () => {
        setIsConnecting(true);
        setError(null);

        // check if window.ethereum is available
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Request account access
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                
                if (accounts && accounts.length > 0) {
                    setTimeout(() => onLogin(accounts[0]), 800);
                } else {
                    setError("未找到账户，请检查 MetaMask 是否解锁。");
                }
            } catch (err: any) {
                console.error("MetaMask Connection Error:", err);
                if (err.code === 4001) {
                    setError("用户取消了连接请求。");
                } else {
                    setError("连接失败: " + (err.message || "未知错误"));
                }
            } finally {
                setIsConnecting(false);
            }
        } else {
            setError("未检测到 MetaMask。请确保您已安装插件，或者使用下方的模拟登录。");
            setIsConnecting(false);
        }
    };

    const handleMockLogin = () => {
        setIsConnecting(true);
        setError(null);
        // Simulate network delay
        setTimeout(() => {
            // Use a well-known Hardhat test account address
            onLogin("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"); 
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
            </div>

            <div className="w-full max-w-sm relative z-10 flex flex-col gap-8 animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center text-center gap-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                        <Box className="w-12 h-12 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">MyToken</h1>
                        <p className="text-slate-400 text-base leading-relaxed">
                            下一代去中心化资产管理平台
                            <br />安全 · 极速 · 便捷
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={connectWallet}
                        disabled={isConnecting}
                        className="w-full h-14 bg-white text-black hover:bg-slate-100 disabled:opacity-70 disabled:scale-100 active:scale-95 transition-all duration-200 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 shadow-lg shadow-white/5"
                    >
                        {isConnecting ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <span>连接 MetaMask</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                    
                    {/* Error Message */}
                    {error && (
                        <div className="animate-in fade-in slide-in-from-top-2 p-4 bg-red-500/10 border border-red-500/10 rounded-2xl flex items-start gap-3">
                             <ShieldCheck className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                             <p className="text-sm font-medium text-red-400 text-left leading-tight">{error}</p>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-slate-800"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-black px-2 text-xs text-slate-600">测试选项</span>
                        </div>
                    </div>

                    {/* Mock Login Button */}
                     <button
                        onClick={handleMockLogin}
                        disabled={isConnecting}
                        className="w-full h-12 bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-70 active:scale-95 transition-all duration-200 rounded-2xl font-medium text-sm flex items-center justify-center gap-2"
                    >
                        <Code2 className="w-4 h-4" />
                        <span>模拟登录 (无钱包环境)</span>
                    </button>
                </div>

                <p className="text-center text-xs text-slate-600 font-medium">
                    Powered by Ethereum Sepolia Testnet
                </p>
            </div>
        </div>
    );
};