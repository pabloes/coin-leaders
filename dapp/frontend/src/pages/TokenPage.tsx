import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { gql,  } from '@apollo/client';
import {  useQuery } from '@apollo/client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Leaderboard from '../components/Leaderboard';
import '../styles/TokenPage.scss';
import {parseUnits} from "ethers";
import {formatUnits, zeroAddress} from 'viem';
import {ChainIcon, ConnectKitButton, useChains} from "connectkit";
import {
    useEnsName,
    useWaitForTransactionReceipt,
    useAccount,
    useSimulateContract,
    useWriteContract,
    useSwitchChain
} from 'wagmi';
import highscoreAbi from '../../../../subgraph/coin-leaders/abis/MultiTokenHighscore.json';
import erc20Abi from '../../../../subgraph/coin-leaders/abis/ERC20.json';
import {base, mainnet, sepolia} from "wagmi/chains";
import useTokenInfo from "../hooks/useTokenInfo"; // Replace with the correct path to your ERC-20 ABI

import {bigIntMax, formatNumber} from "../util/number";
import {ContractButton} from "../components/ContractButton";
import {config} from "../App";
import {useTokens} from "../hooks/useTokens";
import {fetchTokenPrice} from "../util/fetchTokenPrice";
import {getRegisteredComm} from "../referrals";
import {ZeroAddress} from "ethers";
import {sleep} from "../util/sleep";


const GET_TOKEN_LEADERBOARD = gql`
  query GetTokenLeaderboard($tokenAddress: String!) {
    tokenTotal(id: $tokenAddress) {
      tokenAddress
      totalDeposited
      decimals  
      name
      symbol
      leaderboards(orderBy: depositedAmount, orderDirection: desc) {
        id
        user {id}
        depositedAmount
        url
        title
        image
      }
    }
  }
`;

