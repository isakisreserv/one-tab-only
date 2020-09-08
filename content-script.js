function loadAlert(src) {
    let frame = document.createElement("iframe");
    frame.src = src;
    frame.style.width = "390px";
    frame.style.height = "136px";
    frame.style.border = "none";
    frame.style.position = "fixed";
    frame.style.right = "20px";
    frame.style.top = "20px";
    frame.style.zIndex = "2147483647";
    frame.classList.add("oneTabAlert");
    
    document.body.appendChild(frame);
}

chrome.runtime.onMessage.addListener((request, sender, response) => {
    if (request.action === "iframe") {
        loadAlert(request.iframeSrc);
        response({received: "true"});
    } else if (request.action === "close") {
        document.getElementsByClassName("oneTabAlert")[document.getElementsByClassName("oneTabAlert").length-1].outerHTML = "";
    }
        
});
