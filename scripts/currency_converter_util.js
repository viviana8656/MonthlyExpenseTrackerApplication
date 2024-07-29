convertionAPI = (function () {
    const BASE_URL = "https://openexchangerates.org/api/";

    const getCurrencyListFromAPI = async() => {
        const GET_CURRENCIES_ENDPOINT = `${BASE_URL}currencies.json`
        const currencies = await fetch(GET_CURRENCIES_ENDPOINT)
       .then((response) => response.json())
       .catch((error) => console.error("Open Exchange Rates API is Down"));

       return currencies
    }

    const getCurrenciesList = async () => {
        let currenciesList = localStorageManager.retrieveCurrenciesList();
    
        if (!!currenciesList && currenciesList.length) {
          console.log('Using Currencies from localstorage');
    
          return currenciesList;
        } 
        
        currenciesList = await getCurrencyListFromAPI();
        localStorageManager.saveCurrenciesList(currenciesList);
    
        return currenciesList;
      };

    return {
        getCurrenciesList
    }
})