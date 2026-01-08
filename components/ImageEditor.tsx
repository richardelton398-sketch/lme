import React, { useState, useRef } from 'react';
import { Upload, Wand2, Sparkles, AlertCircle } from 'lucide-react';
import { editImageWithGemini } from '../services/geminiService';
import { ProcessingStatus } from '../types';

export const ImageEditor: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>("");
    const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setResultImage(null);
                setStatus(ProcessingStatus.IDLE);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!image || !prompt) return;

        setStatus(ProcessingStatus.PROCESSING);
        try {
            const result = await editImageWithGemini(image, prompt);
            setResultImage(result);
            setStatus(ProcessingStatus.SUCCESS);
        } catch (error) {
            console.error(error);
            setStatus(ProcessingStatus.ERROR);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Input Section */}
            <div className="space-y-6">
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-indigo-400" />
                        源图片
                    </h3>
                    
                    <div 
                        className={`relative aspect-square rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-indigo-500/50 hover:bg-slate-800/50 ${image ? 'border-none p-0 overflow-hidden bg-black' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {image ? (
                            <img src={image} alt="Source" className="w-full h-full object-contain" />
                        ) : (
                            <div className="text-center p-6">
                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Upload className="w-8 h-8 text-slate-500" />
                                </div>
                                <p className="text-slate-300 font-medium">点击上传图片</p>
                                <p className="text-slate-500 text-sm mt-1">PNG, JPG 最大 5MB</p>
                            </div>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>

                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-indigo-400" />
                        AI 魔法编辑提示词
                    </h3>
                    <div className="flex gap-3">
                        <input 
                            type="text" 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="例如：'添加复古滤镜'，'变成赛博朋克风格'..." 
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <button 
                            onClick={handleGenerate}
                            disabled={!image || !prompt || status === ProcessingStatus.PROCESSING}
                            className={`px-6 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                !image || !prompt || status === ProcessingStatus.PROCESSING
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25'
                            }`}
                        >
                            {status === ProcessingStatus.PROCESSING ? '...' : <Sparkles className="w-5 h-5" />}
                        </button>
                    </div>
                     <p className="text-xs text-slate-500 mt-3">
                        由 Gemini 2.5 Flash Image 驱动。描述您想如何更改图片。
                    </p>
                </div>
            </div>

            {/* Output Section */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm flex flex-col h-full">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    生成结果
                </h3>
                
                <div className="flex-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden min-h-[400px]">
                    {status === ProcessingStatus.PROCESSING && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-indigo-300 font-medium animate-pulse">Gemini 正在构思...</p>
                        </div>
                    )}
                    
                    {status === ProcessingStatus.ERROR && (
                         <div className="flex flex-col items-center justify-center text-red-400 p-6 text-center">
                            <AlertCircle className="w-12 h-12 mb-3 opacity-80" />
                            <p className="font-medium">生成失败</p>
                            <p className="text-sm opacity-70 mt-1">请换个提示词重试。</p>
                        </div>
                    )}

                    {!resultImage && status !== ProcessingStatus.PROCESSING && status !== ProcessingStatus.ERROR && (
                        <div className="text-center p-6 text-slate-600">
                             <Wand2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                             <p>编辑后的图片将显示在这里</p>
                        </div>
                    )}

                    {resultImage && (
                        <img 
                            src={resultImage} 
                            alt="Generated" 
                            className="w-full h-full object-contain"
                        />
                    )}
                </div>
                
                {resultImage && (
                    <div className="mt-4 flex justify-end">
                        <button 
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors border border-slate-700"
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = resultImage;
                                link.download = 'mytoken-ai-edit.png';
                                link.click();
                            }}
                        >
                            下载资产
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};