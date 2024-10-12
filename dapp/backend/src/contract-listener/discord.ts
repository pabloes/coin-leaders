import axios from "axios";

export function callDiscordHook(str:string, url = "https://discord.com/api/webhooks/1272626004594003969/aR5OkxPv__yN0R4OmTbwbvbckd80KiU95SpqkWSkz4vXNgbLa4v12VOu9zPWwV7NEEoN"){
    console.log(str);

    var body = typeof str === "string" ? {
        username:"Highy",
        content: `${str}`
    } : str;

    return axios.post(url, body);
}