const suspendNow = document.getElementById("suspend-this-tab-now");
const suspendAllOther = document.getElementById("suspend-all-other");
const unsuspendAll = document.getElementById("unsuspend-all");
const neverSuspendUrl = document.getElementById('never-suspend-url');
const neverSuspendDomain = document.getElementById('never-suspend-domain');
const willSuspendTxt = document.getElementById("will-suspend-txt");
const container = document.getElementById('container');
const removeUrlFromBlackList = document.getElementById('remove-from-black-list');
const removeDomainFromBlackList = document.getElementById('remove-domain-from-black-list');
const notNowATag = document.getElementById('not-now-a');
const unpause = document.getElementById('unpause');
const setting = document.getElementById('setting');
let freezeDiscard = false;
let inBlackList = false;
let canBeSuspended = true;

function checkIfDiscardModeIsOn() {
    chrome.storage.local.get('discard', function (result) {
        if (result.discard) {
            freezeDiscard = result.discard === "on";
        }
    })
}

function checkIfSuspensionPaused() {
    chrome.tabs.query({currentWindow: true}, function (tabs) {
        for (let i = 0; i < tabs.length; i++) {
            if (tabs[i].active) {
                chrome.tabs.sendMessage(tabs[i].id, {type: "checkPause"}, (response) => {
                        if (!window.chrome.runtime.lastError) {
                            if (response === "pause") {
                                container.className = "popup-container not-now";
                                willSuspendTxt.innerHTML = "Tab suspension paused.";
                            }
                        }
                    }
                )
            }
        }
    })
}

function checkIfDomainIsInBlackList() {
    chrome.tabs.query({currentWindow: true}, function (tabs) {
            tabs.forEach(tab => {
                if (tab.active) {
                    chrome.storage.local.get('domainBlackList', function (result) {
                        if (result.domainBlackList) {
                            const url = new URL(tab.url);
                            result.domainBlackList.forEach(domain => {
                                if (domain === url.hostname) {
                                    container.className = "popup-container black-domain"
                                    willSuspendTxt.innerHTML = "Domain blacklisted."
                                    inBlackList = true
                                }
                            })
                        }
                    })
                }
            })
        }
    )

}

function checkIfUrlIsInBlackList() {
    chrome.tabs.query({currentWindow: true}, function (tabs) {
        tabs.forEach(tab => {
            if (tab.active) {
                chrome.storage.local.get('blackList', function (result) {
                    if (result.blackList) {
                        result.blackList.forEach(url => {
                            if (url === tab.url) {
                                container.className = "popup-container black-url"
                                willSuspendTxt.innerHTML = "Site blacklisted."
                                inBlackList = true;
                            }
                        })
                    }
                })
            }
        })
    })

}

function checkIfTabIsSuspended() {
    chrome.tabs.query({currentWindow: true}, function (tabs) {
        tabs.forEach(tab => {
            if (tab.active) {
                if (tab.url.startsWith("blob:")) {
                    container.className = "popup-container blob"
                    willSuspendTxt.innerHTML = "Tab Is Suspended";
                }
            }
        })
    })
}

function checkIfTabPlayingMusic() {
    chrome.tabs.query({currentWindow: true}, function (tabs) {
        tabs.forEach(tab => {
            if (tab.active) {
                if (tab.audible) {
                    container.className = "popup-container audio"
                    willSuspendTxt.innerHTML = "Tab is playing audio";
                }
            }
        })
    })
}

function checkIfTabCanBeSuspended() {
    chrome.tabs.query({currentWindow: true}, function (tabs) {
        tabs.forEach(tb => {
            if (tb.active) {
                const isMatch = !(tb.url.match("https://chrome.google.com") || tb.url.match('chrome://') || tb.url.match("chrome-error://chromewebdata/") || tb.url.match("error://chromewebdata/") || tb.url.match("view-source:") || tb.url.match("file:///") || !tb.url.match("http://") && !tb.url.match("https://"))
                if (!isMatch) {
                    container.className = "popup-container no-suspend"
                    willSuspendTxt.innerHTML = "Tab cannot be suspended";
                    canBeSuspended = false;
                }
            }
        })
    })


}

