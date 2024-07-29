document.addEventListener("DOMContentLoaded", function(){
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

    let budget=JSON.parse(localStorage.getItem("budget")) || {amount:0, currency:"Dolar"}
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [{name:'Groceries',amount:'2000', currency:'Dolar'},{name:'Electricity',amount:'100',currency:'Dolar'},{name:'Loan',amount:'500',currency:'Colon'},{name:'Shopping',amount:'100',currency:'Euro'}]
    let categories = JSON.parse(localStorage.getItem("categories")) || [{name:"food", amount:3}, {name:"studies", amount:1}]
    let currencies = JSON.parse(localStorage.getItem("currencies")) || [{name:"Dolar",convertionValueToDolar:"1"},{name:"Colon",convertionValueToDolar:"530"},{name:"Euro",convertionValueToDolar:"0.34"}]

    currencySelects.forEach((currencySelect)=>{
        currencySelect.innerHTML = ''
        const currencyOptions = currencies.map((item)=>
            generateCurrencyOption(item)).map((item)=>item.outerHTML).join(" ")
        currencySelect.innerHTML = currencyOptions})

    budgetForm.addEventListener("submit", function(event){
        event.preventDefault();
        const amount = parseFloat(document.getElementById("budget-amount").value)
        const currency = document.getElementById("budget-currency").value

        budget = {amount, currency}

        renderSummary()
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
        const amount = 0;
        const index = document.getElementById("category-index").value

        const category = {name, amount}

        if (index === '') {
            categories.push(category)
        } else {
            categories[index] = category
        }
        
        localStorage.setItem("categories", JSON.stringify(categories))
        renderCategories()
        categoryForm.reset()
        closeCategoryModal();
        renderSummary()
    })

    const ctx = document.getElementById('expensesChart').getContext('2d');
    let expensesChart;

    function renderSummary(){
        let totalEx = 0;

        expenses.forEach((expense) => {
            totalEx += convertToMoney(expense.amount, expense.currency);
        });

        totalExpenses.value = totalEx;

        let totalLeftBudget = budget.amount - totalEx;
        leftBudget.value = totalLeftBudget;

        summaryTableBody.innerHTML = '';
        let summaryData = [];

        categories.forEach((category) => {
            let categoryTotalAmount = 0;
            expenses.forEach((expense) => {
                if (category.name == expense.category) {
                    categoryTotalAmount += convertToMoney(expense.amount, expense.currency);
                }
            });
            summaryData.push({ name: category.name, amount: categoryTotalAmount });
            addSummaryToTable(category.name, categoryTotalAmount);
        });

        renderChart(summaryData);
    }

    function renderChart(data) {
        const labels = data.map(item => item.name);
        const amounts = data.map(item => item.amount);

        if (expensesChart) {
            expensesChart.destroy();
        }

        expensesChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Expenses by Category',
                    data: amounts,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
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
                                return tooltipItem.label + ': $' + tooltipItem.raw.toFixed(2);
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

    function convertToMoney(amount, currency){
        return amount
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
        const row = document.createElement("tr")
        row.innerHTML=`
            <td>${category.name}</td>
            <td>${category.amount}</td>
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

    function addExpenseToTable(expense, index){
        const row = document.createElement("tr")
        row.innerHTML =
        `
        <td>${expense.date}</td>
        <td>${expense.category}</td>
        <td>${expense.name}</td>
        <td>${expense.amount}</td>
        <td>${expense.currency}</td>
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
            window.alert("This category has been associated to certain expenses, therefore it can not be removed")
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
