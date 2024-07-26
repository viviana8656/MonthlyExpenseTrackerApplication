document.addEventListener("DOMContentLoaded", function(){
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
        const index = document.getElementById("expense-index").value

        const expense = {name, amount, currency}

        if (index === '') {
            expenses.push(expense)
        } else {
            expenses[index] = expense
        }

        localStorage.setItem("expenses",JSON.stringify(expenses))
        renderExpenses()
        expenseForm.reset()
        closeExpenseModal()
    })

    function renderExpenses() {
        expensesTableBody.innerHTML ='';
        expenses.forEach((expense, index)=>{
            addExpenseToTable(expense,index)
        })
    }

    function addExpenseToTable(expense, index){
        const row = document.createElement("tr")
        row.innerHTML =
        `
        <td>${expense.name}</td>
        <td>${expense.amount}</td>
        <td>${expense.currency}</td>
        <td>
        <button class="material-icons" onclick="editExpense(${index})">edit</button>
        <button class="material-icons" onclick="deleteExpense(${index})">delete</button>
        </td>
        `
        expensesTableBody.appendChild(row)
    }
    
    function generateCurrencyOption(currency){
        return createNode(`<option>${currency.name}</option>`,"select")
    }

    window.editExpense = function(index){
        console.log("gurrll")
        const expense = expenses[index];
        document.getElementById("expense-category").value = expense.name;
        document.getElementById("expense-amount").value = expense.amount;
        document.getElementById("expense-currency").value = expense.currency;
        document.getElementById("expense-index").value = index;
        openExpenseModal();
    }

    window.deleteExpense = function(index){
        expenses.splice(index,1)
        localStorage.setItem("expenses", JSON.stringify(expenses))
        renderExpenses()
    }

    window.openExpenseModal = function(){
        document.getElementById("modal").style.display = "block"
    }

    window.closeExpenseModal = function(){
        document.getElementById("modal").style.display = "none"
        expenseForm.reset()
        document.getElementById("expense-index").value = ""
    }
    
    renderExpenses()
    document.getElementById("budget-amount").value = budget.amount
    document.getElementById("budget-currency").value = budget.currency
})