const TokenPage: React.FC = () => {
    const { data: tokens, isLoading } = useTokens();
    const { tokenAddress, a } = useParams<{ tokenAddress: string }>();
    const {s} = useLocation();
    const [sendingTx, setSendingTx] = useState(false);
    const { address, isConnected } = useAccount();
    const {data:ensName, error:ensError, isLoading:ensIsLoading, status:ensStatus} = useEnsName({address,  chainId: mainnet.id,});
    const { loading, error, data:leaderboardData, refetch:refetchLeaderboard } = useQuery(GET_TOKEN_LEADERBOARD, {
        variables: { tokenAddress: tokenAddress.toLowerCase() },
    });
    console.log("leaderboardData",leaderboardData)

    const [amount, setAmount] = useState('1');
    const [title, setTitle] = useState(``);
    const [image, setImage] = useState("");
    const [URL, setURL] = useState(``);
    const [referral, setReferral] = useState<string | null>(null);
    const [comm, setComm] = useState<string|null>(null)
    const [price, setPrice] = useState<number>(null);
    const [waiting, setWaiting ] = useState(false);
    const [loadingPrice, setLoadingPrice] = useState(true);
    const [dirty,setDirty] = useState(false);
    const { chain } = useAccount();
    const { chains, switchChain } = useSwitchChain()
    const invalidChain = chains.find((c) => c.id === chain?.id) === undefined;
    const handleSwitchNetwork = async () => {
        try {
            await switchChain?.({chainId:base.id}); // 1 is the chain ID for Ethereum Mainnet
            console.log(`Switched to network ${chain}`);
        } catch (error) {
            console.error('Failed to switch network', error);
        }
    };

    const { tokenInfo, loading: loadingTokenInfo, error:tokenInfoError, refetch:refetchTokenInfo } = useTokenInfo(tokenAddress, address);
console.log("tokenInfo",tokenInfo)
    const baseConfig = {
        account: address,
    }
    console.log("import.meta.env.DEPLOYED_SEPOLIA_CONTRACT_HIGHSCORE",import.meta.env.DEPLOYED_SEPOLIA_CONTRACT_HIGHSCORE)
    const depositConfig = {
        ...baseConfig,
        address: import.meta.env.DEPLOYED_SEPOLIA_CONTRACT_HIGHSCORE,
        abi: highscoreAbi,
        contractInterface:highscoreAbi,
    };
    const approveConfig =  {
        ...baseConfig,
        address: tokenAddress,
        abi: erc20Abi,
        contractInterface: erc20Abi,
        functionName: "approve"
    };

    useEffect(()=>{
        (async () => {
            if(leaderboardData?.tokenTotal?.symbol){
                const _price = await fetchTokenPrice(leaderboardData.tokenTotal.symbol);
                setPrice(_price);
                setLoadingPrice(false);
            }else if(leaderboardData && !leaderboardData?.tokenTotal?.symbol){
                setPrice(0);
                setLoadingPrice(false);
            }

        })();
    },[leaderboardData])
    useEffect(() => {
        (async ()=>{
            // Get the referral code from localStorage
            const storedReferral = getReferral();
            const storedComm = getComm();
            const commAddress = await getRegisteredComm(storedComm);
            setComm(commAddress || "0x0000000000000000000000000000000000000000")
            setReferral(storedReferral || "0x0000000000000000000000000000000000000000");
        })();

    }, []);

    useEffect(() => {
        console.log("effect [tokenInfo,leaderboardData]",[tokenInfo,leaderboardData]);
        if (!loadingTokenInfo && !loadingPrice && tokenInfo && leaderboardData && leaderboardData.tokenTotal && leaderboardData.tokenTotal.leaderboards.length > 0) {
            const top1 = leaderboardData.tokenTotal.leaderboards[0];
            const defaultAmount = tokenInfo && Math.max(Number(formatUnits(10n, tokenInfo.tokenDecimals)),
                Math.min(
                    Number(formatUnits(BigInt(top1?.depositedAmount||0) + 1n, tokenInfo.tokenDecimals)),
                    Number(formatUnits(tokenInfo?.tokenBalance||0n, tokenInfo?.tokenDecimals||0))
                )) || 0;

            console.log("defaultAmount",defaultAmount.toFixed(18));
            console.log("tokenInfo.tokenDecimals",tokenInfo.tokenDecimals);
            console.log("price",price)
            const amountStr = defaultAmount.toString().indexOf("e")>=0?defaultAmount.toFixed(18):defaultAmount.toString();
            if(!dirty){
                setAmount(
                    price && !dirty
                        ? getFriendlyDefaultAmount(amountStr, top1.depositedAmount, tokenInfo.tokenDecimals, price)
                        : amountStr
                );
            }

        }
    }, [loadingPrice, loadingTokenInfo, tokenInfo, leaderboardData]);


    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    const token = leaderboardData.tokenTotal;
    const trySetAmount = (value) => {
        setDirty(true);
        try{
            parseUnits((value||0).toString(), tokenInfo.tokenDecimals);
            setAmount((value||"").toString());
        }catch(error){
            setAmount("");
            console.log("amount error, applying default:", leaderboardData?.tokenTotal?.leaderboards[0]?.depositedAmount, error)
        }
    }

    const searchParams = new URLSearchParams(location.search);
    const urlClass = searchParams.get('class');
    const isScreenshot = urlClass === "screenshot";
    const showAllowanceButton = amount != "" && !waiting && tokenInfo && (tokenInfo.tokenAllowance < parseUnits(amount, tokenInfo.tokenDecimals));
    const showDepositError = amount != "" &&tokenInfo?.tokenBalance && !waiting && tokenInfo && tokenInfo.tokenAllowance >= parseUnits(amount, tokenInfo.tokenDecimals);
    const loadingTokenCompleteInfo = (tokenAddress === zeroAddress)
        ? loadingPrice
        : (loadingTokenInfo||loadingPrice);
    const parsedDepositAmount = parseUnits(amount||"0", tokenInfo?.tokenDecimals || 0);
    const notEnoughBalance = (amount && !isNaN(Number(amount)) && (parseUnits(amount||"0", tokenInfo?.tokenDecimals||0) > tokenInfo?.tokenBalance)) || false
    return (
        <div className={`token-page `+ urlClass}>
            <Header />
            {invalidChain && "invalidChain"}
            <br/>
            {!isScreenshot && <a href="#deposit" className="join-link">Join the leaderboard</a>}
            <div className="content-wrapper">
                    <main className="leaderboard-wrapper">

                        {token
                            ? <Leaderboard
                        title={`${token.name}`}
                        usdPrice={price}
                        tokenAddress={token.tokenAddress}
                        totalAmount={token.totalDeposited}
                        tokenDecimals={token.decimals}
                        entries={token.leaderboards}
                        showFooter={false} // No footer on token-specific page
                    />
                            :          <div><br/><br/>This token leaderboard is empty.<br/><br/>Easy way to make a small deposit to be the first TOP 1 😀</div>
                        }
                </main>



                <aside id="deposit" className="deposit-section">
                    <h1>{loadingTokenCompleteInfo && "Loading token info..."}</h1>
                {(!isScreenshot && !loadingTokenCompleteInfo)?
                    <>
                        <h3 style={{color: "white"}}>Join the Leaderboard</h3>
                        <p>Think you can top the leaderboard?
                            <br/><br/>
                            Make a deposit and show everyone who's the boss!
                            <br/><br/>
                        </p>
                        {!isConnected ? (
                            <>
                                <p>Please connect your wallet to make a deposit.</p>
                                <ConnectKitButton showAvatar={true} showBalance={true} theme={"retro"}/>
                            </>
                        ) : (
                            <>

                                {invalidChain ? <button style={{fontSize:"1.5rem"}} onClick={handleSwitchNetwork} >Switch network</button>:<>
                                    <ConnectKitButton showAvatar={true} showBalance={true} theme={"retro"} />
                                    <br/>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                    }}>

                                        {(tokenInfo) ?
                                            <>
                                                <div className="form-group">
                                                    <label htmlFor="amount">Amount to deposit: (${Number(formatUnits(BigInt(Number(parsedDepositAmount) * (price)), tokenInfo?.tokenDecimals||0)).toFixed(2)})</label>
                                                    <input
                                                        onKeyDown={()=>setDirty(true)}
                                                        type="number"
                                                        id="amount"
                                                        value={amount}
                                                        onChange={(e) => trySetAmount(e.target.value)}
                                                        placeholder="Amount"
                                                    />
                                                    {notEnoughBalance && <pre style={{color:"#ff3d3d", fontWeight:"bolder"}}>Not enough balance</pre>}
                                                </div>

                                                <div className="form-group">
                                                    <label htmlFor="title">Title:</label>
                                                    <input
                                                        onKeyDown={()=>setDirty(true)}
                                                        type="string"
                                                        id="title"
                                                        value={title}
                                                        onChange={(e) => setTitle(e.target.value)}
                                                        placeholder="Title"
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label htmlFor="URL">Link URL:</label>
                                                    <input
                                                        onKeyDown={()=>setDirty(true)}
                                                        type="string"
                                                        id="URL"
                                                        value={URL}
                                                        onChange={(e) => setURL(e.target.value)}
                                                        placeholder="URL"
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label htmlFor="URL">Image URL:</label>
                                                    <input
                                                        onKeyDown={()=>setDirty(true)}
                                                        type="string"
                                                        id="image"
                                                        value={image}
                                                        onChange={(e) => setImage(e.target.value)}
                                                        placeholder="Image URL"
                                                    />
                                                    <br/>
                                                </div>
                                                {tokenAddress === ZeroAddress?
                                                    <>

                                                        <ContractButton
                                                            showError={true}
                                                            config={{...depositConfig, value:parseUnits((amount || 0).toString(), Number(tokenInfo.tokenDecimals))}}
                                                            functionName={"depositETH"}
                                                            args={[
                                                                URL,
                                                                title,
                                                                image,
                                                                referral?.toLowerCase() === address?.toLowerCase()
                                                                    ? zeroAddress
                                                                    : referral,
                                                                comm
                                                            ]}
                                                            onConfirmed={() => (refetchLeaderboard(), refetchTokenInfo())}>
                                                            Deposit ETH
                                                        </ContractButton>
                                                    </>
                                                    :
                                                    <>
                                                        {!waiting && <ContractButton
                                                            showError={showDepositError}
                                                            config={depositConfig}
                                                            disabled={!amount || waiting || tokenInfo.tokenAllowance < parseUnits(amount, tokenInfo.tokenDecimals)}
                                                            functionName={"deposit"}
                                                            args={[
                                                                tokenAddress,
                                                                amount != "" && parseUnits(amount.toString(), tokenInfo.tokenDecimals),
                                                                URL,
                                                                title,
                                                                image,
                                                                referral?.toLowerCase() === address?.toLowerCase()
                                                                    ? "0x0000000000000000000000000000000000000000"
                                                                    : referral,
                                                                comm
                                                            ]}
                                                            onConfirmed={async () => {
                                                                await sleep(100);
                                                                refetchLeaderboard();
                                                                refetchTokenInfo();
                                                            }}>
                                                            Insert coin
                                                        </ContractButton>}
                                                        <br/><br/>
                                                        {amount != "" && tokenInfo.tokenAllowance < parseUnits(amount, tokenInfo.tokenDecimals)?<p><br/><br/>Allowance is lower than amount to deposit, need to approve deposit:</p>:null}
                                                        {showAllowanceButton ?
                                                            <ContractButton
                                                                showError={true}
                                                                disabled={waiting}
                                                                config={approveConfig}
                                                                functionName={"approve"}
                                                                args={[
                                                                    import.meta.env.DEPLOYED_SEPOLIA_CONTRACT_HIGHSCORE,
                                                                    BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
                                                                ]}
                                                                onConfirmed={async () =>{
                                                                    setWaiting(true);
                                                                    await sleep(300);
                                                                    refetchLeaderboard();
                                                                    refetchTokenInfo();
                                                                    await sleep(1000);
                                                                    setWaiting(false)
                                                                }}>
                                                                Approve deposit
                                                            </ContractButton> : null}
                                                    </>
                                                } </>
                                            : null
                                        }

                                        <>

                                            {(loadingTokenInfo || !tokenInfo) ? (
                                                <p>Loading token info...</p>
                                            ) : tokenInfo ? (<>
                                                    <div style={{
                                                        fontSize: "0.9rem",
                                                        color: "lightgrey",
                                                        border: "1px solid lightgrey",
                                                        padding:4,
                                                        marginTop:6
                                                    }}>

                                                        Token Address: <span style={{color: "lightblue"}}>{tokenAddress}</span>
                                                        <br/>Token Name: <span style={{color: "lightblue"}}>{tokenInfo.tokenName}</span>
                                                        <br/>Token Symbol: <span style={{color: "lightblue"}}>{tokenInfo.tokenSymbol}</span>
                                                        <br/>Token Decimals: <span style={{color: "lightblue"}}>{tokenInfo.tokenDecimals}</span>


                                                    </div>
                                                    <br/>
                                                    <div style={{
                                                        fontSize: "0.9rem",
                                                        color: "lightgrey",
                                                        border: "1px solid lightgrey",
                                                        padding:4,
                                                        marginTop:6,

                                                    }}>
                                                        Connected with: <span style={{color: "lightblue"}}>{ensName || address}</span>
                                                        <br/>
                                                        Own token balance: <span style={{color:notEnoughBalance?"red": "lightblue"}}>{
                                                        tokenInfo.tokenBalance!==undefined?formatNumber(
                                                            formatUnits(tokenInfo?.tokenBalance, tokenInfo.tokenDecimals || 0)?.toString()
                                                        ):"???"
                                                    }</span>
                                                        <br/>Own token allowance: <span style={{color: "lightblue"}}>{
                                                        tokenInfo.tokenAllowance!==undefined? formatNumber(
                                                            formatUnits(tokenInfo?.tokenAllowance, tokenInfo.tokenDecimals || 0)?.toString()
                                                        ):"???"
                                                    }</span>
                                                    </div>
                                                    <br/>
                                                    <br/>
                                                </>
                                            ) : (
                                                <p>No token info available</p>
                                            )}
                                        </>
                                    </form>
                                </>}


                            </>
                        )}
                    </>
                    :null
                        }

                </aside>

            </div>
            {!isScreenshot && <Footer tokens={tokens} loading={isLoading} />}
        </div>
    );
};

function getReferral() {
    return localStorage.getItem('referral');
}
function getComm() {
    return localStorage.getItem('comm');
}
export default TokenPage;


function getFriendlyDefaultAmount(str, amount, decimals, usdPrice){
    if(!usdPrice)return str;
    console.log("str, amount, decimals, usdPrice",str, amount, decimals, usdPrice)
    //TODO calculate how much is 1$ -> the amount is old + 1$
    const one = 1/usdPrice;
    const [oneInt, oneDecs] = one.toString().split(".");
    const oneString = `${oneInt}.${oneDecs.slice(0,18)}`
    const oneAsBig = parseUnits(oneString, decimals);
    const oneDecimalsUntilNonZero = oneString.split(".")[1].split("").findIndex(c=>c!=="0");

    const suggestedBig = BigInt(amount) + oneAsBig;
    const suggestedAmount = formatUnits(suggestedBig, decimals);
    const [intSuggestedAmount, decSuggestedAmount] = suggestedAmount.split(".");


    return `${intSuggestedAmount}.${decSuggestedAmount.slice(0, oneDecimalsUntilNonZero+1)}`;

}