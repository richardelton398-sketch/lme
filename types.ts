export interface TokenStats {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    myBalance: string;
}

export enum ProcessingStatus {
    IDLE = 'IDLE',
    PROCESSING = 'PROCESSING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR'
}

declare global {
    interface Window {
        ethereum?: any;
    }
}