import path from 'path';
import {TwitterApi} from 'twitter-api-v2';
import HighscoreAbi from "../../../../subgraph/coin-leaders/abis/MultiTokenHighscore.json"
import {
    AbiEvent,
    createPublicClient,
    http,
    parseAbiItem,
    decodeEventLog,
    formatUnits,
    parseUnits,
    erc721Abi, createWalletClient
} from 'viem';
import {base, baseSepolia, mainnet, polygon, sepolia} from 'viem/chains';
import {sleepSecs} from "twitter-api-v2/dist/cjs/v1/media-helpers.v1";
import OpenAI from  "openai";
import * as fs from "fs";
import { mnemonicToSeedSync } from 'bip39';
import {mnemonicToAccount, privateKeyToAccount} from 'viem/accounts'
import wearablesAbi from "./wearablesAbi.json";
console.log("wearablesAbi",!!wearablesAbi)
import erc1155abi from "./erc1155abi.json";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
import axios from 'axios';
import {callDiscordHook} from "./discord";
import {getSymbolPrice} from "../price";

const SUBGRAPH_URL:string = process.env.THE_GRAPH_URL as string;
const SECONDS_TO_REFETCH = 60;
const DEPOSIT_LISTENER_LASTBLOCK_FILEPATH:string = process.env.DEPOSIT_LISTENER_LASTBLOCK_FILEPATH as string;
const DEPOSIT_LISTENER_DEFAULT_MIN_BLOCK:string = process.env.DEPOSIT_LISTENER_DEFAULT_MIN_BLOCK as string;
const DEPOSIT_LISTENER_WEARABLE_FILEPATH:string = process.env.DEPOSIT_LISTENER_WEARABLE_FILEPATH as string;
const WEARABLE_CONTRACT_ADDRESS:string = process.env.WEARABLE_CONTRACT_ADDRESS as string;
console.log("WEARABLE_CONTRACT_ADDRESS",WEARABLE_CONTRACT_ADDRESS);
const ERC1155_CONTRACT_ADDRESS:string = "0xf9974d2f3988f237522cf587e020dc00f273aa60";
console.log("ERC1155_CONTRACT_ADDRESS",ERC1155_CONTRACT_ADDRESS);

const PRIVATE_KEY:string = process.env.PRIVATE_KEY as string;
console.log("PRIVATE_KEY?.lenbth",PRIVATE_KEY?.length);
if(!PRIVATE_KEY?.length) process.exit(1);
if(DEPOSIT_LISTENER_DEFAULT_MIN_BLOCK === undefined) process.exit(1);
if(!DEPOSIT_LISTENER_LASTBLOCK_FILEPATH) process.exit(1);

export async function initDepositListener(){
    console.log("initDepositListener...")
    await sleepSecs(10);
    console.log("GO...")

    const getEventAbiFn = (abi) => (eventName) => {
        return abi.filter(a => a.type === "event").find(a => a.name === eventName) as AbiEvent;
    }
    const getEventAbi = getEventAbiFn(HighscoreAbi);
// Set up Twitter API client
    console.log("process.env", process.env.TWITTER_CONSUMER_KEY)
    const twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_CONSUMER_KEY!,
        appSecret: process.env.TWITTER_CONSUMER_SECRET!,
        accessToken: process.env.TWITTER_ACCESS_TOKEN!,
        accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
    });
    const rwClient = twitterClient.readWrite;

// Connect to Ethereum node

    const mainnetUrl = `https://base-mainnet.infura.io/v3/${process.env.INFURA_PROJECT}`;
    const ethUrl = `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT}`;
    const polygonUrl = `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_PROJECT}`;
    const infuraUrl = process.env.PROD ? mainnetUrl : `https://base-sepolia.infura.io/v3/${process.env.INFURA_PROJECT}`;
    const ethClient = createPublicClient({
        chain: mainnet,
        transport: http(ethUrl),
    });
    const publicClient = createPublicClient({
        chain: base,
        transport: http(mainnetUrl),
    });

    const polygonPublicClient = createPublicClient({
        chain: polygon,
        transport: http(polygonUrl),
    });
    const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);
    const polygonWalletClient:any = createWalletClient({
        account,
        chain: polygon,
        transport: http(polygonUrl),
    } as any);
    const clientInfura = process.env.PROD?publicClient:createPublicClient({
        chain: baseSepolia,
        transport: http(infuraUrl),
    });
    async function getENSName(address) {
        try {
            return await ethClient.getEnsName({ address });
        } catch (error) {
            console.error('Error fetching ENS name:', error);
        }
    }
