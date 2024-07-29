function checkDecimalInput(){
    console.log("alksd")
    const inputElement = document.getElementById('budget-amount');
    
    // Obtener el valor del input y convertirlo a número
    let value = parseFloat(inputElement.value);

    // Si el valor no es un número válido, asignar 0
    if (isNaN(value)) {
        value = null;
    }

    // Redondear el valor a 2 decimales
    value = value.toFixed(3);

    // Actualizar el valor del input
    inputElement.value = value;
}