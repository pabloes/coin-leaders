export async function fetchTokenPrice(symbol: string): Promise<number | null> {
    try {
        const {price} = await fetch((import.meta.env.API_URL||"")+`/api/price?symbol=${symbol}`).then(r=>{
            return r.json();
        })
        return price;
    } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error);
        return 0;
    }
}
