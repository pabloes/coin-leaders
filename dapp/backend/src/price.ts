import axios from "axios";
const priceCache = {};
const HOUR_4 = 1000 * 60 * 60 * 4;

export async function getSymbolPrice(symbol){
    try{
        const params = { symbol, convert: 'USD', amount:1 };
        const paramsStr = JSON.stringify(params);
        if(priceCache[paramsStr] && (priceCache[paramsStr].date+HOUR_4) > Date.now()){
            return priceCache[paramsStr].data;
        }
        const response = await axios.get(`https://pro-api.coinmarketcap.com/v2/tools/price-conversion`, {
            params,
            headers: { 'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY, "Content-Type":"application/json", "Accepts":"application/json" }
        });
        //console.log("response.data",response?.data?.data[symbol as string]?.quote.USD)
        const data = response?.data?.data[symbol as string] || response?.data?.data[0];
        priceCache[paramsStr] = {date:Date.now(), data:data?.quote.USD};
        return priceCache[paramsStr].data;
    }catch(error){
        console.log(error);
        return 0;
    }

}