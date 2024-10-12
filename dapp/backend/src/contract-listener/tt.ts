
import dotenv from "dotenv";
dotenv.config({path:"../.env"})
const { TwitterApi } = require("twitter-api-v2");
console.log("process.env.TWITTER_CONSUMER_KEY",process.env.TWITTER_CONSUMER_KEY)
// Fill your API credentials
const client = new TwitterApi({
    appKey: process.env.TWITTER_CONSUMER_KEY,
    appSecret: process.env.TWITTER_CONSUMER_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    bearerToken:process.env.TWITTER_BEARER_TOKEN
} as any);

// Provide read write controls
const rwClient = client.readWrite;

// Create textTweet function which post
// a text only tweet
const tweetText = async () => {
    try {

        // Use .tweet() method and pass the
        // text you want to post
        await rwClient.v2.tweet(
            "This tweet has been created using nodejs");

        console.log("success");
    } catch (error) {
        console.log(error);
    }
};

// Call any of methods and you are done
tweetText();