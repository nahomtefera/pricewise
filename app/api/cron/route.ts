import Product from "@/libs/models/product.model";
import { connectToDB } from "@/libs/mongoose";
import { generateEmailBody, sendEmail } from "@/libs/nodemailer";
import { scrapeAmazonProduct } from "@/libs/scrape";
import { getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice } from "@/libs/utils";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        connectToDB();
        const products = await Product.find({});

        if(!products) throw new Error('No products found');

        //1. SCRAPE LATEST PRODUCT DETAILS AND UPDATE DB
        const updatedProducts = await Promise.all(
            products.map(async(currentProduct) => {
                const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

                if(!scrapedProduct) throw new Error('No product found');

                const updatedPriceHistory:any = [
                    ...currentProduct.priceHistory,
                    {price: scrapedProduct.currentPrice}
                ]
    
                
                const product = {
                    ...scrapedProduct,
                    priceHistory: updatedPriceHistory,
                    lowestPrice: getLowestPrice(updatedPriceHistory),
                    highestPrice: getHighestPrice(updatedPriceHistory),
                    averagePrice: getAveragePrice(updatedPriceHistory)
                }
    
                const updatedProduct =  await Product.findOneAndUpdate(
                    {url: scrapedProduct.url},
                    product
                )

                //2. CHECK EACH PRODUCT STATUS AND SEND EMAIL ACCORDINGLY
                const emailNotifType = getEmailNotifType(scrapedProduct, currentProduct)

                if(emailNotifType && updatedProduct.users.length > 0) {
                    const productInfo = {
                        title: updatedProduct.title,
                        url: updatedProduct.url
                    }

                    const emailContent = await generateEmailBody(productInfo, emailNotifType)

                    const userEmails = updatedProduct.users.map((user:any) => user.email)

                    await sendEmail(emailContent, userEmails)
                }

                return updatedProduct
            })
        )

        return NextResponse.json({
            message: 'Ok',
            data: 'Updated Product'
        })
    } catch (error) {
        throw new Error(`Error IN get: ${error}`)
    }
}