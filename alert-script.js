function openInNewWindow(url) {
    chrome.runtime.sendMessage({action: "openWindow", url: url});
    chrome.tabs.sendMessage(tabId, {action: "close"});
}

let url;
let tabId;

window.onload = function() {
    let urlElement = document.getElementsByClassName("url")[0];
    url = window.location.search.substr(1);
    tabId = +window.location.hash.split("#")[window.location.hash.split("#").length-1];
    let newWindowElement = document.getElementsByClassName("newWindow")[0];
    let currentWindowElement = document.getElementsByClassName("currentWindow")[0];

    urlElement.innerText = url;
    urlElement.title = url;
    newWindowElement.onclick = () => openInNewWindow(url);
    currentWindowElement.href = url;
}

document.getElementsByClassName("currentWindow")[0].onclick = function() {
    if (url.split(":")[0] === "chrome") {//alternativt använda regex men file:// verkar fungera
        chrome.runtime.sendMessage({action: "changeUrl", url: url});
        return false;
    }
}

document.getElementsByClassName("close")[0].onclick = function() {
    chrome.tabs.sendMessage(tabId, {action: "close"});
}