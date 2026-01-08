import React, { useState } from 'react';
import { SmartContractView } from './components/SmartContractView';
import { TokenInteract } from './components/TokenInteract';
import { LoginPage } from './components/LoginPage';
import { Wallet, Code, Box, LogOut } from 'lucide-react';

enum Tab {
  CONTRACT = 'CONTRACT',
  INTERACT = 'INTERACT'
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.INTERACT);
  const [account, setAccount] = useState<string | null>(null);

  const handleLogout = () => {
    setAccount(null);
  };

  if (!account) {
      return <LoginPage onLogin={setAccount} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Box className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">MyToken <span className="text-indigo-400">DApp</span></span>
          </div>
          
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/50 p-1 rounded-full border border-slate-700/50">
            <button
              onClick={() => setActiveTab(Tab.INTERACT)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === Tab.INTERACT 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Wallet className="w-4 h-4" />
              钱包
            </button>
            <button
              onClick={() => setActiveTab(Tab.CONTRACT)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === Tab.CONTRACT 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Code className="w-4 h-4" />
              合约代码
            </button>
          </nav>

          <div className="flex items-center gap-4">
             <div className="hidden sm:block px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono text-slate-400">
                {account.slice(0, 6)}...{account.slice(-4)}
             </div>
             <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="退出登录"
             >
                 <LogOut className="w-5 h-5" />
             </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className="md:hidden border-b border-slate-800 bg-slate-900 p-2 flex justify-around">
        <button
            onClick={() => setActiveTab(Tab.INTERACT)}
            className={`p-2 rounded-lg ${activeTab === Tab.INTERACT ? 'bg-slate-800 text-indigo-400' : 'text-slate-400'}`}
        >
            <Wallet className="w-5 h-5" />
        </button>
        <button
            onClick={() => setActiveTab(Tab.CONTRACT)}
            className={`p-2 rounded-lg ${activeTab === Tab.CONTRACT ? 'bg-slate-800 text-indigo-400' : 'text-slate-400'}`}
        >
            <Code className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === Tab.INTERACT && <TokenInteract account={account} />}
        {activeTab === Tab.CONTRACT && <SmartContractView />}
      </main>

      <footer className="border-t border-slate-800 mt-12 py-8 text-center text-slate-500 text-sm">
        <p>由 Hardhat & Ethers.js 驱动</p>
      </footer>
    </div>
  );
};

export default App;