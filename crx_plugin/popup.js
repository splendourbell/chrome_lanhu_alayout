

 function MyCopy(text)
 {
    function handler(event) {
        event.clipboardData.setData('text/plain', text);
        document.removeEventListener('copy', handler, true);
        event.preventDefault();
        document.getElementById("mybutton").innerText = "已复制";
    }
    document.addEventListener('copy', handler, true);
    document.execCommand('copy');
 }

var result;
document.getElementById('mybutton').onclick=function(){
    if(result)
    {
        MyCopy(result);
    }
}

document.getElementById("mybutton").disabled = true; 

function getLayoutedData()
{
    chrome.tabs.executeScript({
        code: 'getLayoutedData()'
    }, function(results) {
        if(results[0])
        {
            result = results[0];
            document.getElementById("mybutton").disabled = false;
        }
    });
}

function startCheck()
{
    setTimeout(()=>{
        getLayoutedData();
        if(!result) 
            startCheck();
        else {
            document.getElementById("state").innerText = "已完成，请点击复制";
        }
    }, 200);
}

function startTask()
{
    chrome.tabs.executeScript({
        code: 'startRun()'
    }, function(results) {
  
    });
    startCheck();
}
startTask();
