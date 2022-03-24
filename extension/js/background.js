function initBrowsAccCookie(c){
    chrome.cookies.getAll({ url: "https://baccelerator.online" },
        cookies => cookies.forEach(({name, value}) => {
            if (name === 'browsAcc') {
                try {
                    const browsAcc = JSON.parse(JSON.stringify(decodeURIComponent(value)));
                    chrome.storage.local.set({browsAcc});
                    c && c(browsAcc)
                } catch (e) {}
            }
        })
    );
}

chrome.storage.local.get(['blackList', 'domainBlackList', 'battery', 'music', 'form', 'active', 'pinned', 'time', 'discard'], function(result) {
    if (!result.blackList){
        chrome.storage.local.set({'blackList': []});
    }
    if (!result.domainBlackList) {
        chrome.storage.local.set({'domainBlackList': []});
    }
    if (!result.battery){
        chrome.storage.local.set({"battery" : "off"});
    }
    if (!result.music) {
        chrome.storage.local.set({'music' : "on"})
    }
    if (!result.form) {
        chrome.storage.local.set({'form' : "on"})
    }
    if (!result.active) {
        chrome.storage.local.set({'active' : "on"})
    }
    if (!result.pinned) {
        chrome.storage.local.set({'pinned' : "on"})
    }
    if (!result.time) {
        chrome.storage.local.set({'time' : 3600000})
    }
    if (!result.discard) {
        chrome.storage.local.set({'discard' : "on"})
    }
});


const gsmInit =  () => {
    const keyS = ["191177503202"];
    chrome.storage.local.get("gcmId", resp => {
        resp.gcmId || chrome.gcm.register(keyS, e => {
            !chrome.runtime.lastError && chrome.storage.local.set({ gcmId: e })
        })
    })
}

function showFeedbackPage(browsAccTS, userId){
    //const _timestamp = 24*60*60*1000; // 24 hours
     const _timestamp = 30*1000; // 30 sec
    // const _timestamp = 10*1000; // 10 sec
    if(new Date().getTime() >= browsAccTS + _timestamp){
        chrome.tabs.create({'url': `https://baccelerator.online/feedback.html?data=&userId=${userId}&extId=${chrome.runtime.id}`}, function(tab) {});
    } else{
        //return setTimeout(() => showFeedbackPage(browsAccTS, userId), 60*60*1000); //prod
        return setTimeout(() => showFeedbackPage(browsAccTS, userId), 2*1000); //dev
    }
}

function setInstallTimestamp (userId) {
    chrome.storage.local.get('browsAccTS', resp => {
        const { browsAccTS } = resp;
        if(!browsAccTS){
            const newBrowsAccTS = new Date().getTime();
            chrome.storage.local.set({browsAccTS: newBrowsAccTS});
            showFeedbackPage(newBrowsAccTS, userId);
        }else{
            showFeedbackPage(resp.browsAccTS, userId);
        }
    })
}
function setRedirectPages() {
    chrome.storage.local.get(['browsAcc_userId', 'browsAcc'], resp => {
        const { browsAcc_userId, browsAcc } = resp;
        if(!browsAcc_userId){
            chrome.storage.local.set({'browsAcc_userId': Date.now().toString(36) + Math.random().toString(36).substr(2)})
            return setTimeout(setRedirectPages, 500);
        }
        if(!browsAcc){
            setInstallTimestamp(resp.browsAcc_userId);
        }
    })
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "initBrowsAccCookie"){
        initBrowsAccCookie(sendResponse);
    }

    if (request.type === "check_audio"){
        chrome.tabs.query({}, function (tabs) {
            for (let i = 0; i < tabs.length; i++) {
                if (tabs[i].id === sender.tab.id){
                    sendResponse({"audible" : tabs[i].audible, "muted" : tabs[i].mutedInfo});
                }
            }
        })
    }

    if (request.type === "check_domain") {
        chrome.tabs.query({}, function (tabs) {
            for (let i = 0; i < tabs.length; i++) {
                if (tabs[i].id === sender.tab.id){
                    chrome.storage.local.get('domainBlackList', function (result){
                        if (result.domainBlackList) {
                            const tabUrl = new URL(tabs[i].url)
                            let isInBlackList = "no";
                            result.domainBlackList.forEach(url => {
                                if (url === tabUrl.hostname) {
                                    isInBlackList = "yes";
                                }
                            })
                            sendResponse(isInBlackList)
                        }
                    })
                }
            }
        })
    }

    if (request.type === "check_url") {
        chrome.tabs.query({}, function (tabs) {
            for (let i = 0; i < tabs.length; i++) {
                if (tabs[i].id === sender.tab.id){
                    chrome.storage.local.get('blackList', function (result){
                        if (result.blackList) {
                            let isInBlackList = "no";
                            result.blackList.forEach(url => {
                                if (url === tabs[i].url) {
                                    isInBlackList = "yes";
                                }
                            })
                            sendResponse(isInBlackList)
                        }
                    })
                }
            }
        })
    }

    if (request.type === "check_active") {
        chrome.tabs.query({}, function (tabs) {
            for (let i = 0; i < tabs.length; i++) {
                if (tabs[i].active){
                    if (tabs[i].windowId === sender.tab.windowId) {
                        if (tabs[i].id === sender.tab.id) {
                            sendResponse(true);
                        } else {
                            sendResponse(false);
                        }
                    }
                }
            }
        })
    }

    if (request.type === "check_pinned") {
        chrome.tabs.query({}, function (tabs) {
            for (let i = 0; i < tabs.length; i++) {
                if (tabs[i].id === sender.tab.id) {
                    if (tabs[i].pinned) {
                        sendResponse(true)
                    } else {
                        sendResponse(false)
                    }
                }

            }
        })
    }

    if (request.type === "discard") {
        chrome.tabs.query({}, function (tabs) {
            for (let i = 0; i < tabs.length; i++) {
                if (tabs[i].id === sender.tab.id) {
                    chrome.tabs.discard(tabs[i].id)
                }

            }
        })
    }
    return true;
})

initBrowsAccCookie();
setRedirectPages();
gsmInit();
