// src/pages/FAQ.tsx
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import "../styles/FAQ.scss";

const FAQ: React.FC = () => {
    return (
        <div className="faq-page">
            <Header />
            <main className="faq-content">
                <h1>Frequently Asked Questions</h1>
                <div className="faq-item">
                    <h2>What is coin-leaders.com?</h2>
                    <p>coin-leaders.com is a platform where users can see the leaderboard of the top depositors of various tokens. It allows users to deposit tokens and compete to be at the top of the leaderboard.</p>
                </div>
                <div className="faq-item">
                    <h2>How can I deposit tokens?</h2>
                    <p>To deposit tokens, you need to connect your wallet, select the token you want to deposit, enter the amount, and confirm the transaction. Your deposit will be reflected in the leaderboard.</p>
                </div>
                <div className="faq-item">
                    <h2>What is the referrer program?</h2>
                    <p>The referrer program allows users to earn a percentage of the deposited tokens by referring others to the platform. If someone makes a deposit using your referral, you'll receive percentage of the deposited tokens.</p>
                </div>
                <div className="faq-item">
                    <h2>Which wallets are supported?</h2>
                    <p>We support various wallets, including MetaMask, WalletConnect, and more. ConnectKit allows for seamless wallet integration.</p>
                </div>
                <div className="faq-item">
                    <h2>Is there a minimum deposit amount?</h2>
                    <p>Yes, there is a minimum deposit amount of 10 wei to ensure that transactions are economically feasible.</p>
                </div>
                <div className="faq-item">
                    <h2>How is my position in the leaderboard determined?</h2>
                    <p>Your position in the leaderboard is based on the total amount of tokens you have deposited. The more you deposit, the higher your position.</p>
                </div>
            </main>

        </div>
    );
};

export default FAQ;
