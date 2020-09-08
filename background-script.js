let active = false;
let newTab = "ask";//"newWindow" "currentTab"

chrome.storage.local.get(["activated"], function(result) {
    console.log('Value currently is ' + result.activated);
    if (result.activated == "true") {
        active = true;
    } else {
        active = false;
    }
});

chrome.storage.local.get(["newTabSettings"], function(result) {
    newTab = result.newTabSettings;
});

chrome.tabs.onCreated.addListener((tab) => {
    console.log(newTab);
    if (!active) {
        return;
    }
    /*if (tab.index != 0) {
        //chrome.tabs.remove(tab.id);
    }*/
    if (newTab == "ask") {
        if (tab.openerTabId == undefined) {//första gången man öppnar chrome etc. eller annan app öppnar länk
            chrome.windows.create({tabId: tab.id, state: "maximized"});
        } else if (tab.pendingUrl == undefined) {//target=_blank
            //chrome.tabs.highlight({tabs: tab.index}); //onödigt
            chrome.tabs.get(tab.id, updatedTabState => {
                sendAlertToUser(tab.openerTabId, updatedTabState.id, updatedTabState.pendingUrl);
            });
        } else {//övriga gånger, right click ex.
            sendAlertToUser(tab.openerTabId, tab.id, tab.pendingUrl);
        }
    } else if (newTab == "currentTab") {
        console.log("jaas");
        if (tab.openerTabId == undefined) {//första gången man öppnar chrome etc. eller annan app öppnar länk
            chrome.windows.create({tabId: tab.id, state: "maximized"});
        } else if (tab.pendingUrl == undefined) {//target=_blank
            chrome.tabs.get(tab.id, updatedTabState => {
                chrome.tabs.update(tab.openerTabId, {url: updatedTabState.pendingUrl});
                chrome.tabs.remove(tab.id);
            });
        } else {//övriga gånger, right click ex.
            chrome.tabs.update(tab.openerTabId, {url: tab.pendingUrl});
            chrome.tabs.remove(tab.id);
        }
    } else {
        chrome.windows.create({tabId: tab.id, state: "maximized"});
    }
});

function sendAlertToUser(openerTabId, newTabId, url) {
    chrome.tabs.get(openerTabId, openerTab => {
        if (openerTab.url.match("^(https?|ftp|file)://.*$") != null) {
            chrome.tabs.sendMessage(openerTabId, {action: "iframe", iframeSrc: chrome.runtime.getURL("alert.html") + "?" + url + "#" + openerTabId}, response => {
                if (response == undefined) {//kunde inte öppna popup alert
                    chrome.windows.create({tabId: newTabId, state: "maximized"});
                } else {
                    chrome.tabs.remove(newTabId);
                }
            });
        } else {//chrome://* site
            chrome.windows.create({tabId: newTabId, state: "maximized"}, window => {});
        }
    });
}

chrome.tabs.onAttached.addListener((tabId, attachInfo) => {
    if (!active) {
        return;
    }
    if (attachInfo.newPosition == 0) {
        return;
    }
    chrome.windows.get(attachInfo.newWindowId, {populate: true}, window => {
        console.log("starting timeout to collapse tabs");
        let timeout = setInterval(() => {
            chrome.windows.get(attachInfo.newWindowId, {populate: true}, updatedWindow => {
                if (updatedWindow.tabs.length > 1) {
                    chrome.windows.create({tabId: updatedWindow.tabs[updatedWindow.tabs.length-1].id, state: "maximized"});
                } else {
                    console.log("timeout stopped");
                    clearTimeout(timeout);
                }
            });
        }, 100);
    });

});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === "openWindow") {
            chrome.windows.create({url: request.url, state: "maximized"}, window => {});
        } else if (request.action === "changeUrl") {
            chrome.windows.getLastFocused({populate: true}, (window) => {
                let tab = window.tabs.find(x => x.active == true); //går att göra lättare genom att skicka med flikens id
                chrome.tabs.update(tab.id, {url: request.url});
            });
        } else if (request.action === "activate") {
            active = true;
            chrome.storage.local.set({activated: "true"});
        } else if (request.action === "deactivate") {
            active = false;
            chrome.storage.local.set({activated: "false"});
        } else if (request.action === "setNewTabSettings") {
            newTab = request.newTab;
            chrome.storage.local.set({newTabSettings: newTab});
        }
        console.log(active);
});