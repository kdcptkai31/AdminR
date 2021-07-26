//Regex that matches sql injections
const sqlInjRegex = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/);

/**
 * Handles loading the correct page when a button is clicked.
 */
var titleTaskBar = new Vue({

  el: '#taskBar',
  methods: {
    loadView: () => window.location.assign("index.html"),
    loadAddNew: () => window.location.assign("addNew.html")
  }

});

/**
 * Handles and processes all data and methods surrounding the Add Customer process.
 */
let customerHandler = new Vue({

    el: '#addCustomer',
    data: {
        isClicked: true,
        custName: "",
        custFName: "",
        custLName: "",
        custPNumber: "",
        custAdd1: "",
        custAdd2: "",
        custCity: "",
        custState: "",
        custZip: "", 
        custCountry: "",
        custRepNum: -1,
        custCredit: -1
    },
    methods: {

        /**
         * Validates the input form data against sql injections. Allows for optional datafields to be blank.
         * Then it packages it and sends to the server for final validation. Handles the response.
         */
        checkAndSubmitCustomer: function() {

            var isGood = true;
            if(this.custName === "" || sqlInjRegex.test(this.custName)){isGood = false;}
            if(this.custFName === "" || sqlInjRegex.test(this.custFName)){isGood = false;}
            if(this.custLName === "" || sqlInjRegex.test(this.custLName)){isGood = false;}
            if(this.custPNumber === "" || sqlInjRegex.test(this.custPNumber)){isGood = false;}
            if(this.custAdd1 === "" || sqlInjRegex.test(this.custAdd1)){isGood = false;}
            if(this.custAdd2 !== "" && sqlInjRegex.test(this.custAdd2)){isGood = false;}
            if(this.custCity === "" || sqlInjRegex.test(this.custCity)){isGood = false;}
            if(this.custState !== "" && sqlInjRegex.test(this.custState)){isGood = false;}
            if(this.custZip !== "" && sqlInjRegex.test(this.custZip)){isGood = false;}
            if(this.custCountry === "" || sqlInjRegex.test(this.custCountry)){isGood = false;}
            if(this.custRepNum !== -1 && (sqlInjRegex.test(this.custRepNum) || !parseInt(this.custRepNum))){isGood = false;}
            if(this.custCredit !== -1 && (sqlInjRegex.test(this.custCredit) || !parseFloat(this.custCredit))){isGood = false;}

            //If all error checks are passed, attempt to add customer.
            if(isGood){

                this.custRepNum = parseInt(this.custRepNum);
                this.custCredit = parseFloat(this.custCredit);

                let data = [this.custName, this.custFName, this.custLName, this.custPNumber,
                    this.custAdd1, this.custAdd2, this.custCity, this.custState, this.custZip,
                    this.custCountry, this.custRepNum, this.custCredit];

                //Sends the customer obj via POST to the server.
                (async () => {
                    var response = await fetch("http://localhost:8082/addCust", {
                      method: 'POST',
                      headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(data)
                    });

                    //RESPONSE
                    let openedResponse = await response.json();
                    if(openedResponse.success){

                        document.getElementById("cErrorMessage").hidden = false;
                        document.getElementById("cErrorMessage").innerHTML = "SUCCESSFULLY ADDED!";


                    }else{
                        document.getElementById("cErrorMessage").hidden = false;
                    }
                  })();

            }else{ document.getElementById("cErrorMessage").hidden = false; }

        }
    }

});

/**
 * Fossil for adding a new product
 */
let productHandler = new Vue({

    el: '#addProduct',
    data:{
        isClicked: false
    }    

});

/**
 * Fossil for adding a new order
 */
let orderHandler = new Vue({

    el: '#addOrder',
    data: {
        isClicked: false
    }    

});

/**
 * Controls which 'Add New 'BLANK'' form is visable.
 */
 var addTypeBar = new Vue({

    el: '#addBar',
    methods: {

        showAddCustomers: () => {
            customerHandler.isClicked = true;
            productHandler.isClicked = false;
            orderHandler.isClicked = false;
        },

        showAddProducts: () => {
            customerHandler.isClicked = false;
            productHandler.isClicked = true;
            orderHandler.isClicked = false;
        },
        
        showAddOrders: () =>{
            customerHandler.isClicked = false;
            productHandler.isClicked = false;
            orderHandler.isClicked = true;
        }
    }
});