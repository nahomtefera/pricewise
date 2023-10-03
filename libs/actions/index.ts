'use server';

import { scrapeAmazonProduct } from "../scrape";

export async function scrapeAndStoreProduct(productUrl:string) {
    if(!productUrl) return;

    try {
        const scrapedProduct = await scrapeAmazonProduct(productUrl)
        return scrapedProduct
    } catch (error:any) {
        console.log("error: ", error.message)
        throw new Error(`Failed to create/update product: ${error.message}`)
    }
}