export function extractPrice(...elements: any) {
    for ( const element of elements) {
        console.log('extract price loop, element', element)
        const priceText = element.text().trim();

        if(priceText) return priceText.replace(/\D/g, '');
    }

    return ''
}