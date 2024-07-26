const localStorageManager = (function () {
    const saveToLocalStorage = (itemId, itemName) => {
        window.localStorage.setItem(itemId, JSON.stringify(itemName))
    }

    const getFromLocalStorage = (itemId) => {
        let results = []
        let itemList = window.localStorage.getItem(id)
        if(itemList){
            try {
                results = JSON.parse(itemList)
            } catch (error) {
                console.log("Error while parsing the item list")
            }
        }else{
            console.log("The given ID does not match any item from local storage")
        }
    }



})();
