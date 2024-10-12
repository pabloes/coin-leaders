// src/pages/FAQ.tsx
import React from 'react';
import Header from '../components/Header';
import "../styles/FAQ.scss";

const Roadmap: React.FC = () => {
    return (
        <div className="faq-page">
            <Header />
            <main className="faq-content">
                <h1>ROADMAP</h1>
                <div className="faq-item">
                    <h2>1.- dApp Launch (DONE)</h2>
                    <p>Solidity contract deployed and verified with theGraph indexation.</p>
                </div>
                <div className="faq-item">
                    <h2>2.- Twitter Account (DONE)</h2>
                    <p>Generate a tweet with a gif of each deposit done using chatGPT.</p>
                </div>
                <div className="faq-item">
                    <h2>3.- Create a #NFT to reward donators (IN PROGRESS)</h2>
                    <p>When someone deposits a certain quantity in USD value, he will receive our wearable.</p>
                </div>
                <div className="faq-item">
                    <h2>4.- Create own ERC20 Token</h2>
                    <p>... More info soon ...</p>
                </div>
                <div className="faq-item">
                    <h2>5.- Reward tokens with each deposit</h2>
                    <p>... More info soon</p>
                </div>
                <div className="faq-item">
                    <h2>6.- DAO</h2>
                    <p>... More info soon ...</p>
                </div>
            </main>

        </div>
    );
};

export default Roadmap;
