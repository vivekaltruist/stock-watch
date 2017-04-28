

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

}
/*var stockList = ['DAAWAT','DMART','V2RETAIL','DHFL'];
chrome.storage.sync.set({"data":stockList},function(){
    if (chrome.runtime.error)
        console.log("Runtime error.");
});*/

document.addEventListener('DOMContentLoaded', function() {
    let stockList=new Set();
    $("#stock").html('Loading...');
    $("#stockAdd").click(function(){
        stockList.add($('#stockInput').val());
        //console.dir(stockList);
        var stockArray = [...stockList];
        chrome.storage.sync.set({"StockData":stockArray},function(){
            if (chrome.runtime.error)
                console.log("Runtime error.");
            location.reload();
        });
    });
    chrome.storage.sync.get("StockData", function (obj) {
        console.log('data: ',obj);

        var data = obj["StockData"], stockListString='';
        if(!data || data.length == 0)
            return;
        stockList = new Set(data);
        stockList.forEach(function(data){
            stockListString+=data+',';
        });
        console.log('obj ',stockListString);

        $.ajax({
            url:encodeURI("https://www.google.com/finance/info?q="+stockListString),
            type:'GET',
            success: function(data){
                result = data.split('//')[1];
                result = result.trim();

                resultArray = JSON.parse(result);
                console.log(resultArray);
                var text = "";
                for(var i=0; i< resultArray.length; i++){
                    text += '<b>'+resultArray[i]['t']+'</b>: '+resultArray[i]['l']+'<br>';
                }

                $("#stock").html(text);
            },
            error: function(xhr, ajaxOptions, thrownError){
                $("#stock").text("Error: ",xhr.status,thrownError);
            }
        });
    });

});
