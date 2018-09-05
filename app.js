/**
 * BUDGET CONTROLLER MODULE
 *
 */

var budgetController = (function() {
  // Income item constructor
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  // Expense item constructor
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  // Sums the item total
  var calculateTotal = function(type) {
    var sum = 0;

    // Loops through item array and sums the values
    data.allItems[type].forEach(function(current) {
      sum = sum + current.value;
    });

    // Stores the calculated sum in the data totals
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem, id;
      // Create new id
      if (data.allItems[type].length > 0) {
        id = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        id = 0;
      }

      // Check if type is exp or inc and create new item
      if (type === "exp") {
        newItem = new Expense(id, des, val);
      } else if (type === "inc") {
        newItem = new Income(id, des, val);
      }

      // Pushes the new item to the data object
      data.allItems[type].push(newItem);
      // Return the new item
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;

      // Loop over all items and creates an array with all available ids
      ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      // Returns the index of the id that is passed in
      index = ids.indexOf(id);

      // for indexes that are not -1, delete item with the passed in index
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      // Calculate total income
      calculateTotal("inc");

      // Calculate total expenses
      calculateTotal("exp");

      // Calculate the budget total: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // Calculate the percentage of income that was spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    }
  };
})();

/**
 * UI CONTROLLER MODULE
 *
 */

var UIController = (function() {
  var DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputButton: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container"
  };
  return {
    getInput: function() {
      return {
        // Income or expense -- ".inc", ".exp"
        type: document.querySelector(DOMStrings.inputType).value,
        // Budget item description
        description: document.querySelector(DOMStrings.inputDescription).value,
        // Dollar value of budget item -- as a float
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    },

    addListItem: function(obj, type) {
      var html, newHtml, element;
      // Create HTML string with placeholder text
      if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMStrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace the placeholder text with actual data from the object
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", obj.value);

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    // Clears user input fields
    clearFields: function() {
      var fields, fieldsArr;

      // Selects the description and value fields
      fields = document.querySelectorAll(
        DOMStrings.inputDescription + ", " + DOMStrings.inputValue
      );

      // The fields variable is a list that can't use slice method
      // Using call on array prototype allows use of slice method on fields list
      fieldsArr = Array.prototype.slice.call(fields);

      // Loops over each item in the fieldsArr and sets the item value to an empty string
      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });

      // Sets the focus back to the first field
      fieldsArr[0].focus();
    },

    // Displays the budget in the UI
    displayBudget: function(obj) {
      document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(DOMStrings.expensesLabel).textContent =
        obj.totalExp;
      document.querySelector(DOMStrings.percentageLabel).textContent =
        obj.percentage;

      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent =
          obj.percentage + " %";
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = "-- %";
      }
    },

    // Calls on the object that has strings of the DOM classes
    getDOMStrings: function() {
      return DOMStrings;
    }
  };
})();

/**
 * APP CONTROLLER MODULE
 *
 */

var controller = (function(budgetCtrl, UICtrl) {
  // Sets up event listeners
  var setupEventListeners = function() {
    // Get the DOMStrings object from UI Controller
    var DOM = UICtrl.getDOMStrings();
    // Click the check button event listener
    document
      .querySelector(DOM.inputButton)
      .addEventListener("click", ctrlAddItem);

    // Press return/enter key event listener
    document.addEventListener("keypress", function(e) {
      // Checks that enter key was pressed
      if (e.keyCode === 13 || e.which === 13) {
        ctrlAddItem();
      }
    });

    // Selects the parent element of the income and expenses lists
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
  };

  // Updates budget total
  var updateBudget = function() {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();

    // 2. Return the budget
    var budget = budgetCtrl.getBudget();

    // 3. Display the updated budget on UI
    UICtrl.displayBudget(budget);
  };

  // Adds budget item, updates totals
  var ctrlAddItem = function() {
    var input, newItem;

    // 1. Get the field input data
    input = UICtrl.getInput();

    // If statement validates the input data first
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      // 4. Clear all input fields
      UICtrl.clearFields();

      // 5. Calculate and update the budget
      updateBudget();
    }
  };

  var ctrlDeleteItem = function(e) {
    var itemID, splitID, type, id;

    // selects the id of the item
    itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      // itemID format example: "inc-0"

      // Takes the itemID string and splits it into two parts in an array
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);

      // 2. Delete the item from the UI

      // 3. Update and show the new budget totals
    }
  };

  // Intialization of the App
  return {
    init: function() {
      console.log("Application has started.");
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  };
})(budgetController, UIController);

// Starts the app
controller.init();
