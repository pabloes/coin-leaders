import { useState, useEffect } from 'react';
import {useContractRead, useBalance, useChains} from 'wagmi';
import erc20Abi from '../../../../subgraph/coin-leaders/abis/ERC20.json';
import { getToken } from '@wagmi/core'
import {zeroAddress} from "viem";
import {base} from "wagmi/chains";

interface TokenInfo {
    tokenDecimals: number;
    tokenName: string;
    tokenSymbol: string;
    tokenBalance: BigInt;
    tokenAllowance: BigInt;
}
const ZERO_ADDRESS ="0x0000000000000000000000000000000000000000";
const ETH_ADDRESS = ZERO_ADDRESS;

const useTokenInfo = (tokenAddr: string = ETH_ADDRESS, userAddress:string = ZERO_ADDRESS) => {
    const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    // Fetch ETH balance
    const { data: ethBalanceData, error: ethBalanceError, isLoading: isEthBalanceLoading, refetch: refetchEthBalance } = useBalance({
        address: userAddress,
        enabled: tokenAddr === ETH_ADDRESS
    });

    console.log("ethBalanceData",ethBalanceData)

    // Fetch token decimals
    const { data: decimalsData, error: decimalsError, isLoading: isDecimalsLoading } = useContractRead({
        address: tokenAddr,
        abi: erc20Abi,
        chainId: base.id,
        functionName: 'decimals'//0x313ce567
    });

    // Fetch token name
    const { data: nameData, error: nameError, isLoading: isNameLoading } = useContractRead({
        address: tokenAddr,
        abi: erc20Abi,
        chainId: base.id,
        functionName: 'name'
    });
    // Fetch token symbol
    const { data: symbolData, error: symbolError, isLoading: isSymbolLoading } = useContractRead({
        address: tokenAddr,
        abi: erc20Abi,
        chainId: base.id,
        functionName: 'symbol'
    });

    const {data:balanceData, error:balanceError, isLoading: isBalanceLoading, refetch:refetchBalance } = useContractRead({
        address: tokenAddr,
        abi: erc20Abi,
        chainId: base.id,
        functionName: 'balanceOf',
        args:[userAddress]
    });

    const {data:allowanceData, error:allowanceError, isLoading: isAllowanceLoading, refetch:refetchAllowance} = useContractRead({
        address: tokenAddr,
        abi: erc20Abi,
        chainId: base.id,
        functionName: 'allowance',
        args:[userAddress, import.meta.env.DEPLOYED_SEPOLIA_CONTRACT_HIGHSCORE]
    });

    useEffect(() => {
        console.log("!EFFECT!")
        setLoading(isDecimalsLoading || isNameLoading || isSymbolLoading);

        if (tokenAddr === ETH_ADDRESS) {
            if(ethBalanceData){
                console.log("SET TOKEN INFO!!!!!!!!!!!!")
                setTokenInfo({
                    tokenDecimals: 18,
                    tokenName: 'Ethereum',
                    tokenSymbol: 'ETH',
                    tokenBalance: ethBalanceData?.value,
                    tokenAllowance: ethBalanceData?.value // For ETH, allowance doesn't make sense, but setting it to balance
                });
            }
        }else{
            if (decimalsError || nameError || symbolError) {
                setError('Failed to fetch token information. Please verify the contract address.'+decimalsError);
            }
            if (decimalsData !== undefined && nameData !== undefined && symbolData !== undefined) {
                setTokenInfo({
                    tokenDecimals: decimalsData, // Assuming decimalsData is a BigNumber
                    tokenName: nameData,
                    tokenSymbol: symbolData,
                    tokenBalance: balanceData,
                    tokenAllowance: allowanceData
                });

                setError(null);
            } else {
                setTokenInfo(null);
            }
        }



    }, [
        decimalsData, nameData, symbolData, balanceData, allowanceData,
        isDecimalsLoading, isNameLoading, isSymbolLoading, isBalanceLoading, isAllowanceLoading,
        decimalsError, nameError, symbolError, balanceError, allowanceError, ethBalanceData
    ]);

    return {
        tokenInfo, loading:(tokenAddr===zeroAddress?false:loading), error, refetch: () => {
            refetchBalance();
            refetchAllowance();
        }
    };
};

export default useTokenInfo;

function useContractReadIfNotNull({address, args, abi, functionName }){
    useEffect(()=>{
        (async()=>{

        })();
    }, [address, args,abi, functionName]);
}
