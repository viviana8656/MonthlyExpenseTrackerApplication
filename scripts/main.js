const setElementDisplayType = (id, type) => {
    document.getElementById(id).style.display = type
}

const startApp = () => {
    setElementDisplayType("modal","none")
}

startApp()

document.addEventListener("DOMContentLoaded", function(){
    console.log("kjhdfakjf")
    const budgetForm = document.getElementById("budget-form")
    const expenseForm = document.getElementById("expense-form")
    const expensesTableBody = document.querySelector("#expenses-table tbody")
    const currencySelects = document.getElementsByName("currency-select")

    let budget=JSON.parse(localStorage.getItem("budget")) || {amount:0, currency:"Dolar"}
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [{name:'Groceries',amount:'2000', currency:'Dolar'},{name:'Electricity',amount:'100',currency:'Dolar'},{name:'Loan',amount:'500',currency:'Colon'},{name:'Shopping',amount:'100',currency:'Euro'}]
    let currencies = JSON.parse(localStorage.getItem("currencies")) || [{name:"Dolar",convertionValueToDolar:"1"},{name:"Colon",convertionValueToDolar:"530"},{name:"Euro",convertionValueToDolar:"0.34"}]

    currencySelects.forEach((currencySelect)=>{
        currencySelect.innerHTML = ''
        const currencyOptions = currencies.map((item)=>
            generateCurrencyOption(item)).map((item)=>item.outerHTML).join(" ")
        currencySelect.innerHTML = currencyOptions})

    budgetForm.addEventListener("submit", function(event){
        event.preventDefault();
        console.log("bitch")
        const amount = parseFloat(document.getElementById("budget-amount").value)
        const currency = document.getElementById("budget-currency").value

        budget = {amount, currency}

        localStorage.setItem("budget", JSON.stringify(budget))
    })

    expenseForm.addEventListener("submit", function(event){
        event.preventDefault();
        console.log("bitch")
        const name = document.getElementById("expense-category").value
        const amount = parseFloat(document.getElementById("expense-amount").value)
        const currency = document.getElementById("expense-currency").value

        const expense = {name, amount, currency}

        expenses.push(expense)
        localStorage.setItem("expenses",JSON.stringify(expenses))
        addExpenseToTable(expense)
        expenseForm.reset()
    })

    function addExpenseToTable(expense){
        const row = document.createElement("tr")
        row.innerHTML =
        `
        <td>${expense.name}</td>
        <td>${expense.amount}</td>
        <td>${expense.currency}</td>
        <td><button class="material-icons" onclick="setElementDisplayType('modal','block')">edit</button></td>
        `

        expensesTableBody.appendChild(row)
    }
    
    function generateCurrencyOption(currency){
        return createNode(`<option>${currency.name}</option>`,"select")
    }
    
    expenses.forEach(addExpenseToTable)
    document.getElementById("budget-amount").value = budget.amount
    document.getElementById("budget-currency").value = budget.currency
})
