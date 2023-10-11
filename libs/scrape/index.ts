'use server'

import axios from "axios";
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice } from "../utils";


export async function scrapeAmazonProduct(url:string) {
    if(!url) return;

    // BrightData proxy configuration
    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);
    var port = 22225;
    var session_id = (1000000 * Math.random())|0;
    const user_agent = 'Mozilla/5.0 (Windows NT 5.1; rv:31.0) Gecko/20100101 Firefox/31.0';

    var options = {
        auth: {
            username: username+'-country-us-session-'+session_id,
            password
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized: false,
        headers: {'User-Agent': user_agent}
    };



    try {
        const response = await axios.get(url, options)
        const $ = cheerio.load(response.data);
        // Exctracat data
        const title = $('#productTitle').text().trim();
        console.log('title before extracting price: ', title)
        const currentPrice:Number = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('.a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base'),
        );
      
        const originalPrice:Number = extractPrice(
            $('#priceblock_ourprice'),
            $('.a-price.a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock_dealprice'),
            $('.a-size-base.a-color-price')
        );
        console.log('original price: ', originalPrice)

        const outOfStock = $('#availability span').text().trim().toLocaleLowerCase() === 'currently unavailable';
        const images = 
            $('#imgBlkFront').attr('data-a-dynamic-image') || 
            $('#landingImage').attr('data-a-dynamic-image') || 
            '{}';
        const imageUrls = Object.keys(JSON.parse(images));
        const currency = extractCurrency($('.a-price-symbol'));
        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, '').trim();
        const description = extractDescription($)

        // Construct data object with scraped data
        const data = {
            url,
            currency: currency || '$',
            image: imageUrls[0],
            title,
            currentPrice: Number(currentPrice) || Number(originalPrice),
            originalPrice: Number(originalPrice) || Number(currentPrice),
            discountRate: Number(discountRate),
            priceHistory: [],
            category: 'category',
            reviewsCount: 100,
            stars: 4.5,
            isOutOfStock: outOfStock,
            description,
            lowestPrice: Number(currentPrice) || Number(originalPrice),
            highestPrice: Number(currentPrice) || Number(originalPrice),
            averagePrice: Number(currentPrice) || Number(originalPrice)
        }

        return data

    } catch (error:any) {
        console.log("error: ", error.message)
        throw new Error(`Failed to create/update product: ${error.message}`)
    }

}