function setOnClicks() {
    suspendNow.addEventListener('click', () => {
        chrome.tabs.query({}, function (tabs) {
            for (let i = 0; i < tabs.length; i++) {
                if (tabs[i].active) {
                    chrome.tabs.sendMessage(tabs[i].id, {type: "suspend"})
                    willSuspendTxt.innerHTML = "Tab Is Suspended";
                    container.className = "popup-container blob";
                }
            }
        })
    });

    suspendAllOther.addEventListener('click', () => {
        chrome.tabs.query({}, function (tabs) {
            for (let i = 0; i < tabs.length; i++) {
                if (!tabs[i].active) {
                    if (!freezeDiscard) {
                        chrome.tabs.sendMessage(tabs[i].id, {type: "suspend"})
                    } else {
                        chrome.tabs.discard(tabs[i].id)
                    }

                }
            }
        })

    })

    unsuspendAll.addEventListener('click', () => {
        chrome.tabs.query({currentWindow: true}, function (tabs) {
            tabs.forEach(tab => {
                console.log(tab)
                const newUrl = new URL(tab.url);
                const prevLocation = newUrl.hash.substring(1);
                if (prevLocation.startsWith("blob")) {
                    chrome.tabs.update(tab.id, {url: prevLocation.substring(4)});
                    if (!inBlackList && canBeSuspended) {
                        container.className = "popup-container"
                        willSuspendTxt.innerHTML = "Tab will suspend automatically."
                    }
                }
            })
        })
    })

    neverSuspendUrl.addEventListener('click', () => {
        chrome.tabs.query({}, function (tabs) {
            tabs.forEach(tab => {
                if (tab.active) {
                    chrome.storage.local.get('blackList', function (result) {
                        if (result.blackList) {
                            const blackList = result.blackList;
                            let isUrlAlreadyInList = false;
                            blackList.forEach(url => {
                                if (url === tab.url) {
                                    isUrlAlreadyInList = true;
                                }
                            })

                            if (!isUrlAlreadyInList) {
                                blackList.push(tab.url);
                                chrome.storage.local.set({'blackList': blackList});
                                container.className = "popup-container black-url"
                                willSuspendTxt.innerHTML = "Site blacklisted."
                                inBlackList = true
                            }
                        }
                    })
                }
            })
        })
    })

    neverSuspendDomain.addEventListener('click', () => {
        chrome.tabs.query({}, function (tabs) {
            tabs.forEach(tab => {
                if (tab.active) {
                    chrome.storage.local.get('domainBlackList', function (result) {
                        const url = new URL(tab.url);
                        if (result.domainBlackList) {
                            const domainBlackList = result.domainBlackList;
                            let isDomainAlreadyInBlackList = false;
                            domainBlackList.forEach(url => {
                                if (url === tab.url) {
                                    isDomainAlreadyInBlackList = true;
                                }
                            })
                            if (!isDomainAlreadyInBlackList) {
                                domainBlackList.push(url.hostname);
                                chrome.storage.local.set({'domainBlackList': domainBlackList});
                                container.className = "popup-container black-domain"
                                willSuspendTxt.innerHTML = "Domain blacklisted."
                                inBlackList = true
                            }
                        }
                    });
                }
            })
        })
    })

    removeUrlFromBlackList.addEventListener('click', () => {
        chrome.tabs.query({}, function (tabs) {
            tabs.forEach(tb => {
                if (tb.active) {
                    chrome.storage.local.get('blackList', function (result) {
                        if (result.blackList) {
                            const index = result.blackList.findIndex(url => url === tb.url);
                            const newArray = result.blackList;
                            newArray.splice(index, 1);
                            chrome.storage.local.set({'blackList': newArray});
                            container.className = "popup-container"
                            willSuspendTxt.innerHTML = "Tab will suspend automatically."
                            inBlackList = false;
                        }
                    })
                }
            })
        })
    })

    removeDomainFromBlackList.addEventListener('click', () => {
        chrome.tabs.query({}, function (tabs) {
            tabs.forEach(tb => {
                if (tb.active) {
                    chrome.storage.local.get('domainBlackList', function (result) {
                        if (result.domainBlackList) {
                            const newUrl = new URL(tb.url);
                            const index = result.domainBlackList.findIndex(url => url === newUrl.hostname);
                            const newArray = result.domainBlackList;
                            newArray.splice(index, 1);
                            chrome.storage.local.set({'domainBlackList': newArray});
                            container.className = "popup-container"
                            willSuspendTxt.innerHTML = "Tab will suspend automatically."
                            inBlackList = false;
                        }
                    })
                }
            })
        })
    })

    notNowATag.addEventListener('click', () => {
        chrome.tabs.query({}, function (tabs) {
            for (let i = 0; i < tabs.length; i++) {
                if (tabs[i].active) {
                    chrome.tabs.sendMessage(tabs[i].id, {type: "not-now"})
                    container.className = "popup-container not-now";
                    willSuspendTxt.innerHTML = "Tab suspension paused.";
                }
            }
        })
    })

    unpause.addEventListener('click', () => {
        chrome.tabs.query({}, function (tabs) {
            for (let i = 0; i < tabs.length; i++) {
                if (tabs[i].active) {
                    chrome.tabs.sendMessage(tabs[i].id, {type: "unpause"})
                    container.className = "popup-container";
                    willSuspendTxt.innerHTML = "Tab will suspend automatically.";
                }
            }
        })
    })

    setting.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    })
}

function init(type) {
    if (type === "base") {
        checkIfDiscardModeIsOn();
        setOnClicks();
    }
    checkIfTabCanBeSuspended();
    checkIfTabIsSuspended();
    checkIfSuspensionPaused();
    checkIfTabPlayingMusic();
    checkIfUrlIsInBlackList();
    checkIfDomainIsInBlackList();
}

init("base")
