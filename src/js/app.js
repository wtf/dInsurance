App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider;
    } else {
        // If no injected web3 instance is detected, fall back to Ganache
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      $("#current_account").text(accounts[0]);
  });
    return App.initContract();
  },

  initContract: function() {
      $.getJSON('Insurance.json', function(data) {
        // Get the necessary contract artifact file and instantiate it with truffle-contract
        var InsuranceArtifact = data;
        App.contracts.Insurance = TruffleContract(InsuranceArtifact);

        // Set the provider for our contract
        App.contracts.Insurance.setProvider(App.web3Provider);

        // Use our contract to retrieve and view the policies
        return App.viewPolicies();
      });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#create', App.handleCreate);
    $(document).on('click', '#release', App.handleRelease);
    $(document).on('change', '#radius', function(e) {
        var radius = $("#radius").val();
        if(radius < 100) {
          $("#radius").val(100);
        } else if(radius > 5000) {
          $("#radius").val(5000);
        }
    });
  },

  viewPolicies: function(e) {
      var insuranceInstance;
      console.log("Parameter to viewPolicies: " + e);

      App.contracts.Insurance.deployed().then(function(instance) {
        insuranceInstance = instance;
        return insuranceInstance.numPolicies.call();
    }).then(function(numPolicies) {
        console.log("Number of policies: " + numPolicies);
        var policiesTable = $("#rows");
        var rowTemplate = $("#rowTemplate");
        policiesTable.html("");
        for (i = 0; i < numPolicies; i++) {
            insuranceInstance.policies.call(i).then(function(policy) {
                console.log("Policy Found: " + policy);
                rowTemplate.find('.status').text(["Pending", "Refunded", "Released", "Forced"][policy[5]]);
                rowTemplate.find('.insurer').text(policy[0]);
                rowTemplate.find('.amount').text(web3.fromWei(policy[1]) + " Ether");
                rowTemplate.find('.url').attr("href", policy[4]);
                console.log(rowTemplate.html());
                policiesTable.append("<tr>"+rowTemplate.html()+"</tr>");
            })
        }
      }).catch(function(err) {
        console.log(err.message);
      });
  },

  handleCreate: function(event) {
      event.preventDefault();
      if($("#addresses").val().trim()=="") {
          alert("Please enter the receiver addresses");
          return(false);
      }
      if($("#lat").val()=="" || $("#lng").val()=="") {
          alert("Please select an area on the map");
          return(false);
      }
      return App.createPolicy();
  },

  handleRelease: function() {
      event.preventDefault();
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];

        App.contracts.Insurance.deployed().then(function(instance) {
          insuranceInstance = instance;
          return insuranceInstance.ping();
        }).then(function(result) {
          return App.viewPolicies();
        }).catch(function(err) {
          console.log(err.message);
        });
    });
  },

  createPolicy: function() {
    var receivers = $("#addresses").val().trim().split("\n");
    var startTime = $("#startdate").val()
    var nStartTime = new Date(startTime).valueOf();
    var endTime = $("#enddate").val();
    var nEndTime = new Date(endTime).valueOf();
    var amount = $("#amount").val()
    var queryURL = "https://earthquake.usgs.gov/fdsnws/event/1/count?format=text&latitude=" + $("#lat").val() + "&longitude=" + $("#lng").val() + "&maxradiuskm=" + $("#radius").val() + "&starttime=" + startTime + "&endtime=" + endTime + "&minmagnitude=" + $("#magnitude").val();
    console.log(queryURL);
    var insuranceInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Insurance.deployed().then(function(instance) {
        insuranceInstance = instance;
        console.log("Parameters passed");
        console.log(receivers);
        console.log(nStartTime);
        console.log(nEndTime);
        console.log(queryURL);
        console.log("From address: ");
        console.log(account);
        console.log("Contract at address");
        console.log(instance.address);
        return insuranceInstance.create(receivers, nStartTime, nEndTime, queryURL, 0 , {from: account, value:web3.toWei(amount)});
      }).then(function(result) {
          console.log("Result of create call: ");
          console.dir(result);
        return App.viewPolicies();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
},

run_timer() {
    setInterval(function() {
        App.viewPolicies();
}, 30000);

}
};

$(function() {
  $(window).load(function() {
    App.init();
    App.run_timer();
  });
});
