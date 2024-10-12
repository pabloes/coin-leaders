export function formatNumber(num:number) {
    if (num === 0) return '0';

    let absNum = Math.abs(num);
    let suffix = '';
    let formattedNum = '';

    if (absNum >= 1_000_000_000) {
        formattedNum = (num / 1_000_000_000).toFixed(9);
        suffix = 'B';
    } else if (absNum >= 1_000_000) {
        formattedNum = (num / 1_000_000).toFixed(9);
        suffix = 'M';
    } else if (absNum >= 1_000) {
        formattedNum = (num / 1_000).toFixed(9);
        suffix = 'K';
    } else {
        formattedNum = Number(num).toFixed(12);
    }

    // Remove unnecessary trailing zeros
    formattedNum = formattedNum.replace(/\.?0+$/, '');


    const [intPart, decPart] = formattedNum.split('.');
    // When decimals length > 6 , remove the rest of the first that is not 0
    if (decPart && decPart.length > 6) {
        const firstZeroIndex = decPart.split("").findIndex(i=>i!=="0");
        formattedNum = intPart + '.' + decPart.slice(0, firstZeroIndex+1);
    } else if (decPart) {
        formattedNum = intPart + '.' + decPart;
    }

    return formattedNum + suffix;
}
export function formatBigInt(num, decimals, skipPrefix = false) {
    if (num === BigInt(0)) return '0';

    const absNum = num < 0 ? -num : num;
    let suffix = '';
    let formattedNum = '';

    const billion = BigInt(1_000_000_000);
    const million = BigInt(1_000_000);
    const thousand = BigInt(1_000);
    const divisor = BigInt(10) ** BigInt(decimals);

    const formattedAsNumber = Number(absNum) / Number(divisor);

if(!skipPrefix){
    if (absNum >= billion * divisor) {
        formattedNum = (formattedAsNumber / 1_000_000_000).toFixed(2);
        suffix = 'B';
    } else if (absNum >= million * divisor) {
        formattedNum = (formattedAsNumber / 1_000_000).toFixed(2);
        suffix = 'M';
    } else if (absNum >= thousand * divisor) {
        formattedNum = (formattedAsNumber / 1_000).toFixed(2);
        suffix = 'K';
    } else {
        // For numbers smaller than 1, format with decimals
        formattedNum = formattedAsNumber.toFixed(18);
    }
}else {
    // For numbers smaller than 1, format with decimals
    formattedNum = formattedAsNumber.toString();//.toFixed(18);
}


    // Remove unnecessary trailing zeros and dot if present
    if (!suffix) {
        formattedNum = formattedNum.replace(/(\.\d*?[1-9])0+$/, '$1'); // Remove trailing zeros
        formattedNum = formattedNum.replace(/\.0+$/, ''); // Remove dot if no decimal places remain
    }

    if(formattedNum.indexOf(".") >=0 && !suffix){
        formattedNum = formattedNum.split(".")[0]+"."+formattedNum.split(".")[1];
        formattedNum = Number(formattedNum).toFixed(formattedNum.split(".")[1].split("").findIndex(c=>c!=="0")+1)
    }

    if(formattedNum.split(".")[1] === "00"){
        formattedNum = formattedNum.replace(".00","")
    }
    if(formattedNum.split(".")[0] === "0" && formattedNum.split(".")[1]?.length  > 4 && (Number(formattedNum).toString().length < formattedNum.split(".")[1].length)){
        formattedNum = Number(formattedNum).toString();
    }
    return formattedNum + suffix;
}

export const bigIntMax = (...args) => args.reduce((m, e) => e > m ? e : m);
export const bigIntMin = (...args) => args.reduce((m, e) => e < m ? e : m);