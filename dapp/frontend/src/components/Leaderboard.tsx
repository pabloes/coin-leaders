import React from 'react';
import { Link } from 'react-router-dom';

import '../styles/Leaderboard.scss';
import {formatBigInt, formatNumber} from "../util/number";
import {formatUnits} from "ethers";
import useTokenInfo from "../hooks/useTokenInfo";
import {useContractRead} from "wagmi";
import {erc20Abi, parseUnits, zeroAddress} from "viem";

interface LeaderboardEntry {
    user: string;
    depositedAmount: number;
    title: string;
    url: string;
}

interface LeaderboardProps {
    position: number;
    title: string;
    entries: LeaderboardEntry[];
    totalAmount: number; // Total amount in the specific token
    usdValue: number; // USD value of the total amount
    className?: string; // Optional additional class name
}


const Leaderboard: React.FC<LeaderboardProps> = ({usdPrice = 0, position, title, entries, totalAmount, className, tokenAddress, showFooter, limit, tokenDecimals}) => {
    return (tokenDecimals !== undefined ? <section className={`leaderboard-section ${className}`}>
            <h2 className="leaderboard-title">
                {position && <span className="token-position">{position}.</span>||null } <Link to={`/token/${tokenAddress}`}>{title}   <div className="add-button">Add♥︎</div></Link>

            </h2>
            <div className="leaderboard-info">
                <span className="leaderboard-total">Total donated: { formatBigInt(totalAmount, tokenDecimals) } ( ${formatNumber(
                    formatBigInt(totalAmount, tokenDecimals,true)* usdPrice
                )} )</span>
            </div>
            <div className="leaderboard-list">
                {entries.slice(0,limit || entries.length).map((entry, index) => {
                    const entryAmountStr =  formatNumber(
                       Number( formatUnits(entry.depositedAmount.toString(),tokenDecimals) )
                    );
                    return (
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            key={index}
                            style={{ backgroundImage: `url(${entry.image})` }}
                            href={`https://${entry.url?.replace("https://","")}` || `https://basescan.io/address/${entry.user.id}`}
                            className={`leaderboard-entry ${index < 3 ? 'top-3' : 'other'}`}
                        >
                            <div className="entry-content">
                                <div className="entry-title">
                                    <span className="leaderboard-entry-position">{index + 1}.</span>{entry.title || entry.user.id}
                                </div>
                                <div className="entry-amount">{
                                    entryAmountStr
                                }</div>
                            </div>
                        </a>
                    )
                })}
            </div>
            {showFooter && (
                <div className="leaderboard-footer">
                    <Link to={`/token/${tokenAddress}`}>More...</Link>
                </div>)
            }
        </section>:null
    );
};

export default Leaderboard;
