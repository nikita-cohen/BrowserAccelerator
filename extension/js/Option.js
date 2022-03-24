const neverSuspendIfCharge = document.getElementById('Never-suspend-tabs-when-connected-to-power-source');
const neverSuspendIfTabPlayingMusic = document.getElementById('Never-suspend-tabs-that-are-playing-audio');
const neverSuspendIfFormOpen = document.getElementById('Never-suspend-tabs-that-contain-unsaved-form-inputs');
const neverSuspendActiveTab = document.getElementById('Never-suspend-active-tab-in-each-window');
const neverSuspendPinnedTabs = document.getElementById('Never-suspend-pinned-tabs');
const suspendAfterTime = document.getElementById('time');
const discardTab = document.getElementById('discard-tab');

function checkWhichCheckboxIsOn(){
    chrome.storage.local.get(['battery', 'music', 'form', 'active', 'pinned', 'discard'], function (result) {
        if (result.battery) {
            if (result.battery === "on") {
                neverSuspendIfCharge.checked = true;
            }
        }


        if (result.music) {
            if (result.music === "on"){
                neverSuspendIfTabPlayingMusic.checked = true;
            }
        }

        if (result.form) {
            if (result.form === "on"){
                neverSuspendIfFormOpen.checked = true;
            }
        }

        if (result.active) {
            if (result.active === "on") {
                neverSuspendActiveTab.checked = true;
            }
        }

        if (result.pinned) {
            if (result.pinned === "on") {
                neverSuspendPinnedTabs.checked = true;
            }
        }

        if (result.discard) {
            if (result.discard === "on") {
                discardTab.checked = true;
            }
        }
    })
}

function checkHowMuchTimeToSuspend() {
    chrome.storage.local.get('time', function (result) {
       if (result.time) {
           switch (result.time) {
               case 0 :
                   suspendAfterTime.selectedIndex = 0;
                   break;
               case 20000 :
                   suspendAfterTime.selectedIndex = 1;
                   break;
               case 60000 :
                   suspendAfterTime.selectedIndex = 2;
                   break;
               case 300000 :
                   suspendAfterTime.selectedIndex = 3;
                   break;
               case 600000 :
                   suspendAfterTime.selectedIndex = 4;
                   break;
               case 900000 :
                   suspendAfterTime.selectedIndex = 5;
                   break;
               case 1800000 :
                   suspendAfterTime.selectedIndex = 6;
                   break;
               case 3600000 :
                   suspendAfterTime.selectedIndex = 7;
                   break;
               case 7200000 :
                   suspendAfterTime.selectedIndex = 8;
                   break;
               case 14400000 :
                   suspendAfterTime.selectedIndex = 9;
                   break;
               case 21600000 :
                   suspendAfterTime.selectedIndex = 10;
                   break;
               case 43200000 :
                   suspendAfterTime.selectedIndex = 11;
                   break;
               case 86400000 :
                   suspendAfterTime.selectedIndex = 12;
                   break;
               case 172800000 :
                   suspendAfterTime.selectedIndex = 13;
                   break;
               case 259200000 :
                   suspendAfterTime.selectedIndex = 14;
                   break;
               case 604800000 :
                   suspendAfterTime.selectedIndex = 15;
                   break;
               case 1209600000 :
                   suspendAfterTime.selectedIndex = 16;
                   break;
           }
       }
    })
}

function changeIndexToMilliseconds(index) {
    switch (index) {
        case "0" :
            return 0;
        case "1" :
            return 20000;
        case "2" :
            return 60000;
        case "3" :
            return 300000;
        case "4" :
            return 600000;
        case "5" :
            return 900000;
        case "6" :
            return 1800000;
        case "7" :
            return 3600000;
        case "8" :
            return 7200000;
        case "9" :
            return 14400000;
        case "10" :
            return 21600000;
        case "11" :
            return 43200000;
        case "12" :
            return 86400000;
        case "13" :
            return 172800000;
        case "14" :
            return 259200000;
        case "15" :
            return 604800000;
        case "16" :
            return 1209600000;
    }
}

function setOnChange() {
    neverSuspendIfCharge.addEventListener('change', (event) => {
        if (event.target.checked) {
            chrome.storage.local.set({"battery" : "on"})
        } else {
            chrome.storage.local.set({"battery" : "off"})
        }
    })

    neverSuspendIfTabPlayingMusic.addEventListener('change', (event) => {
        if (event.target.checked) {
            chrome.storage.local.set({'music' : "on"})
        } else {
            chrome.storage.local.set({'music' : "off"})
        }
    })

    neverSuspendIfFormOpen.addEventListener('change', (event) => {
        if (event.target.checked) {
            chrome.storage.local.set({'form' : "on"})
        } else {
            chrome.storage.local.set({'form' : "off"})
        }
    })

    neverSuspendActiveTab.addEventListener('change', (event) => {
        if (event.target.checked) {
            chrome.storage.local.set({'active' : "on"})
        } else {
            chrome.storage.local.set({'active' : "off"})
        }
    })

    neverSuspendPinnedTabs.addEventListener('change', (event) => {
        if (event.target.checked) {
            chrome.storage.local.set({'pinned' : "on"})
        } else {
            chrome.storage.local.set({'pinned' : "off"})
        }
    })

    discardTab.addEventListener('change', (event) => {
        if (event.target.checked) {
            chrome.storage.local.set({'discard' : "on"})
        } else {
            chrome.storage.local.set({'discard' : "off"})
        }
    })

    suspendAfterTime.addEventListener('change', (event) => {
        let number = changeIndexToMilliseconds(event.target.value);
        chrome.storage.local.set({'time' : number})
    })
}

function init() {
    checkHowMuchTimeToSuspend();
    setOnChange();
    checkWhichCheckboxIsOn();
}

init()
