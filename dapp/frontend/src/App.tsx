import React from 'react';
import { WagmiProvider, createConfig, http } from "wagmi";
import { base, baseSepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { call } from '@wagmi/core'
import FAQ from './pages/FAQ';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import TokenPage from './pages/TokenPage';
import HIGHToken from "./pages/H1GH-token"
import {ethers} from "ethers";
import ReferralLink from './pages/ReferralLink';
import Roadmap from "./pages/Roadmap";

export const config = createConfig(
    getDefaultConfig({
        // Your dApps chains
        chains: import.meta.env.PROD? [base]:[base, baseSepolia],
        transports: {
            // RPC URL for each chain
            [baseSepolia.id]: http(
                `https://base-sepolia.infura.io/v3/437701cae8664f0a932ce1526b6a1638`,
            ),
            [base.id]: http(
                `https://base-mainnet.infura.io/v3/437701cae8664f0a932ce1526b6a1638`,
            )
        },
        // Required API Keys
        walletConnectProjectId: "29d9726a4240db1be3c6f3cc198d6950",
        // Required App Info
        appName: "coin-leaders.com",
        // Optional App Info
        appDescription: "coin-leaders.com",
        appUrl: "https://coin-leaders.com", // your app's url
        appIcon: "https://coin-leaders.com", // your app's icon, no bigger than 1024x1024px (max. 1MB)
    }),
);
const queryClient = new QueryClient()
export const Web3Provider = ({ children }) => {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ConnectKitProvider>{children}</ConnectKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};


const App: React.FC = () => {
    return (
        <Web3Provider>

                <Router>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/token/:tokenAddress" element={<TokenPage />} />
                        <Route path="/faqs" element={<FAQ />} />
                        <Route path="/referrer" element={<ReferralLink />} />
                        <Route path="/h1gh-token" element={<HIGHToken />} />
                        <Route path="/roadmap" element={<Roadmap />} />
                    </Routes>
                </Router>
        </Web3Provider>
    );
};

export default App;

// Save the referral parameter to localStorage
function saveReferral(referral) {
    localStorage.setItem('referral', referral);
}
function saveComm(comm){
    localStorage.setItem('comm', comm);
}
// Retrieve the referral parameter from localStorage
function getReferral() {
    return localStorage.getItem('referral');
}
function getComm(){
    return localStorage.getItem('comm');
}

// Check if referral parameter exists in URL and store it
function checkAndStoreReferral() {
    const urlParams = new URLSearchParams(window.location.search);

    const referral = urlParams.get('referral');
    const comm = urlParams.get('c');

    if (referral && !getReferral()) {
        saveReferral(referral);
    }
    if(comm && !getComm()){
        saveComm(comm);
    }
    if(referral) urlParams.delete('referral');
    if(comm) urlParams.delete('c')
    if(referral||comm){
        console.log("replacing", urlParams.toString(), urlParams.toString().length)
        // Update the URL in the browser without reloading the page
        const newUrl = window.location.pathname + ((urlParams.toString())?( '?' + urlParams.toString()):"");
        window.history.replaceState({}, '', newUrl);
    }

    console.log("REFF->>>>>",getComm(),getReferral());
}

// Call this function when the page loads
checkAndStoreReferral();

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        logErrorToMyService(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <h1>Something went wrong.</h1>;
        }

        return this.props.children;
    }
}