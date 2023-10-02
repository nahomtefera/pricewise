'use server'

import axios from "axios";
import * as cheerio from 'cheerio';
import { extractPrice } from "../utils";


export async function scrapeAmazonProduct(url:string) {
    if(!url) return

    // BrightData proxy configuration
    const username = String(process.env.BRIGHT_DATA_USERNAME)
    const password = String(process.env.BRIGHT_DATA_PASSWORD)
    const port = 2225;
    const session_id = (1000000 * Math.random() | 0)
    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password
        },
        host: 'brd.superproxi.io',
        port,
         rejectUNauthorized: false
    }

    try {
        // fetch product page
        const response = await axios.get(url, options)
        const $ = cheerio.load(response.data)

        // Exctracat data
        const title = $('#productTitle').text().trim();
        console.log('prodcut title: ', title)

        // const currentPrice = extractPrice(
        //     $('.priceToPay span.a-price-whole'),
        //     $('.a.size.base.a-color-price'),
        //     $('.a-button-selected .a-color-base'),
        //     $('.a-price.a-text-price')
        // )
        // console.log(currentPrice)
    } catch (error:any) {
        throw new Error(`Failed to scrape product: ${error.message}`)
    }
}