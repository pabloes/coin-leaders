import React, { useEffect, useState } from 'react';
import { gql, useQuery } from '@apollo/client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Leaderboard from '../components/Leaderboard';
import { Link } from 'react-router-dom';
import "../styles/Home.scss";
import { useTokens } from "../hooks/useTokens";
import {fetchTokenPrice} from "../util/fetchTokenPrice";

const GET_ALL_TOKENS = gql`
  {
    tokenTotals(orderBy: totalDeposited, orderDirection: desc) {
      tokenAddress
      totalDeposited
      name
      symbol
    }
  }
`;

const GET_TOKENS_AND_LEADERBOARDS = gql`
  query GetTokenTotalsWithLeaderboards($addresses: [Bytes!]) {
    tokenTotals(where: { tokenAddress_in: $addresses }) {
      tokenAddress
      totalDeposited
      name
      symbol
      decimals
      leaderboards(orderBy: depositedAmount, orderDirection: desc, first: 10) {
        user {id}
        depositedAmount
        title
        url
        image
      }
    }
  }
`;

const Home: React.FC = () => {
    const { loading, error, data:allTokens } = useQuery(GET_ALL_TOKENS);
    const [tokens, setTopTokens] = useState<any[]>([]);
    const [topTokenAddresses, setTopTokenAddresses] = useState<string[]>([]);
    const [wearableSupply, setWearableSupply] = useState(0);
    useEffect(()=>{
        (async ()=>{
            try{
                const {result} = await fetch("https://base-coin-leaders.zeroxwork.com/api/wearable-supply").then(r=>r.json());
                console.log("wearableSupply",wearableSupply)
                setWearableSupply(result);
            }catch(error){
                setWearableSupply(0);
                console.log(error)
            }
        })()
    },[]);
    useEffect(() => {
        if (allTokens && allTokens.tokenTotals) {
            const fetchPrices = async () => {
                const tokensWithPrices = await Promise.all(allTokens.tokenTotals.map(async (token: any) => {
                    const price = await fetchTokenPrice(token.symbol);
                    return { ...token, usdValue: token.totalDeposited * (price || 0), price };
                }));

                // Sort tokens by USD value in descending order and take top 3
                const sortedTokens = tokensWithPrices
                    .sort((a, b) => b.usdValue - a.usdValue)
                    .slice(0, 3);
                setTopTokens(sortedTokens);
            };

            fetchPrices();
        }
    }, [allTokens]);

    const { loading: loadingLeaderboards, error: errorLeaderboards, data: leaderboardsData } = useQuery(GET_TOKENS_AND_LEADERBOARDS, {
        variables: { addresses: topTokenAddresses },
        skip: topTokenAddresses.length === 0, // Skip this query if topTokenAddresses is empty
    });

    useEffect(() => {
        if (tokens) {
            setTopTokenAddresses(tokens.map((token: any) => token.tokenAddress));
        }
    }, [tokens]);

    const columns = leaderboardsData?.tokenTotals.map((token: any, index: number) => {
        const className = index === 0 ? 'center' : index === 2 ? 'right' : 'left';
        const title = `${token.name} (${token.symbol})`; // Display name and symbol
        return (
            <div key={token.tokenAddress} className={"leaderboard-wrapper " + className}>
                {index === 1 && <>
                    <div className="explanation">
                        <a href="https://x.com/chainHighscore" target="_blank" rel="noreferrer"><strong style={{color:"orange", fontSize:32}}>?</strong>
                       @chainHighscore</a> publishes <span style={{color:"deeppink"}}>AI</span> generated tweets about deposits on this web<br/><br/>
                        This is an experimental project with leaderboards per tokens where contributors rise based on their <span style={{color:"deeppink"}}>donations ♥︎</span>, displaying custom text, links, and images; then advertised in metaverses and events.
                        Powered by <span style={{color:"turquoise"}}>#ChatGPT #theGraph #Solidity #TwitterSDK</span>
                    </div>
                    <br/><br/><br/>
                </>}
                {index === 2 && (

                        <div className="referrer-promo">
                            <img src="/head_show.gif" />
                            <br/><br/>To <b>get this #NFT wearable</b> make a <span style={{color:"deeppink"}}>donation ♥︎</span> on any token leaderboard for a value greater than $3.00<br/>
                            <br/>
                            (LIMITED SUPPLY: {wearableSupply||0}/100)</div>

                )}
                <Leaderboard
                    position={(index + 1)}
                    title={title}
                    entries={token.leaderboards}
                    tokenAddress={token.tokenAddress}
                    tokenDecimals={token.decimals}
                    totalAmount={token.totalDeposited}
                    usdPrice={tokens.find(t=>t.tokenAddress === token.tokenAddress).price}
                    className={className}
                    limit={index === 0 ? 10 : 6}
                    showFooter={true}
                />
            </div>
        );
    });
    return (
        <div>
            <Header />
            {(loadingLeaderboards || loading)
                ? <span><br />&nbsp;&nbsp;&nbsp;(v0) Loading...</span>
                : <>
                    <main className="leaderboards-container">
                        {columns}
                    </main>
                    <br />
                    <br />
                    <center style={{color:"lightgrey"}}>&nbsp;(These are the top 3 tokens with more accumulated USD value)</center>
                    <Footer tokens={allTokens?.tokenTotals?.filter(t => topTokenAddresses?.findIndex(i => i === t.tokenAddress) === -1) || []} loading={loading} />
                </>}
        </div>
    );
};

export default Home;
