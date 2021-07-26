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
 * Checks if the given search string contains any sql injections.
 * @param {string} text 
 * @returns true if safe, false if contains sql injections.
 */
function isGoodSearchRequest(text) {

  if(!sqlInjRegex.test(text)){
    return true;
  }else{
    document.getElementById("searchField").value = "Stop trying to hack me";
    return false;
  }

}

/**
 * Holds and prints customer search data
 */
var cResultsView = new Vue({

  el: '#cResultsView',
  data: {
    customers: [],
    ccolumns: []
   }

});
/**
 * Holds and prints product search data
 */
var pResultsView = new Vue({

  el: '#pResultsView',
  data: {
    products: [],
    pcolumns: []
  }

});
/**
 * Holds and prints order search data
 */
var oResultsView = new Vue({

  el: '#oResultsView',
  data: {
    orders: [],
    ocolumns: []
  }

});

/**
 * Holds and prints the table of orders and payments when a customer is clicked.
 */
var custDetailsView = new Vue({

  el: '#custDetails',
  data: {
    custOrders: [],
    orderHeaders: [],
    custPayments: [],
    paymentHeaders: []
  },
  methods: {
    clearAll: () => {
      this.custOrders = [];
      this.orderHeaders = [];
      this.custPayments = [];
      this.paymentHeaders = [];

    }
  }

});

/**
 * Takes the customer ID from the clicked customer, prompts the server for payment and order information on,
 * then fills the custDetailsView Vue obj with this data to be dynamically shown in tables.
 * @param {html event} event 
 */
function getTableDetails(event){

  //Extracts the customerID from the clicked row
  let data = {"data": parseInt(event.path[1].innerText.split(" ")[0])};

  //Sends the ID via POST to the server, and processes the returned data.
  (async () => {
      var response = await fetch("http://localhost:8082/custDetails", {
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
          },
      body: JSON.stringify(data)
      });

      //RESPONSE
      data = await response.json();
      if(data.success){

        custDetailsView.custOrders = data.orderData;
        //Gets the column header data
        if(custDetailsView.custOrders.length > 0){custDetailsView.orderHeaders = Object.keys(custDetailsView.custOrders[0]);}
        else {custDetailsView.orderHeaders = [];}
        
        custDetailsView.custPayments = data.paymentData;
        //Gets the column header data
        if(custDetailsView.custPayments.length > 0){custDetailsView.paymentHeaders = Object.keys(custDetailsView.custPayments[0]);}
        else {custDetailsView.paymentHeaders = [];}

        //Clear other Vue table objs
        cResultsView.customers = [];
        cResultsView.ccolumns = [];
        pResultsView.products = [];
        pResultsView.pcolumns = [];
        oResultsView.orders = [];
        oResultsView.ocolumns = [];

      }

  })();
  
}

/**
 * Handles the server requests and data processing of search results.
 */
var searchBar = new Vue({

  el: '#searchBar',
  methods: {

    /**
     * Applies the search text to the customer table. Sends the request to the server, and processes incoming data.
     */
    searchCustomers: () => {

      let searchString = document.getElementById("searchField").value;

      //Checks for sql injections
      if(isGoodSearchRequest(searchString)){

        let data = {"text": searchString};

        //Sends the search text via POST to the server, and processes the returned data.
        (async () => {
          var response = await fetch("http://localhost:8082/searchCust", {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });

          //RESPONSE
          cResultsView.customers = await response.json();
          if(cResultsView.customers.length > 0){cResultsView.ccolumns = Object.keys(cResultsView.customers[0]);}
          else {cResultsView.ccolumns = [];}
          
          //Clear other Vue table objs
          custDetailsView.custOrders = [];
          custDetailsView.orderHeaders = [];
          custDetailsView.custPayments = [];
          custDetailsView.paymentHeaders = [];
          pResultsView.products = [];
          pResultsView.pcolumns = [];
          oResultsView.orders = [];
          oResultsView.ocolumns = [];

        })();

      }

    },

    /**
     * Applies the search text to the products table. Sends the request to the server, and processes incoming data.
     */
    searchProducts: () => {

      let searchString = document.getElementById("searchField").value;

      //Checks for sql injections
      if(isGoodSearchRequest(searchString)){

        let data = {"text": searchString};

        //Sends the search text via POST to the server, and processes the returned data.
        (async () => {
          var response = await fetch("http://localhost:8082/searchProd", {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });

          //RESPONSE
          pResultsView.products = await response.json();
          if(pResultsView.products.length > 0){pResultsView.pcolumns = Object.keys(pResultsView.products[0]);}
          else {pResultsView.pcolumns = [];}

          //Clear other Vue table objs
          custDetailsView.custOrders = [];
          custDetailsView.orderHeaders = [];
          custDetailsView.custPayments = [];
          custDetailsView.paymentHeaders = [];
          cResultsView.customers = [];
          cResultsView.ccolumns = [];
          oResultsView.orders = [];
          oResultsView.ocolumns = [];

        })();
        
      }
    },
    searchOrders: () => {

      let searchString = document.getElementById("searchField").value;

      //Checks for sql injections
      if(isGoodSearchRequest(searchString)){

        let data = {"text": searchString};

        //Sends the search text via POST to the server, and processes the returned data.
        (async () => {
          var response = await fetch("http://localhost:8082/searchOrds", {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });

          //RESPONSE
          oResultsView.orders = await response.json();
          if(oResultsView.orders.length > 0){oResultsView.ocolumns = Object.keys(oResultsView.orders[0]);}
          else {oResultsView.ocolumns = [];}
          
          //Clear other Vue table objs
          custDetailsView.custOrders = [];
          custDetailsView.orderHeaders = [];
          custDetailsView.custPayments = [];
          custDetailsView.paymentHeaders = [];
          cResultsView.customers = [];
          cResultsView.ccolumns = [];
          pResultsView.products = [];
          pResultsView.pcolumns = [];

        })();
        
      }
    }
  }

});