// Smart contract ABI and address

    const contractAddress = process.env.DEPLOYED_SEPOLIA_CONTRACT_HIGHSCORE! as `0x${string}`;
    console.log("contractAddress", contractAddress)
// Function to post a tweet
    const postTweet = async ({tweetContent, giphyWord}) => {
        // console.log("{tweetContent, giphyWord}",{tweetContent, giphyWord});
        try {
            //TODO download the image
            const giphyResults = await queryGiphy(giphyWord);
            if(giphyResults?.length){
                const selectedGif = pickRandomGif(giphyResults);
                const gifUrl = selectedGif.images.original.url;
                // Download the selected GIF
                const downloadPath = path.join(__dirname, '_tmp_downloaded.gif');
                await downloadGif(gifUrl, downloadPath);
                const mediaId = await uploadMediaToTwitter(downloadPath);
                await deleteMediaFile(downloadPath);
                await sleepSecs(10);
                const publication = await rwClient.v2.tweet(tweetContent,{
                    media:{  media_ids:[mediaId]}
                });

                console.log('Tweet posted successfully:', publication);
                return publication;
            }

        } catch (error) {
            console.log('Error posting tweet:', error);
        }
    };
// Function to query Giphy and get 10 results
    async function queryGiphy(keyword) {
        try{
            const giphyApiKey = process.env.GIPHY_API_KEY;
            const response:any = await axios(`https://api.giphy.com/v1/gifs/search?api_key=${giphyApiKey}&q=${keyword}&limit=10&rating=g`);
            const { data } = response;
            return data.data;
        }catch(error){
            console.log("queryGiphy error:",error)
        }
    }






// Function to get the last block number from a file
    const getLastBlockNumberFromFile = (): number => {
        console.log('File path:', DEPOSIT_LISTENER_LASTBLOCK_FILEPATH);
        if (fs.existsSync(DEPOSIT_LISTENER_LASTBLOCK_FILEPATH)) {
            const lastBlock = fs.readFileSync(DEPOSIT_LISTENER_LASTBLOCK_FILEPATH, 'utf-8');
            return parseInt(lastBlock, 10);
        }
        return DEPOSIT_LISTENER_DEFAULT_MIN_BLOCK && Number(DEPOSIT_LISTENER_DEFAULT_MIN_BLOCK) || 0; // Default to block 0 if no file exists
    };
// Function to save the last block number to a file
    const saveLastBlockNumber = (blockNumber: number) => {
        console.log("save block", blockNumber);
        fs.writeFileSync(DEPOSIT_LISTENER_LASTBLOCK_FILEPATH, blockNumber.toString(), 'utf-8');
    };
    let currentBlock;
