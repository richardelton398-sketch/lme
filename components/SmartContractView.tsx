import React from 'react';
import { Copy, FileCode } from 'lucide-react';
import { Toast, ToastType } from './Toast';

const CONTRACT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyToken {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    address public owner;
    // ... (Full code truncated for display)
    
    constructor(string memory _name, string memory _symbol, uint256 _initialSupply) {
        name = _name;
        symbol = _symbol;
        owner = msg.sender;
        totalSupply = _initialSupply * (10 ** uint256(decimals));
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    // ...
}`;

export const SmartContractView: React.FC = () => {
    const [toast, setToast] = React.useState<{ msg: string, type: ToastType } | null>(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(CONTRACT_CODE);
        setToast({ msg: "代码已复制", type: "success" });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2rem] border border-white/5 overflow-hidden">
                <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-slate-900/80">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                            <FileCode className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-white">MyToken.sol</h2>
                            <p className="text-xs text-slate-400 font-medium">Solidity 0.8.20</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleCopy}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-xl text-slate-300 transition-all"
                    >
                        <Copy className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                    <pre className="p-6 text-sm font-mono text-emerald-400 bg-black/50 leading-relaxed">
                        <code>{CONTRACT_CODE}</code>
                    </pre>
                </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5">
                <h3 className="text-lg font-bold text-white mb-4">快速部署</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-white/5">
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">1</div>
                        <code className="text-sm text-indigo-300 font-mono">npx hardhat init</code>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-white/5">
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">2</div>
                        <code className="text-sm text-indigo-300 font-mono">npm install @nomicfoundation/hardhat-toolbox</code>
                    </div>
                </div>
            </div>
        </div>
    );
};