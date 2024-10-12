// src/pages/FAQ.tsx
import React from 'react';
import Header from '../components/Header';
import "../styles/FAQ.scss";

const HIGHToken: React.FC = () => {
    return (
        <div className="faq-page">
            <Header />
            <main className="faq-content">
                <br/><br/>
                <h1>About $H1GH token</h1>
                <br/><br/>
                <div className="faq-item">
                    <h2>What $H1GH token?</h2>
                    <p>For each time someone makes a deposit, he will receive the USD value in $H1GH tokens (not yet, but an airdrop from snapshot will be done)</p>
                    <h2>Are burned somehow?</h2>
                    <p>Yes, $H1GH has his own leaderboard, but the difference to other tokens, is that when we make a deposit, all the $H1GH is burned</p>
                    <h2>Does it have more uses?</h2>
                    <p>Yes, we will have our own marketplace where you can also spend $H1GH for physical merchandising, NFTs, etc.</p>
                    <p>We well also form a DAO and The voting power will be determined by holded/burned $H1GH .</p>
                </div>
            </main>

        </div>
    );
};

export default HIGHToken;
