// src/server.ts
import dotenv from "dotenv";
dotenv.config({path:"../../.env"})
import express, { Request, Response } from 'express';
import axios from 'axios';
import path from 'path';
import cors from 'cors';
import puppeteer from 'puppeteer';
import {initDepositListener} from "./contract-listener";
import * as fs from "fs";
import {promisify} from "util";
import {getSymbolPrice} from "./price";
const readFileAsync:any = promisify(fs.readFile);
const writeFileAsync:any = promisify(fs.writeFile);

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Use cors middleware
const DEPOSIT_LISTENER_WEARABLE_FILEPATH:string = process.env.DEPOSIT_LISTENER_WEARABLE_FILEPATH as string;
const screenshotCache = {};

console.log("initializing ...");

//e.g. http://localhost:3000/api/screenshot?width=500&height=680&url=http://localhost:5173/token/0xee1f9752f0438b113e16bc32d0a27e9f38bf4dff?class=screenshot
app.get('/api/screenshot', async (req, res) => {
    try{
        const {url="", width = 1280,height = 800} = req.query;
        const _url:string = url as string;
        const cacheKey = _url+width+height
        console.log(cacheKey)
        if(Date.now() - screenshotCache[cacheKey]?.date < (60000*3)){
            res.set('Content-Type', 'image/png');
            return res.send(screenshotCache[cacheKey ].data);
        }else{
            console.log
            console.log("no cache", cacheKey)
        }
        if(!_url) throw Error("Missing URL")
        if(_url.indexOf("coin-leaders") === -1 && _url.indexOf("http://localhost") === -1){
            return res.status(400).send({error:"Not allowed"});
        }
        console.log("opening browser")
        // Launch a new headless browser instance
        const browser = await puppeteer.launch({
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/opt/render/project/puppeteer/chrome/linux-127.0.6533.88/chrome-linux64/chrome',
            headless: true
        });
        const page = await browser.newPage();
        console.log("navigating to screenshot web: ", _url)
        await page.setViewport({ width:Number(width),height:Number(height)} as any);
        console.log("waiting idle network");
        await page.goto(_url, { waitUntil: 'networkidle0' }); // Wait until the network is idle
        console.log("taking screenshot");
        const screenshotBuffer = await page.screenshot(); // Take a screenshot
        screenshotCache[cacheKey] = {data:screenshotBuffer,date:Date.now()};
        console.log("closing browser")
        await browser.close(); // Close the browser
        console.log("sending response")
        // Set the content type and return the screenshot
        res.set('Content-Type', 'image/png');
        res.send(screenshotBuffer);
    }catch (error) {
        console.log("api/screenshot error",error);
        return res.status(400).send({error});
    }
});

// Endpoint to fetch data from CoinMarketCap
app.get('/api/price', async (req, res) => {
    const { symbol } = req.query;

    try {
       const price = await getSymbolPrice(symbol);
       return res.json(price);
    } catch (_error:any) {
        try{
            res.json({ error:_error.response.data.status.error_message, price:0 });
        }catch(error){
            console.log(_error,error)
            res.json({ error:error, price:0 });
        }
    }
});


app.get("/api/wearable-supply", async (req,res)=>{
    try {
        // Verificar si el archivo existe
        try {
            await fs.access(DEPOSIT_LISTENER_WEARABLE_FILEPATH, ()=>{});
        } catch (error) {
            // Si no existe, crearlo con contenido vacío "{}"
            await writeFileAsync(DEPOSIT_LISTENER_WEARABLE_FILEPATH, '{}', 'utf-8');
        }

        // Leer el contenido del archivo
        const wearables = JSON.parse( await readFileAsync(DEPOSIT_LISTENER_WEARABLE_FILEPATH, "utf-8") as string);

        // Retornar el resultado
        return res.send({ result: 97 - Object.keys(wearables).length });
    } catch (err) {
        console.error("Error al leer el archivo de wearables:", err);
        return res.status(500).send({ error: "Error interno del servidor" });
    }
})

const frontendDistPath = process.env.FRONTEND_DIST_PATH || path.join(__dirname, "../../../../../frontend/dist");
app.use(express.static(frontendDistPath));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

initDepositListener();

