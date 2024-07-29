document.addEventListener("DOMContentLoaded", async function(){
    const budgetForm = document.getElementById("budget-form")
    const expenseForm = document.getElementById("expense-form")
    const categoryForm = document.getElementById("category-form")
    const expensesTableBody = document.querySelector("#expenses-table tbody")
    const categoriesTableBody = document.querySelector("#categories-table tbody")
    const summaryTableBody = document.querySelector("#summary-table tbody")
    const currencySelects = document.getElementsByName("currency-select")
    const categorySelects = document.getElementsByName("category-select")
    const totalExpenses = document.getElementById("total-expenses")
    const leftBudget = document.getElementById("total-left-budget")

    const BASE_URL = "https://openexchangerates.org/api/";


    let budget=JSON.parse(localStorage.getItem("budget")) || {amount:0, currency:"United States Dollar"}
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [{name:'Groceries',amount:'2000', currency:'Dolar'},{name:'Electricity',amount:'100',currency:'Dolar'},{name:'Loan',amount:'500',currency:'Colon'},{name:'Shopping',amount:'100',currency:'Euro'}]
    let categories = JSON.parse(localStorage.getItem("categories")) || []
    let currencies = await getCurrenciesList();

    currencySelects.forEach((currencySelect)=>{
        currencySelect.innerHTML = ''
        const currencyOptions = currencies.map((item)=>
            generateCurrencyOption(item)).map((item)=>item.outerHTML).join(" ")
        currencySelect.innerHTML = currencyOptions})

    budgetForm.addEventListener("submit", function(event){
        event.preventDefault();
        const amount = parseFloat(document.getElementById("budget-amount").value)
        const currency = document.getElementById("budget-currency").value
        const code = currencies.filter((e)=>e.name==currency)[0].code

        budget = {amount, currency,code}

        renderSummary()
        renderExpenses()
        localStorage.setItem("budget", JSON.stringify(budget))
    })

    document.querySelectorAll('#modal-form input').forEach(input => {
        input.addEventListener('focus', function(event) {
            event.target.blur();
        });
    });

    expenseForm.addEventListener("submit", function(event){
        event.preventDefault();
        const date = document.getElementById("expense-date").value
        const category = document.getElementById("expense-category").value
        const name = document.getElementById("expense-name").value
        const amount = parseFloat(document.getElementById("expense-amount").value)
        const currency = document.getElementById("expense-currency").value
        const index = document.getElementById("expense-index").value

        categories.map((item)=>{
            if(item.name == category){
                item.amount++;
            }
        })
        localStorage.setItem("categories", JSON.stringify(categories))

        const expense = {date, category, name, amount, currency}

        if (index === '') {
            expenses.push(expense)
        } else {
            expenses[index] = expense
        }

        localStorage.setItem("expenses",JSON.stringify(expenses))
        renderExpenses()
        renderCategories()
        expenseForm.reset()
        closeExpenseModal()
    })

    categoryForm.addEventListener("submit", function(event){
        event.preventDefault();
        const name = document.getElementById("category-name").value;
        const index = document.getElementById("category-index").value
        const amount = 0;

        const category = {name, amount}

        if (index === '') {
            categories.push(category)
        } else {
            expenses.forEach((ex)=>{
                if(ex.category == categories[index].name){
                    ex.category = name
                }
            })
            categories[index] = {name, amount: categories[index].amount}
        }
        
        localStorage.setItem("categories", JSON.stringify(categories))
        localStorage.setItem("expenses", JSON.stringify(expenses))
        renderCategories()
        categoryForm.reset()
        closeCategoryModal();
        renderExpenses()
        renderSummary()
    })

    const ctx = document.getElementById('expensesChart').getContext('2d');
    let expensesChart;

    async function getCurrencyListFromAPI() {
        const GET_CURRENCIES_VALUES_ENDPOINT = `${BASE_URL}latest.json`
        const GET_CURRENCIES_ENDPOINT = `${BASE_URL}currencies.json`
        let conversions = await fetch(GET_CURRENCIES_VALUES_ENDPOINT+'?app_id=71fed9da15164bc9a95f328c1ae4c7e5')
        .then((response) => response.json())
        .catch((error) => console.error(error));
        conversions = conversions.rates

        const countries = await fetch(GET_CURRENCIES_ENDPOINT)
        .then((response) => response.json())
       .catch((error) => console.error(error));
        let result = [];

        for (const code in conversions) {
            if (countries[code] && conversions[code] !== undefined) {
            result.push({
                code: code,
                name: countries[code],
                conversionValue: conversions[code]
            });
            }
        }

        countryCodes = ["ARS", "AWG", "BBD", "BMD", "BOB", "BRL", "BSD", "BZD", "CAD", "CLF", "CLP", "COP", "CRC", "CUC", "CUP", "DOP", "GTQ", "GYD", "HNL", "HTG", "JMD", "KYD", "MXN", "NIO", "PAB", "PEN", "PYG", "SRD", "SVC", "TTD", "USD", "UYU", "VES"]
        
        result = result.filter((element)=>countryCodes.includes(element.code))


        return result;
    }

    async function getCurrenciesList(){
        let currenciesList = localStorage.getItem("currencies");
    
        if (!!currenciesList && currenciesList.length) {
          console.log('Using Currencies from localstorage');
          return JSON.parse(currenciesList);
        } 
        
        console.log('Using Currencies from API');

        currenciesList = await getCurrencyListFromAPI();
        localStorage.setItem("currencies", JSON.stringify(currenciesList));
        return JSON.parse(currenciesList);
      };

    function renderSummary(){
        let totalEx = 0;

        expenses.forEach((expense) => {
            totalEx += convertCurrency(expense.amount, expense.currency, budget.currency);
        });

        totalExpenses.value = totalEx.toFixed(2);

        let totalLeftBudget = budget.amount - totalEx;
        if(totalLeftBudget < 0){
            leftBudget.style.color = 'rgb(255,0,0)'
        }else{
            leftBudget.style.color = 'rgb(0,0,0)'
        }
        leftBudget.value = totalLeftBudget.toFixed(2);


        summaryTableBody.innerHTML = '';
        let summaryData = [];

        categories.forEach((category) => {
            let categoryTotalAmount = 0;
            expenses.forEach((expense) => {
                if (category.name == expense.category) {
                    categoryTotalAmount += convertCurrency(expense.amount, expense.currency,budget.currency);
                }
            });
            summaryData.push({ name: category.name, amount: categoryTotalAmount.toFixed(2) });
            addSummaryToTable(category.name, categoryTotalAmount.toFixed(2));
        });

        renderChart(summaryData);
    }

    function renderChart(data) {
        const labels = data.map(item => item.name);
        const amounts = data.map(item => item.amount);

        if (expensesChart) {
            expensesChart.destroy();
        }

        const colors = {
            green: 'rgba(34, 139, 34, 1)',        // ForestGreen
            lightGreen: 'rgba(144, 238, 144, 1)', // LightGreen
            darkGreen: 'rgba(0, 100, 0, 1)',      // DarkGreen
            yellow: 'rgba(255, 255, 0, 1)',       // Yellow
            darkYellow: 'rgba(204, 204, 0, 1)',   // DarkGoldenrod
            blue: 'rgba(30, 144, 255, 1)',        // DodgerBlue
            lightBlue: 'rgba(173, 216, 230, 1)',  // LightBlue
            darkBlue: 'rgba(0, 0, 139, 1)'        // DarkBlue
          };
        
        expensesChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Expenses by Category',
                    data: amounts,
                    backgroundColor: [
                        colors.green,
                        colors.lightGreen,
                        colors.darkGreen,
                        colors.yellow,
                        colors.darkYellow,
                        colors.blue,
                        colors.lightBlue,
                        colors.darkBlue
                      ],
                    borderColor: 'rgba(255, 255, 255, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.label + ': ' + budget.code +' '+ tooltipItem.raw;
                            }
                        }
                    }
                }
            }
        });
    }

    function addSummaryToTable(name, amount){
        const row = document.createElement("tr")
        row.innerHTML=`
            <td>${name}</td>
            <td>${amount}</td>
        `
        summaryTableBody.appendChild(row)
    }

    function renderCategories(){
        categoriesTableBody.innerHTML='';
        categories.forEach((category, index)=>{
            addCategoryToTable(category, index)
        })
        renderCategorySelects()
        renderSummary()
    }

    function renderCategorySelects(){
        categorySelects.forEach((select)=>{
            select.innerHTML = ''
            const categoryOptions = categories.map((item)=>
                generateCategoryOption(item)).map((item)=>item.outerHTML).join(" ")
            select.innerHTML = categoryOptions})
    }

    function addCategoryToTable(category,index){
        amount = 0
        expenses.forEach((ex)=>{
            if(ex.category == category.name){
                amount++;
            }
        })
        const row = document.createElement("tr")
        row.innerHTML=`
            <td>${category.name}</td>
            <td>${amount}</td>
            <td>
            <button class="material-icons" id="edit-button" onclick="editCategory(${index})">edit</button>
            <button class="material-icons" id="delete-button" onclick="deleteCategory(${index})">delete</button>
            </td>
        `
        categoriesTableBody.appendChild(row)

    }

    function renderExpenses() {
        expensesTableBody.innerHTML ='';
        expenses.forEach((expense, index)=>{
            addExpenseToTable(expense,index)
        })
        renderSummary()
    }

    function convertCurrency(amount, fromCurrency, toCurrency) {
        let fromConvertion = 0;
        let toConvertion = 0;
        currencies.forEach((currency)=>{
            if (currency.name == fromCurrency) {
                fromConvertion = currency.conversionValue
            }
            if (currency.name == toCurrency){
                toConvertion = currency.conversionValue
            }
        })
        const amountInUSD = amount / fromConvertion;
        const amountInTargetCurrency = (amountInUSD * toConvertion);
        return amountInTargetCurrency;
    }

    function addExpenseToTable(expense, index){
        const row = document.createElement("tr")
        convertionRate = convertCurrency(expense.amount, expense.currency, budget.currency).toFixed(2);
        row.innerHTML =
        `
        <td>${expense.date}</td>
        <td>${expense.category}</td>
        <td>${expense.name}</td>
        <td>${expense.amount}</td>
        <td>${expense.currency}</td>
        <td>${convertionRate}</td>
        <td>
        <button class="material-icons" id="edit-button" onclick="editExpense(${index})">edit</button>
        <button class="material-icons" id="delete-button" onclick="deleteExpense(${index})">delete</button>
        </td>
        `
        expensesTableBody.appendChild(row)
    }
    
    function generateCurrencyOption(currency){
        return createNode(`<option>${currency.name}</option>`,"select")
    }

    function generateCategoryOption(category){
        return createNode(`<option>${category.name}</option>`,"select")
    }

    window.editExpense = function(index){
        const expense = expenses[index];
        document.getElementById("expense-category").value = expense.category;
        categories.map((item)=>{
            if(item.name == expense.category){
                item.amount--;
            }
        })
        document.getElementById("expense-date").value = expense.date;
        document.getElementById("expense-name").value = expense.name;
        document.getElementById("expense-amount").value = expense.amount;
        document.getElementById("expense-currency").value = expense.currency;
        document.getElementById("expense-index").value = index;
        openExpenseModal();
    }

    window.editCategory = function(index){
        const category = categories[index];
        document.getElementById("category-name").value = category.name;
        document.getElementById("category-index").value = index;
        openCategoryModal();
    }

    window.deleteExpense = function(index){
        const expense = expenses[index];
        expenses.splice(index,1)
        categories.map((item)=>{
            if(item.name == expense.category){
                item.amount--;
            }
        })
        localStorage.setItem("expenses", JSON.stringify(expenses))
        localStorage.setItem("categories", JSON.stringify(categories))
        renderExpenses()
        renderCategories()
    }

    window.deleteCategory = function(index){
        const category = categories[index];
        if(category.amount > 0){
            window.alert("This category has been associated with specific expenses and, therefore, cannot be removed")
            return
        }
        categories.splice(index,1);
        localStorage.setItem("categories", JSON.stringify(categories))
        renderCategories()
    }

    window.openExpenseModal = function(){
        document.getElementById("expense-modal").style.display = "block"
    }

    window.closeExpenseModal = function(){
        document.getElementById("expense-modal").style.display = "none"
        expenseForm.reset()
        document.getElementById("expense-index").value = ""
    }

    window.openCategoryModal = function(){
        document.getElementById("category-modal").style.display = "block"
    }

    window.closeCategoryModal = function(){
        document.getElementById("category-modal").style.display = "none"
        categoryForm.reset()
        document.getElementById("category-index").value = ""
    }
    renderExpenses()
    renderCategories()
    document.getElementById("budget-amount").value = budget.amount
    document.getElementById("budget-currency").value = budget.currency
})
