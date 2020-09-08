let active = false;

document.getElementById("ask").onclick = () => {
    setNewTabSettings("ask");
}

document.getElementById("currentTab").onclick = () => {
    setNewTabSettings("currentTab");
}

document.getElementById("newWindow").onclick = () => {
    setNewTabSettings("newWindow");
}

function setNewTabSettings(newTab) {
    Array.from(document.getElementsByClassName("alternative")).forEach(alt => {
        alt.classList.remove("selected");
    });
    document.getElementById(newTab).classList.add("selected");
    chrome.runtime.sendMessage({action: "setNewTabSettings", newTab: newTab});
}

document.getElementById("status").onclick = () => {
    active = !active;

    chrome.storage.local.set({activated: active+""}, function() {
        console.log('Value is set to ' + active);
        updateText();
    });

    if (active) {
        chrome.runtime.sendMessage({action: "activate"});
    } else {
        chrome.runtime.sendMessage({action: "deactivate"});
    }
   
}

function updateText() {
    if (active) {
        document.getElementById("status").innerText = "Inactivate";
        document.getElementById("heading").style.color = "green";
        document.getElementsByClassName("settings")[0].style.filter = "none";
        chrome.browserAction.setIcon({path: "test 3.png"});
    } else {
        document.getElementById("status").innerText = "Activate";
        document.getElementById("heading").style.color = "gray";
        document.getElementsByClassName("settings")[0].style.filter = "blur(4px)";
        chrome.browserAction.setIcon({path: "test 4.png"});
    }
}

chrome.storage.local.get(["activated"], function(result) {
    console.log('Value is ' + result.activated);
    if (result.activated === "true") {
        active = true;
    } else {
        active = false;
    }
    updateText();
});
chrome.storage.local.get(["newTabSettings"], function(result) {
    setNewTabSettings(result.newTabSettings);
});