// Function to fetch and process new events
    const fetchNewEvents = async () => {
        currentBlock = currentBlock || getLastBlockNumberFromFile();
        console.log("fetch from block",currentBlock)
        const logs: any[] = await clientInfura.getLogs({
            address: contractAddress,
            fromBlock: BigInt(currentBlock),//currentBlock,//6462667
            toBlock: 'latest',
        });
        console.log("logs.length",logs.length);
        if(!logs?.length) return;
        currentBlock = Number(logs[logs.length-1].blockNumber + 1n);
        saveLastBlockNumber(Number(currentBlock))
        // Decode each log
        for (const log of logs) {
            try {
                const decodedLog:any = decodeEventLog({
                    abi: HighscoreAbi,
                    data: log.data,
                    topics: log.topics,
                });

                if (decodedLog.eventName === "Deposit") {
                    //TODO decodedLog -> theGraph data...
                    await sleepSecs(10);
                    const graphData = await processEvent({decodedLog, log});
                    const eventInfo = JSON.parse(stringifyBigInt(decodedLog));

                    const publication = await postTweet(await generateTweet({
                        eventInfo,
                        graphData,
                        log:JSON.parse(stringifyBigInt(log))
                    }));
                    let givenWearablesData = {};
                    if (fs.existsSync(DEPOSIT_LISTENER_WEARABLE_FILEPATH)) {
                        givenWearablesData = JSON.parse(fs.readFileSync(DEPOSIT_LISTENER_WEARABLE_FILEPATH, "utf-8"));
                    }
                    const args:any = decodedLog?.args;
                    if(Number(graphData.amountInUSD) >= 3){
                        const address = args?.user?.toLowerCase();
                        if(!givenWearablesData[address]){
                            givenWearablesData[address] = Date.now();
                            //TODO GIVE WEARABLE
                            //client.
                            const data = {
                                address: ERC1155_CONTRACT_ADDRESS as `0x${string}`,
                                abi: erc1155abi,
                                functionName: 'mint',
                                args: [[address], ["1"], ["1"]],
                                account,
                                chain:base
                            }
                            const { request } = await publicClient.simulateContract(data);
                            const txHash = await polygonWalletClient.writeContract(request);
                            console.log("wearable being sent with tx ",txHash);
                            callDiscordHook(`  NFT sent to ${graphData.ENSUserName || decodedLog?.args?.user}`);
                        }else{
                            console.log("NFT was already sent to ",args?.user)
                        }
                    }else{
                        console.log("deposit amount was ",graphData?.amountInUSD)
                    }
                    fs.writeFileSync(DEPOSIT_LISTENER_WEARABLE_FILEPATH, JSON.stringify(givenWearablesData, null, "  "), "utf-8")
                    if(publication) callDiscordHook("https://x.com/chainHighscore/status/"+publication.data.id );
                    console.log("publication:",!!publication)
                }

            } catch (err) {
                console.log('Error handling log:', err);
            }
        }


    };
// Polling function
    const poll = async () => {
        while (true) {
            await fetchNewEvents();
            await sleepSecs(SECONDS_TO_REFETCH);
        }
    };

