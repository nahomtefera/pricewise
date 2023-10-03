'use client'
import { scrapeAndStoreProduct } from '@/libs/actions';
import { isValidAmazonProductURL } from '@/libs/utils';
import {FormEvent, useState} from 'react';


const SearchBar = () => {
  const [searchPrompt, setSearchPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const isValidLink:boolean = isValidAmazonProductURL(searchPrompt);

    if(!isValidLink) alert('Please provide a valid amazon link.');
    
    try {
        setIsLoading(true);
        // Scraper logic
        const product = await scrapeAndStoreProduct(searchPrompt);
    } catch (error) {
        console.log(error)
    } finally {
        setIsLoading(false)
    }

  }

  return (
    <form className='flex flex-wrap gap-4 mt-12' onSubmit={handleSubmit}>
        <input 
            type="text"
            value={searchPrompt}
            onChange={(e) => setSearchPrompt(e.target.value)}
            placeholder="Enter product link"
            className="searchbar-input"
        />

        <button 
            type="submit" 
            className="searchbar-btn"
            disabled={searchPrompt === ''}
        > 
            {isLoading ? 'Searching...' : 'Search'}
        </button>
    </form>
  )
}

export default SearchBar
