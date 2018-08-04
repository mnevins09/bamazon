var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    //username
    user: "root",
    //password
    password: "mathieu1",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    console.log("running")

});

// function to set the inventory up in the console
var inventoryId = [];
var inventoryName = [];
var inventoryPrice = [];
var inventoryQuantity = [];
var departmentName = [];
var productIdNumber = 0;
var productName = "";
var stockQuantity = 0;
var productPrice = 0;

function queryItem() {
    var query = connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        for (var i = 0; i < res.length; i++) {
            inventoryId.push(res[i].item_id);
            inventoryName.push(res[i].product_name);
            departmentName.push(res[i].department_name);
            inventoryPrice.push(res[i].price);
            inventoryQuantity.push(res[i].stock_quantity);
            console.log("Id: " + res[i].item_id + " | " + " Name: " + res[i].product_name + " | " + " Department Name: " + res[i].department_name + " | " + " Price: " + res[i].price + " | " + " Stock Quantity: " + res[i].stock_quantity);
        }
        questions();

    });

}

// function to check inventory levels for purchase
function checkInventory(requestedQuantity) {

    if (requestedQuantity > stockQuantity) {
        console.log("Sorry! " + requestedQuantity + " units of " + productName + " are not in stock! Only " + stockQuantity + " units available.");
        questions();
    } else {
        updateProduct(requestedQuantity);
    }
    return;
}

// function to update the mysql db
function updateProduct(requestedQuantity) {
    //var requestedQuantity = requestedQuantity;
    var newStockQuantity = stockQuantity - requestedQuantity;
    console.log("Gathering your order...\n" + productName + " \n" + "Quantity: " + requestedQuantity);
    var query = connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: newStockQuantity
            },
            {
                item_id: productIdNumber
            }
        ],
        function (err, res) {
            console.log("Order ready!\n");
            customerTotal(requestedQuantity);
            return;
        }
    )
};

// adds the customer total
function customerTotal(requestedQuantity) {
    productPrice = productPrice * requestedQuantity;
    console.log("Your total is: " + productPrice)
    return continueShopping();
    process.exit();
}

// after purchase, you get another chance to continue shopping
function continueShopping() {
    inquirer.prompt([
        {
            name: 'continueShopping',
            message: "Would you like to keep shopping? ( y or n )"
        }
    ]).then(function (answer) {
        if (answer.continueShopping === "y") {
            console.log(answer.continueShopping)
            questions();
        } else {
            connection.end();
        };

    });
};

// starts the shopping experience
function questions() {
    inquirer.prompt(
        [
            {
                name: "item_id",
                message: "What is the ID of the item you would like to buy?"
            },
            {
                name: "productQuantity",
                message: "How many units would you like to buy?"
            }

        ]).then(function (answers) {
            productIdNumber = answers.item_id;
            productName = inventoryName[answers.item_id - 1];
            stockQuantity = inventoryQuantity[answers.item_id - 1];
            productPrice = inventoryPrice[answers.item_id - 1];


            //requestedQuantity = answers.productQuantity;
            checkInventory(answers.productQuantity);

        });
    return;

};



queryItem();

