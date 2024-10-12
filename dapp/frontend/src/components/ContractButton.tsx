import { useEnsName, useWaitForTransactionReceipt, useAccount, useSimulateContract, useWriteContract} from 'wagmi';
import {useEffect} from "react";
import confetti from "canvas-confetti";
import {sleep} from "../util/sleep";

export const ContractButton = ({config, disabled = false, contractAddress, functionName, args, children, onConfirmed, showError}) => {
    const {data: simulatedData, error:simulatedError} = useSimulateContract({
        ...config,
        args,
        functionName
    });
    const { data: hash, writeContract:execute, isPending, isIdle } = useWriteContract();
    const {isLoading: isConfirming, isSuccess: isConfirmed} = useWaitForTransactionReceipt({
        ...simulatedData?.request,
        hash
    });

    useEffect(() => {
            if (isConfirmed) {
                confetti();
                (async () => {
                    await sleep(2000);
                    if (onConfirmed) onConfirmed();
                })();
            }
        },
        [isConfirmed]);
    const handleExecution = async ()=>{
        console.log("handleExecution")
        try {
            const res = await execute(simulatedData!.request);

            console.log("Exec successful",res);
        } catch (error) {
            console.error("Exec failed:", error);
        }
    }

    return <>
        <button
        disabled={isPending || disabled || !Boolean(simulatedData?.request) || (hash && (isPending || isConfirming) && !isConfirmed)}
        onClick={()=>handleExecution()}>
            {children}
        {(isPending)?": pending":null}
        {(hash && isConfirming)?":sending & confirming":null}

    </button>
       <span style={{color:"orange", fontSize:"0.6rem"}}> {(showError && simulatedError)?<p >{simulatedError.message}</p>:null}</span>
        </>




}