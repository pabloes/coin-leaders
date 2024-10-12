import { useQuery } from '@tanstack/react-query';

const fetchTokens = async () => {
    const uri =  import.meta.env.THE_GRAPH_URL;
    //TODO refactor to useQuery
    const response = await fetch(uri, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
        {
          tokenTotals(orderBy: totalDeposited, orderDirection: desc) {
            tokenAddress
            symbol
          }
        }
      `,
        }),
    });
    const data = await response.json();
    return data.data.tokenTotals;
};

export const useTokens = () => {
    return useQuery({queryKey:['tokens'],queryFn:fetchTokens});
};