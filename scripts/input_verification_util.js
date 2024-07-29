function checkDecimalInput(id){
    const inputElement = document.getElementById(id);
    
    let value = parseFloat(inputElement.value);

    if (isNaN(value) || parseFloat(value) < 0) {
        value = 0;
    }

    value = value.toFixed(2);

    inputElement.value = value;
}