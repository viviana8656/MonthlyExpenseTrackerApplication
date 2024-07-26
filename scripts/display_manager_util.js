let currencies = [{name:"Dolar",convertionValueToDolar:"1"},{name:"Colon",convertionValueToDolar:"530"},{name:"Euro",convertionValueToDolar:"0.34"}]
let expenses = [{name:'Groceries',amount:'2000', currency:'Dolar'},{name:'Electricity',amount:'100',currency:'Dolar'},{name:'Loan',amount:'500',currency:'Colon'},{name:'Shopping',amount:'100',currency:'Euro'}]
let currentBudget = 0;


const displayCurrencies = () => {
    console.log("ok?")
    const currencySelects = document.getElementsByName("currency-select")
    currencySelects.forEach((currencySelect)=>{
    currencySelect.innerHTML = ''
    const currencyOptions = currencies.map((item)=>
        generateCurrencyOption(item)).map((item)=>item.outerHTML).join(" ")
    currencySelect.innerHTML = currencyOptions})
    //currencySelect.appendChild(currencyOptions)
}

const generateCurrencyOption = (currency) => {
    return createNode(`<option>${currency.name}</option>`,"select")
}

const generateTableItem = (item) => {
    return createNode(`<td>${item.name}</td>
                       <td>${item.amount}</td>
                       <td>${item.currency}</td>
                       <button class="material-icons" onclick="setElementDisplayType('modal','block')">edit</button>
        `,"tr")
}

const createNode = (stringNode, nodeElement = "div", classes = []) => {
    const node = document.createElement(nodeElement);
    node.innerHTML = stringNode;
    //node.classList.add(classes);
    return node;
  };

const displayExpenses = () => {
    const expensesTable = document.getElementById("expenses-table")
    const expensesRows = expenses.map((item)=>generateTableItem(item))
    expensesRows.forEach((item)=>expensesTable.appendChild(item))
    //console.log(expensesRows)
    //expensesTable.appendChild(document.createChild(expensesRows))
}

const displayCurrentBudget = () => {
    document.getElementById("budget-amount").value = currentBudget;
}

//displayCurrentBudget()
//displayCurrencies()
//displayExpenses()