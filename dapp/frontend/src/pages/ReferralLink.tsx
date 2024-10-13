// src/pages/ReferralLink.tsx
import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import Header from '../components/Header';
import "../styles/ReferralLink.scss";

const ReferralLink: React.FC = () => {
    const { address, isConnected } = useAccount();
    const [referralLink, setReferralLink] = useState<string | null>(null);

    const generateReferralLink = () => {
        if (address) {
            setReferralLink(`https://coin-leaders.web3well.com?referral=${address}&c=${getComm()||0}`);
        }else{
            setReferralLink("")
        }
    };

    const copyToClipboard = () => {
        if (referralLink) {
            navigator.clipboard.writeText(referralLink);
            alert("Referral link copied to clipboard!");
        }
    };

    return (
        <div className="referral-link-page">
            <Header />
            <main className="referral-content">
                <h1>Generate Your Referral Link</h1>
                <p>Earn 60% of the deposited tokens as a referrer until 30-October-2024! Share your referral link with others and earn rewards when they make a deposit.</p>

                {!isConnected ? (
                    <>
                        <p>Please connect your wallet to generate a referral link.</p>
                        <ConnectKitButton showAvatar={true} />
                    </>
                ) : (
                    <>
                        <p>Your wallet is connected! Click the button below to generate your referral link.</p>
                        {!referralLink ? (
                            <button className="generate-link-button" onClick={generateReferralLink}>Generate Referral Link</button>
                        ) : (
                            <>
                <textarea
                    className="referral-link-textarea"
                    value={referralLink}
                    readOnly
                />
                                <button className="copy-link-button" onClick={copyToClipboard}>Copy to Clipboard</button>
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default ReferralLink;

function getComm() {
    return localStorage.getItem('comm');
}