// Start polling
    poll();
    console.log('Polling for contract events...');
    // Function to pick a random GIF from the list
    function pickRandomGif(gifs) {
        const randomIndex = Math.floor(Math.random() * gifs.length);
        return gifs[randomIndex];
    }


    async function downloadGif(gifUrl, downloadPath) {
        const response = await axios.get(gifUrl, { responseType: 'arraybuffer' });
        const fileData = Buffer.from(response.data, 'binary');
        await fs.writeFileSync(downloadPath, fileData);
        console.log("downloaded file from", gifUrl);
        return fileData;
    }
    async function uploadMediaToTwitter(mediaPath) {
        const mediaData = fs.readFileSync(mediaPath);
        const mediaId = await twitterClient.v1.uploadMedia(mediaData, { type: 'gif' });
        return mediaId;
    }

    function deleteMediaFile(mediaPath) {
        fs.unlinkSync(mediaPath);
        console.log('Media file deleted:', mediaPath);
    }

    function stringifyBigInt(obj: any) {
        return JSON.stringify(obj, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        );
    }

    async function fetchFromSubgraph(query: string, variables = {}) {
        try {
            const response = await axios.post(SUBGRAPH_URL, {
                query,
                variables,
            });

            if (response.data.errors) {
                console.error('Subgraph query errors:', response.data.errors);
                throw new Error('Failed to fetch data from subgraph');
            }

            return response.data.data;
        } catch (error) {
            console.error('Error fetching from subgraph:', error);
            throw error;
        }
    }

    async function getDepositEntityByTxHash(transactionHash: string) {
        const query = `
    query($txHash: String!) {
      depositEntities(where: { transaction: $txHash }) {
        id
        user {
          id
        }
        token {
          id
          tokenAddress
          name
          symbol
          decimals
        }
        amount
        title
        url
        image
        referrer {
          id
        }
        comm {
          id
        }
        referrerPercentage
        commPercentage
        receiver {
          id
        }
        transaction
        userTokenInfo {
          id
          totalDeposited
        }
      }
    }
  `;

        const variables = { txHash: transactionHash };
        const data = await fetchFromSubgraph(query, variables);
        return data?.depositEntities[0];
    }

    async function getTokenLeaderboard(tokenAddress: string) {
        const query = `
    query($tokenAddress: Bytes!) {
      tokenTotals(where: { tokenAddress: $tokenAddress }) {
        id
        tokenAddress
        name
        symbol
        decimals
        totalDeposited
        leaderboards(orderBy: depositedAmount, orderDirection: desc, first: 10) {
          id
          user {
            id
          }
          depositedAmount
          title
          url
          image
        }
        referralEarnings
        commEarnings
        receiverEarnings
      }
    }
  `;

        const variables = { tokenAddress };
        const data = await fetchFromSubgraph(query, variables);
        return data.tokenTotals[0];
    }

    async function getUserTokenInfo(userAddress: string, tokenAddress: string) {
        try {
            const userId = `${userAddress}-${tokenAddress}`;
            const query = `
    {
      userTokenInfo(id:"${userId}") {
        id
        totalDeposited
        deposits {
          id
          amount
          title
          url
          image
          transaction
        }
      }
    }
  `;

            const variables = { userId };
            const data = await fetchFromSubgraph(query, variables);
            return data.userTokenInfo;
        }catch (e) {
            console.log(e)
        }

    }

    async function processEvent({decodedLog, log}: any) {
        //TODO process token USD price

        const userAddress = decodedLog.args.user;
        const tokenAddress = decodedLog.args.token;

        // Fetch relevant data from the subgraph
        const depositEntity = await getDepositEntityByTxHash(log.transactionHash);
        const tokenLeaderboard = await getTokenLeaderboard(tokenAddress);
        const userTokenInfo = await getUserTokenInfo(userAddress, tokenAddress);
        const parsedDepositAmount = formatUnits(depositEntity.amount, depositEntity.token.decimals)
        const {price:usdPricePerToken} = await getSymbolPrice(depositEntity.token.symbol);
        console.log("usdPricePerToken",usdPricePerToken)
        console.log("parsedDepositAmount",parsedDepositAmount);
        return {
            depositEntity,
            tokenLeaderboard,
            userTokenInfo,
            ENSUserName:await getENSName(userAddress),
            usdPricePerToken,
            parsedDepositAmount,
            amountInUSD:isNaN(Number(parsedDepositAmount))?undefined:(Number(parsedDepositAmount) * usdPricePerToken)
        }
    }

    async function generateTweet({eventInfo, graphData, log}) {

        try{
            const response:any = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are an assistant that creates engaging tweets. If you are given ENS name info, include it in the tweet," +
                            " Ignore referrer information, take token amount from parsedDepositAmount, not from any graphData depositAmount, " +
                            "Include double breaklines, Include a link to https://base-coin-leaders.zeroxwork.com/token/[tokenAddress] " +
                            "Add emotion to the message, you can mention token name twitter, when adding token symbol tag prepend the $ symbol. " +
                            "In the eventInfo have link to twitter/x.com, just use the handle, for example, instead of adding https://x.com/handle, add @handle to the tweet."+
                            "The title from eventInfo is really important for the tweet, try to mention something related to it. Also is very important if provided the ENSUserName" +
                            "Don't add links with format [text](link). Just add the raw link if necessary, removing the https://." +
                            "Never use ENSUserName as twitter handle. " +
                            "Never show 0x0000000000000000000000000000000000000000. It's necessary a word to get a giphy, the word must be related with the emotional aspect of the tweet. " +
                            "The response should have following format: giphyWord|tweetContent" },
                    { role: "user", content: `Create a tweet for the following event, be aware that the correct amount of tokens is ${graphData.parsedDepositAmount}(graphData.parsedDepositAmount): ${JSON.stringify({eventInfo, graphData, log})}` }
                ],
                max_tokens: 100,
            });

            const [giphyWord, tweetContent] = response.choices[0].message.content.split(/\|/);
            return {tweetContent, giphyWord};
        }catch(error:any){
            throw Error(error);
        }
    }
}