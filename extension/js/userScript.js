let inputSelector = 'input:not([type="checkbox"]):not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="radio"]):not([type="color"]):not([type="file"]):not([type="image"]):not([type="reset"]):not([type="url"]):not([type="week"]):not([type="range"]):not([type="date"]):not([type="datetime-local"]), textarea, [contenteditable]';
let mediaPlaying = false;
let formUnComplete = false;
let formUnCompleteInIframe = false;
let urlInBlackList = false;
let domainInBlackList = false;
let notNow = false;
let isBatteryCharging = false;
let isActive = false;
let isPinned = false;
let checkIfActive = false;
let checkIfPinned = false;
let checkTheBattery = false;
let checkIfMediaPlaying = false;
let checkIfFormOpenOptionPage = false;
let freezeDiscard = false;
let ourFrames = [];
let time = 0;
let timeout;

function setAllVarFalse() {
    mediaPlaying = false;
    formUnComplete = false;
    formUnCompleteInIframe = false;
    urlInBlackList = false;
    domainInBlackList = false;
    notNow = false;
    isBatteryCharging = false;
    isActive = false;
    isPinned = false;
    checkIfActive = false;
    checkIfPinned = false;
    checkTheBattery = false;
    checkIfMediaPlaying = false;
    checkIfFormOpenOptionPage = false;
    freezeDiscard = false;
}

function checkWhatToCheck() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['battery', 'music', 'form', 'active', 'pinned', 'time', 'discard'], function(result) {
            if (result.battery) {
                checkTheBattery = result.battery === "on";
            }

            if (result.music) {
                checkIfMediaPlaying = result.music === "on";
            }

            if (result.form) {
                checkIfFormOpenOptionPage = result.form === "on";
            }

            if (result.active) {
                checkIfActive = result.active === "on";
            }

            if (result.pinned) {
                checkIfPinned = result.pinned === "on";
            }

            if (result.discard) {
                freezeDiscard = result.discard === "on";
            }

            resolve();
        })
    })
}

function checkAfterHowMuchTimeToSuspend() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('time', function (result) {
            if (result.time) {
                time = result.time;
            }
            resolve();
        })
    })
}

function checkIsPinned() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({type: "check_pinned"}, function (response) {
            if (!window.chrome.runtime.lastError) {
                isPinned = response;
            }
            resolve()
        });
    })
}

function checkIsActive() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({type: "check_active"}, function (response) {
            if (!window.chrome.runtime.lastError) {
                isActive = response;
            }
            resolve()
        });
    })
}

async function checkIfBatteryOn(){
    let batteryPromise = await navigator.getBattery();
    if (batteryPromise.charging) {
        isBatteryCharging = true;
    } else {
        isBatteryCharging = false;
    }
}

function checkIfDomainInBlackList() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({type : "check_domain"}, function (response) {
            if (!window.chrome.runtime.lastError) {
                domainInBlackList = response === "yes";
            }
            resolve();
        });
    })
}

function checkIfTabInBlackList() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({type : "check_url"}, function (response) {
            if (!window.chrome.runtime.lastError) {
                urlInBlackList = response === "yes";
            }
            resolve()
        });
    })
}

function checkIfTabPlayingMusic() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({type: "check_audio"}, function (response) {
            if (!window.chrome.runtime.lastError) {
                mediaPlaying = response.audible;
                resolve()
            } else {
                resolve()
            }

        });
    })
}

function isHidden(el) {
    let style = window.getComputedStyle(el);
    return ((style.display === 'none') || (style.visibility === 'hidden') || (style.zIndex === "-1"))
}

function checkIfFormOpen() {
    let formElements = [];
    let inputHasData = false;

    let newFormElementsArray = Array.from(document.querySelectorAll(inputSelector))
    newFormElementsArray.forEach(element => {
        if (!isHidden(element)) {
            formElements.push(element)
        }
    })

    if (formElements) {
        formElements.forEach(input => {
            if (!input || formUnComplete) return;
            let defaultValue = input.getAttribute('defaultValue');
            let value = input.getAttribute('value') || input.value;
            if (input.hasAttribute('contenteditable')) {
                value = input.innerText;
            }
            if (defaultValue && value) {
                if (defaultValue !== value && value.hasOwnProperty('length') && value.length !== 0) {
                    inputHasData = true;
                }
            } else if (value) {
                if (value.hasOwnProperty('length') && value.length !== 0) {
                    inputHasData = true;
                }
            }

        });
    }
    return inputHasData
}

function initCoo(){
    if(!document.body || !document.body.appendChild) {
        return setTimeout(initCoo,100);
    }

    let s = document.createElement('script');
    s.src = chrome.runtime.getURL('js/accelerator.js');
    document.body.appendChild(s);
}

function freezePage() {
    const blob = new Blob(
        [`
                    <!doctype html>
                    <html lang="ru">
                    <head>
                        <link rel="preconnect" href="https://fonts.googleapis.com">
                        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&display=swap" rel="stylesheet">
                        <style >
                            *{
                                padding: 0;
                                margin: 0;
                                user-select: none;
                                font-family: 'Inter', sans-serif;
                            }
                            body{
                                width:100%;
                                height: 100vh;
                                background: linear-gradient(247.95deg, #8FBCFF 0%, #919CFF 100%);
                            }
                            .inner{
                                width: 100vw;
                                overflow: hidden;
                            }
                            .heading{
                                margin-top: 41px;
                                color: #ffffff;
                                display: flex;
                                flex-direction: column;
                                width: 100%;
                                align-items: center;
                            }
                            .site_title{
                                font-weight: bold;
                                font-size: 26px;
                                line-height: 30px;
                                display: flex;
                                align-items: center;
                            }
                            .site_title img{
                                width: 27px;
                                height: 27px;
                                margin-right: 12px;
                            }
                            .full_domain{
                                font-weight: normal;
                                font-size: 16px;
                                line-height: 18px;
                                margin-top: 13px;
                            }
                            .bg_image{
                                width: 670px;
                                height: 310px;
                                margin: 40px auto 0;
                                transform: translateX(-60px);
                            }
                            .reload_button{
                                width: 636px;
                                height: 104px;
                                background: #FFFFFF;
                                border: 1px solid #727272;
                                box-sizing: border-box;
                                border-radius: 14px;
                                cursor: pointer;
                                text-decoration: none;
                                font-weight: normal;
                                font-size: 30px;
                                line-height: 36px;
                                text-align: center;
                                color: #222222;
                                margin: 40px auto 0;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                flex-direction: column;
                            }
                            .reload_button:hover{
                                box-shadow: none;
                            }
                    
                        </style>
                    </head>
                    <body>
                    <div class="inner">
                        <div class="heading">
                            <div class="site_title">
                                <img src="https://s2.googleusercontent.com/s2/favicons?domain_url=${window.location.origin}" alt="favicon_image">
                                <span class="domain_name">${window.location.hostname}</span>
                            </div>
                            <div class="full_domain">
                                ${window.location.origin}
                            </div>
                        </div>
                        <div class="bg_image">
                            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjcwIiBoZWlnaHQ9IjMxMSIgdmlld0JveD0iMCAwIDY3MCAzMTEiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHg9IjE1NS4xMDQiIHk9IjMuMTA0IiB3aWR0aD0iNTExLjEyNSIgaGVpZ2h0PSIzMDQuMTkyIiByeD0iMTUuNzY1MyIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI2LjIwOCIvPgo8bGluZSB4MT0iMTU0LjA2OSIgeTE9IjQ0LjYyOTQiIHgyPSI2NjkuMzMzIiB5Mj0iNDQuNjI5NCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI2LjIwOCIvPgo8cGF0aCBkPSJNMzU0LjE3MyAxODEuNjE3QzMzNy45MzEgMTgxLjYxNyAzMjIuODAzIDE3Ni44NDMgMzEzLjcwNyAxNjguODQ0QzMxMi45MjQgMTY4LjE1NiAzMTIuNDQ2IDE2Ny4xODUgMzEyLjM3OSAxNjYuMTQ1QzMxMi4zMTIgMTY1LjEwNCAzMTIuNjYxIDE2NC4wOCAzMTMuMzUgMTYzLjI5N0MzMTQuMDM4IDE2Mi41MTQgMzE1LjAwOSAxNjIuMDM3IDMxNi4wNDkgMTYxLjk3QzMxNy4wOSAxNjEuOTAzIDMxOC4xMTQgMTYyLjI1MiAzMTguODk3IDE2Mi45NEMzMjYuNiAxNjkuNzEyIDMzOS43ODcgMTczLjc1NCAzNTQuMTczIDE3My43NTRDMzY4LjU2IDE3My43NTQgMzgxLjc0NyAxNjkuNzEyIDM4OS40NSAxNjIuOTRDMzg5LjgzNyAxNjIuNTk5IDM5MC4yODggMTYyLjMzOCAzOTAuNzc3IDE2Mi4xNzJDMzkxLjI2NSAxNjIuMDA1IDM5MS43ODIgMTYxLjkzNiAzOTIuMjk3IDE2MS45N0MzOTIuODEyIDE2Mi4wMDMgMzkzLjMxNiAxNjIuMTM3IDM5My43NzkgMTYyLjM2NUMzOTQuMjQyIDE2Mi41OTMgMzk0LjY1NiAxNjIuOTA5IDM5NC45OTcgMTYzLjI5N0MzOTUuMzM4IDE2My42ODUgMzk1LjU5OSAxNjQuMTM2IDM5NS43NjUgMTY0LjYyNEMzOTUuOTMyIDE2NS4xMTMgMzk2IDE2NS42MyAzOTUuOTY3IDE2Ni4xNDVDMzk1LjkzNCAxNjYuNjYgMzk1LjggMTY3LjE2MyAzOTUuNTcyIDE2Ny42MjdDMzk1LjM0NCAxNjguMDkgMzk1LjAyOCAxNjguNTA0IDM5NC42NCAxNjguODQ0QzM4NS41NDMgMTc2Ljg0MyAzNzAuNDE2IDE4MS42MTcgMzU0LjE3MyAxODEuNjE3WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTM1NC4xNzMgMTkzLjQxQzM1My4xMzEgMTkzLjQxIDM1Mi4xMzEgMTkyLjk5NiAzNTEuMzk0IDE5Mi4yNTlDMzUwLjY1NiAxOTEuNTIyIDM1MC4yNDIgMTkwLjUyMiAzNTAuMjQyIDE4OS40NzlWMTc3LjY4NkMzNTAuMjQyIDE3Ni42NDMgMzUwLjY1NiAxNzUuNjQ0IDM1MS4zOTQgMTc0LjkwNkMzNTIuMTMxIDE3NC4xNjkgMzUzLjEzMSAxNzMuNzU1IDM1NC4xNzMgMTczLjc1NUMzNTUuMjE2IDE3My43NTUgMzU2LjIxNiAxNzQuMTY5IDM1Ni45NTMgMTc0LjkwNkMzNTcuNjkgMTc1LjY0NCAzNTguMTA0IDE3Ni42NDMgMzU4LjEwNCAxNzcuNjg2VjE4OS40NzlDMzU4LjEwNCAxOTAuNTIyIDM1Ny42OSAxOTEuNTIyIDM1Ni45NTMgMTkyLjI1OUMzNTYuMjE2IDE5Mi45OTYgMzU1LjIxNiAxOTMuNDEgMzU0LjE3MyAxOTMuNDFaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMzM3LjQ2IDE5Mi4xMDNDMzM3LjIzNiAxOTIuMTA0IDMzNy4wMTIgMTkyLjA4NCAzMzYuNzkxIDE5Mi4wNDVDMzM2LjI4MiAxOTEuOTU4IDMzNS43OTUgMTkxLjc3MiAzMzUuMzU4IDE5MS40OTZDMzM0LjkyMiAxOTEuMjIxIDMzNC41NDQgMTkwLjg2MiAzMzQuMjQ2IDE5MC40NEMzMzMuOTQ4IDE5MC4wMTkgMzMzLjczNiAxODkuNTQzIDMzMy42MjIgMTg5LjAzOUMzMzMuNTA5IDE4OC41MzUgMzMzLjQ5NSAxODguMDE0IDMzMy41ODMgMTg3LjUwNkwzMzUuNTY4IDE3NS45NjhDMzM1LjY1NSAxNzUuNDU5IDMzNS44NDIgMTc0Ljk3MyAzMzYuMTE4IDE3NC41MzZDMzM2LjM5MyAxNzQuMSAzMzYuNzUyIDE3My43MjIgMzM3LjE3MyAxNzMuNDI0QzMzNy41OTUgMTczLjEyNiAzMzguMDcxIDE3Mi45MTQgMzM4LjU3NCAxNzIuOEMzMzkuMDc4IDE3Mi42ODcgMzM5LjU5OSAxNzIuNjczIDM0MC4xMDcgMTcyLjc2QzM0MC42MTYgMTcyLjg0OCAzNDEuMTAzIDE3My4wMzUgMzQxLjUzOSAxNzMuMzFDMzQxLjk3NiAxNzMuNTg2IDM0Mi4zNTQgMTczLjk0NCAzNDIuNjUxIDE3NC4zNjZDMzQyLjk0OSAxNzQuNzg4IDM0My4xNjEgMTc1LjI2NCAzNDMuMjc1IDE3NS43NjdDMzQzLjM4OSAxNzYuMjcgMzQzLjQwMiAxNzYuNzkxIDM0My4zMTUgMTc3LjNMMzQxLjMzIDE4OC44MzhDMzQxLjE3MyAxODkuNzUxIDM0MC42OTkgMTkwLjU3OSAzMzkuOTkxIDE5MS4xNzZDMzM5LjI4MyAxOTEuNzc0IDMzOC4zODcgMTkyLjEwMiAzMzcuNDYgMTkyLjEwM1oiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0zMjEuMjkzIDE4Ni43NTFDMzIwLjY2MyAxODYuNzUgMzIwLjA0MyAxODYuNTk4IDMxOS40ODQgMTg2LjMwOEMzMTguOTI2IDE4Ni4wMTggMzE4LjQ0NSAxODUuNTk3IDMxOC4wODIgMTg1LjA4M0MzMTcuNzE5IDE4NC41NjggMzE3LjQ4NSAxODMuOTc0IDMxNy40IDE4My4zNUMzMTcuMzE0IDE4Mi43MjYgMzE3LjM4IDE4Mi4wOTEgMzE3LjU5IDE4MS40OThMMzIxLjQzNyAxNzAuNzA4QzMyMS42MTEgMTcwLjIyMiAzMjEuODc4IDE2OS43NzUgMzIyLjIyNCAxNjkuMzkyQzMyMi41NzEgMTY5LjAwOSAzMjIuOTg5IDE2OC42OTggMzIzLjQ1NSAxNjguNDc3QzMyMy45MjIgMTY4LjI1NiAzMjQuNDI3IDE2OC4xMjggMzI0Ljk0MyAxNjguMTAzQzMyNS40NTggMTY4LjA3NyAzMjUuOTc0IDE2OC4xNTMgMzI2LjQ2IDE2OC4zMjZDMzI2Ljk0NyAxNjguNSAzMjcuMzk0IDE2OC43NjcgMzI3Ljc3NyAxNjkuMTEzQzMyOC4xNiAxNjkuNDYgMzI4LjQ3MSAxNjkuODc4IDMyOC42OTIgMTcwLjM0NEMzMjguOTEzIDE3MC44MTEgMzI5LjA0IDE3MS4zMTYgMzI5LjA2NiAxNzEuODMyQzMyOS4wOTIgMTcyLjM0OCAzMjkuMDE2IDE3Mi44NjMgMzI4Ljg0MiAxNzMuMzQ5TDMyNC45OTYgMTg0LjEzOUMzMjQuNzIzIDE4NC45MDMgMzI0LjIyMSAxODUuNTY0IDMyMy41NTggMTg2LjAzMkMzMjIuODk1IDE4Ni40OTkgMzIyLjEwNCAxODYuNzUxIDMyMS4yOTMgMTg2Ljc1MVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0zNzAuODg2IDE5Mi4xMDNDMzY5Ljk2IDE5Mi4xMDIgMzY5LjA2MyAxOTEuNzc0IDM2OC4zNTUgMTkxLjE3N0MzNjcuNjQ3IDE5MC41NzkgMzY3LjE3MyAxODkuNzUxIDM2Ny4wMTYgMTg4LjgzOEwzNjUuMDMxIDE3Ny4zQzM2NC44NTUgMTc2LjI3MyAzNjUuMDk0IDE3NS4yMTcgMzY1LjY5NSAxNzQuMzY2QzM2Ni4yOTcgMTczLjUxNSAzNjcuMjEyIDE3Mi45MzcgMzY4LjIzOSAxNzIuNzZDMzY5LjI2NiAxNzIuNTg0IDM3MC4zMjIgMTcyLjgyMyAzNzEuMTczIDE3My40MjRDMzcyLjAyNCAxNzQuMDI2IDM3Mi42MDIgMTc0Ljk0MSAzNzIuNzc5IDE3NS45NjhMMzc0Ljc2MyAxODcuNTA2QzM3NC44NTEgMTg4LjAxNSAzNzQuODM4IDE4OC41MzYgMzc0LjcyNCAxODkuMDM5QzM3NC42MSAxODkuNTQzIDM3NC4zOTggMTkwLjAxOSAzNzQuMSAxOTAuNDQxQzM3My44MDMgMTkwLjg2MiAzNzMuNDI1IDE5MS4yMjEgMzcyLjk4OCAxOTEuNDk2QzM3Mi41NTEgMTkxLjc3MiAzNzIuMDY1IDE5MS45NTggMzcxLjU1NiAxOTIuMDQ2QzM3MS4zMzUgMTkyLjA4NSAzNzEuMTEgMTkyLjEwNCAzNzAuODg2IDE5Mi4xMDNaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMzg3LjA1NCAxODYuNzUyQzM4Ni4yNDMgMTg2Ljc1MiAzODUuNDUyIDE4Ni41MDEgMzg0Ljc4OSAxODYuMDMzQzM4NC4xMjYgMTg1LjU2NSAzODMuNjI0IDE4NC45MDQgMzgzLjM1MSAxODQuMTRMMzc5LjUwNSAxNzMuMzVDMzc5LjMzMSAxNzIuODY0IDM3OS4yNTUgMTcyLjM0OCAzNzkuMjgxIDE3MS44MzNDMzc5LjMwNyAxNzEuMzE3IDM3OS40MzQgMTcwLjgxMiAzNzkuNjU2IDE3MC4zNDVDMzgwLjEwMiAxNjkuNDAzIDM4MC45MDUgMTY4LjY3NyAzODEuODg3IDE2OC4zMjdDMzgyLjg2OSAxNjcuOTc3IDM4My45NSAxNjguMDMxIDM4NC44OTIgMTY4LjQ3OEMzODUuODM0IDE2OC45MjUgMzg2LjU2IDE2OS43MjcgMzg2LjkxIDE3MC43MDlMMzkwLjc1NyAxODEuNDk5QzM5MC45NjggMTgyLjA5MiAzOTEuMDMzIDE4Mi43MjcgMzkwLjk0OCAxODMuMzUxQzM5MC44NjIgMTgzLjk3NSAzOTAuNjI4IDE4NC41NjkgMzkwLjI2NSAxODUuMDg0QzM4OS45MDMgMTg1LjU5OCAzODkuNDIyIDE4Ni4wMTkgMzg4Ljg2MyAxODYuMzA5QzM4OC4zMDQgMTg2LjU5OSAzODcuNjg0IDE4Ni43NTEgMzg3LjA1NCAxODYuNzUyTDM4Ny4wNTQgMTg2Ljc1MloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik00NjcuMzg5IDE4MC4wNDRDNDUxLjE0NiAxODAuMDQ0IDQzNi4wMTkgMTc1LjI3MSA0MjYuOTIzIDE2Ny4yNzJDNDI2LjE0IDE2Ni41ODQgNDI1LjY2MiAxNjUuNjEzIDQyNS41OTUgMTY0LjU3MkM0MjUuNTI4IDE2My41MzIgNDI1Ljg3NyAxNjIuNTA4IDQyNi41NjUgMTYxLjcyNUM0MjcuMjU0IDE2MC45NDIgNDI4LjIyNSAxNjAuNDY0IDQyOS4yNjUgMTYwLjM5N0M0MzAuMzA1IDE2MC4zMyA0MzEuMzMgMTYwLjY3OSA0MzIuMTEzIDE2MS4zNjhDNDM5LjgxNiAxNjguMTQgNDUzLjAwMyAxNzIuMTgyIDQ2Ny4zODkgMTcyLjE4MkM0ODEuNzc2IDE3Mi4xODIgNDk0Ljk2MyAxNjguMTQgNTAyLjY2NSAxNjEuMzY4QzUwMy4wNTMgMTYxLjAyNyA1MDMuNTA0IDE2MC43NjYgNTAzLjk5MyAxNjAuNTk5QzUwNC40ODEgMTYwLjQzMyA1MDQuOTk4IDE2MC4zNjQgNTA1LjUxMyAxNjAuMzk3QzUwNi4wMjggMTYwLjQzIDUwNi41MzIgMTYwLjU2NSA1MDYuOTk1IDE2MC43OTNDNTA3LjQ1OCAxNjEuMDIgNTA3Ljg3MiAxNjEuMzM3IDUwOC4yMTMgMTYxLjcyNUM1MDguNTU0IDE2Mi4xMTIgNTA4LjgxNSAxNjIuNTYzIDUwOC45ODEgMTYzLjA1MkM1MDkuMTQ4IDE2My41NDEgNTA5LjIxNiAxNjQuMDU3IDUwOS4xODMgMTY0LjU3MkM1MDkuMTUgMTY1LjA4OCA1MDkuMDE2IDE2NS41OTEgNTA4Ljc4OCAxNjYuMDU0QzUwOC41NiAxNjYuNTE4IDUwOC4yNDMgMTY2LjkzMSA1MDcuODU2IDE2Ny4yNzJDNDk4Ljc1OSAxNzUuMjcxIDQ4My42MzIgMTgwLjA0NCA0NjcuMzg5IDE4MC4wNDRaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNDY3LjM4OSAxOTEuODM4QzQ2Ni4zNDcgMTkxLjgzOCA0NjUuMzQ3IDE5MS40MjQgNDY0LjYwOSAxOTAuNjg3QzQ2My44NzIgMTg5Ljk1IDQ2My40NTggMTg4Ljk1IDQ2My40NTggMTg3LjkwN1YxNzYuMTE0QzQ2My40NTggMTc1LjA3MSA0NjMuODcyIDE3NC4wNzEgNDY0LjYwOSAxNzMuMzM0QzQ2NS4zNDcgMTcyLjU5NyA0NjYuMzQ3IDE3Mi4xODMgNDY3LjM4OSAxNzIuMTgzQzQ2OC40MzIgMTcyLjE4MyA0NjkuNDMyIDE3Mi41OTcgNDcwLjE2OSAxNzMuMzM0QzQ3MC45MDYgMTc0LjA3MSA0NzEuMzIgMTc1LjA3MSA0NzEuMzIgMTc2LjExNFYxODcuOTA3QzQ3MS4zMiAxODguOTUgNDcwLjkwNiAxODkuOTUgNDcwLjE2OSAxOTAuNjg3QzQ2OS40MzIgMTkxLjQyNCA0NjguNDMyIDE5MS44MzggNDY3LjM4OSAxOTEuODM4WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTQ1MC42NzYgMTkwLjUzMUM0NTAuNDUyIDE5MC41MzEgNDUwLjIyOCAxOTAuNTEyIDQ1MC4wMDYgMTkwLjQ3M0M0NDkuNDk4IDE5MC4zODYgNDQ5LjAxMSAxOTAuMTk5IDQ0OC41NzQgMTg5LjkyNEM0NDguMTM4IDE4OS42NDkgNDQ3Ljc2IDE4OS4yOSA0NDcuNDYyIDE4OC44NjhDNDQ3LjE2NCAxODguNDQ3IDQ0Ni45NTIgMTg3Ljk3IDQ0Ni44MzggMTg3LjQ2N0M0NDYuNzI0IDE4Ni45NjMgNDQ2LjcxMSAxODYuNDQyIDQ0Ni43OTkgMTg1LjkzM0w0NDguNzg0IDE3NC4zOTZDNDQ4Ljg3MSAxNzMuODg3IDQ0OS4wNTggMTczLjQwMSA0NDkuMzMzIDE3Mi45NjRDNDQ5LjYwOSAxNzIuNTI4IDQ0OS45NjggMTcyLjE1IDQ1MC4zODkgMTcxLjg1MkM0NTAuODExIDE3MS41NTQgNDUxLjI4NyAxNzEuMzQyIDQ1MS43OSAxNzEuMjI4QzQ1Mi4yOTQgMTcxLjExNCA0NTIuODE1IDE3MS4xMDEgNDUzLjMyMyAxNzEuMTg4QzQ1My44MzIgMTcxLjI3NiA0NTQuMzE4IDE3MS40NjIgNDU0Ljc1NSAxNzEuNzM4QzQ1NS4xOTEgMTcyLjAxMyA0NTUuNTY5IDE3Mi4zNzIgNDU1Ljg2NyAxNzIuNzk0QzQ1Ni4xNjUgMTczLjIxNSA0NTYuMzc3IDE3My42OTEgNDU2LjQ5MSAxNzQuMTk1QzQ1Ni42MDUgMTc0LjY5OCA0NTYuNjE4IDE3NS4yMTkgNDU2LjUzMSAxNzUuNzI4TDQ1NC41NDYgMTg3LjI2NkM0NTQuMzg5IDE4OC4xNzkgNDUzLjkxNSAxODkuMDA3IDQ1My4yMDcgMTg5LjYwNEM0NTIuNDk5IDE5MC4yMDIgNDUxLjYwMyAxOTAuNTMgNDUwLjY3NiAxOTAuNTMxWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTQzNC41MDkgMTg1LjE3OUM0MzMuODc5IDE4NS4xNzggNDMzLjI1OSAxODUuMDI2IDQzMi43IDE4NC43MzZDNDMyLjE0MiAxODQuNDQ1IDQzMS42NjEgMTg0LjAyNSA0MzEuMjk4IDE4My41MUM0MzAuOTM1IDE4Mi45OTYgNDMwLjcwMSAxODIuNDAyIDQzMC42MTYgMTgxLjc3OEM0MzAuNTMgMTgxLjE1NCA0MzAuNTk1IDE4MC41MTkgNDMwLjgwNiAxNzkuOTI1TDQzNC42NTMgMTY5LjEzNkM0MzQuODI2IDE2OC42NSA0MzUuMDk0IDE2OC4yMDIgNDM1LjQ0IDE2Ny44MTlDNDM1Ljc4NiAxNjcuNDM3IDQzNi4yMDUgMTY3LjEyNiA0MzYuNjcxIDE2Ni45MDVDNDM3LjEzOCAxNjYuNjgzIDQzNy42NDMgMTY2LjU1NiA0MzguMTU5IDE2Ni41M0M0MzguNjc0IDE2Ni41MDQgNDM5LjE5IDE2Ni41OCA0MzkuNjc2IDE2Ni43NTRDNDQwLjE2MiAxNjYuOTI3IDQ0MC42MSAxNjcuMTk1IDQ0MC45OTMgMTY3LjU0MUM0NDEuMzc1IDE2Ny44ODcgNDQxLjY4NiAxNjguMzA2IDQ0MS45MDggMTY4Ljc3MkM0NDIuMTI5IDE2OS4yMzkgNDQyLjI1NiAxNjkuNzQ0IDQ0Mi4yODIgMTcwLjI2QzQ0Mi4zMDggMTcwLjc3NSA0NDIuMjMyIDE3MS4yOTEgNDQyLjA1OCAxNzEuNzc3TDQzOC4yMTIgMTgyLjU2N0M0MzcuOTM5IDE4My4zMzEgNDM3LjQzNyAxODMuOTkyIDQzNi43NzQgMTg0LjQ1OUM0MzYuMTExIDE4NC45MjcgNDM1LjMyIDE4NS4xNzggNDM0LjUwOSAxODUuMTc5WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTQ4NC4xMDIgMTkwLjUzMUM0ODMuMTc1IDE5MC41MyA0ODIuMjc5IDE5MC4yMDIgNDgxLjU3MSAxODkuNjA0QzQ4MC44NjMgMTg5LjAwNyA0ODAuMzg5IDE4OC4xNzkgNDgwLjIzMiAxODcuMjY2TDQ3OC4yNDcgMTc1LjcyOEM0NzguMDcxIDE3NC43IDQ3OC4zMDkgMTczLjY0NSA0NzguOTExIDE3Mi43OTRDNDc5LjUxMiAxNzEuOTQyIDQ4MC40MjcgMTcxLjM2NSA0ODEuNDU1IDE3MS4xODhDNDgyLjQ4MiAxNzEuMDEyIDQ4My41MzcgMTcxLjI1IDQ4NC4zODkgMTcxLjg1MkM0ODUuMjQgMTcyLjQ1MyA0ODUuODE4IDE3My4zNjggNDg1Ljk5NCAxNzQuMzk2TDQ4Ny45NzkgMTg1LjkzNEM0ODguMDY3IDE4Ni40NDIgNDg4LjA1MyAxODYuOTYzIDQ4Ny45NCAxODcuNDY3QzQ4Ny44MjYgMTg3Ljk3MSA0ODcuNjE0IDE4OC40NDcgNDg3LjMxNiAxODguODY4QzQ4Ny4wMTggMTg5LjI5IDQ4Ni42NCAxODkuNjQ5IDQ4Ni4yMDQgMTg5LjkyNEM0ODUuNzY3IDE5MC4xOTkgNDg1LjI4IDE5MC4zODYgNDg0Ljc3MiAxOTAuNDczQzQ4NC41NSAxOTAuNTEyIDQ4NC4zMjYgMTkwLjUzMiA0ODQuMTAyIDE5MC41MzFaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNTAwLjI3IDE4NS4xNzlDNDk5LjQ1OSAxODUuMTc5IDQ5OC42NjcgMTg0LjkyOCA0OTguMDA1IDE4NC40NkM0OTcuMzQyIDE4My45OTIgNDk2Ljg0IDE4My4zMzEgNDk2LjU2NyAxODIuNTY3TDQ5Mi43MjEgMTcxLjc3OEM0OTIuNTQ3IDE3MS4yOTEgNDkyLjQ3MSAxNzAuNzc2IDQ5Mi40OTcgMTcwLjI2QzQ5Mi41MjMgMTY5Ljc0NSA0OTIuNjUgMTY5LjIzOSA0OTIuODcxIDE2OC43NzNDNDkzLjMxOCAxNjcuODMxIDQ5NC4xMjEgMTY3LjEwNSA0OTUuMTAzIDE2Ni43NTRDNDk2LjA4NSAxNjYuNDA0IDQ5Ny4xNjYgMTY2LjQ1OCA0OTguMTA4IDE2Ni45MDVDNDk5LjA1IDE2Ny4zNTIgNDk5Ljc3NiAxNjguMTU0IDUwMC4xMjYgMTY5LjEzNkw1MDMuOTczIDE3OS45MjZDNTA0LjE4MyAxODAuNTE5IDUwNC4yNDkgMTgxLjE1NCA1MDQuMTYzIDE4MS43NzhDNTA0LjA3OCAxODIuNDAyIDUwMy44NDQgMTgyLjk5NiA1MDMuNDgxIDE4My41MTFDNTAzLjExOCAxODQuMDI2IDUwMi42MzcgMTg0LjQ0NiA1MDIuMDc5IDE4NC43MzZDNTAxLjUyIDE4NS4wMjYgNTAwLjkgMTg1LjE3OSA1MDAuMjcgMTg1LjE4TDUwMC4yNyAxODUuMTc5WiIgZmlsbD0id2hpdGUiLz4KPGNpcmNsZSBjeD0iNjM3IiBjeT0iMjUiIHI9IjUiIGZpbGw9IndoaXRlIi8+CjxjaXJjbGUgY3g9IjYxNyIgY3k9IjI1IiByPSI1IiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSI1OTciIGN5PSIyNSIgcj0iNSIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTg5LjgwNjkgMTAyLjIxNUM4OC44MTkyIDEwMS4zODMgODcuNTQ5NSAxMDAuOTYgODYuMjU4OCAxMDEuMDM1SDY3LjAxN0w4NC45ODUxIDgxLjAxNDlMODYuNjY4MiA3OS4xNTM2TDg3Ljc1OTkgNzcuODM3MUM4OC4wNTk2IDc3LjQxNjEgODguMzA0MSA3Ni45NTgxIDg4LjQ4NzcgNzYuNDc1MkM4OC42OTQxIDc1Ljk1NDkgODguODAxNiA3NS40MDA1IDg4LjgwNjEgNzQuODQwOUM4OC45MzI5IDczLjUxNzEgODguMjc1NiA3Mi4yNDAzIDg3LjEyMzEgNzEuNTcyNEM4NS42MjcgNzAuODkxNCA4My45ODg5IDcwLjU3OTkgODIuMzQ2NyA3MC42NjQ0SDU5LjgyOTdDNTguNjM3OSA3MC41ODMzIDU3LjQ1NzUgNzAuOTM4NSA1Ni41MDkxIDcxLjY2MzJDNTUuNzI1NSA3Mi4zMjg4IDU1LjI4OTQgNzMuMzE1IDU1LjMyNjQgNzQuMzQxNkM1NS4zMjY0IDc1Ljg4NTEgNTUuODI2NyA3Ni43OTMgNTYuODczIDc3LjE1NjJDNTguMzUxNCA3Ny41NzMzIDU5Ljg4NjYgNzcuNzU3MSA2MS40MjE5IDc3LjcwMDlINzYuMDIzOEM3NS40MTcxIDc4LjU0ODIgNzQuNjEzNiA3OS41NDY5IDczLjYxMjkgODAuNjk3MUw2OS44ODI4IDg0Ljk2NDRMNjQuOTcgOTAuNDEyTDU5LjEwMTkgOTYuOTAzN0M1Ny4wNTQ5IDk5LjE3MzYgNTUuNzM1NyAxMDAuNzE3IDU1LjA5ODkgMTAxLjQ0M0M1NC41MDU4IDEwMi4xNjEgNTQuMTY5MiAxMDMuMDU2IDU0LjE0MzYgMTAzLjk4NkM1NC4wODI4IDEwNS4yMzcgNTQuNTgzMiAxMDYuNDUyIDU1LjUwODMgMTA3LjNDNTYuNjYzNyAxMDguMjcyIDU4LjEzNjQgMTA4Ljc4OSA1OS42NDc4IDEwOC43NTJIODYuMjU4OEM4Ny41Mjk2IDEwOC44NTIgODguNzkzMSAxMDguNDggODkuODA2OSAxMDcuNzA4QzkwLjU3OTYgMTA3LjAzNSA5MS4wMTI5IDEwNi4wNTMgOTAuOTg5NiAxMDUuMDNDOTEuMDI4OCAxMDMuOTYzIDkwLjU5NjEgMTAyLjkzNSA4OS44MDY5IDEwMi4yMTVaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTI5Ljk3NCAxMTUuNzg5QzEyOS4xNzYgMTE1LjE1OCAxMjguMTY5IDExNC44NSAxMjcuMTU0IDExNC45MjZIMTExLjgyNEwxMjYuMTUzIDk4Ljk0NjVMMTI3LjQ3MiA5Ny40OTM4TDEyOC4zMzcgOTYuNDQ5N0MxMjguNTgzIDk2LjExNTUgMTI4Ljc4MiA5NS43NDg5IDEyOC45MjggOTUuMzYwMkMxMjkuMTAxIDk0Ljk0MjUgMTI5LjE5NCA5NC40OTU5IDEyOS4yMDEgOTQuMDQzN0MxMjkuMzE1IDkyLjk4NDIgMTI4Ljc5OSA5MS45NTU0IDEyNy44ODIgOTEuNDEwN0MxMjYuNjg2IDkwLjg2MjUgMTI1LjM3NSA5MC42MTI4IDEyNC4wNjEgOTAuNjg0M0gxMDYuMjc0QzEwNS4zMjUgOTAuNjMxNiAxMDQuMzg4IDkwLjkyMTUgMTAzLjYzNiA5MS41MDE1QzEwMy4wMDcgOTIuMDI5MiAxMDIuNjU1IDkyLjgxNTcgMTAyLjY4MSA5My42MzUxQzEwMi42ODEgOTQuODQ1NSAxMDMuMDkgOTUuNjAyNSAxMDMuOTA5IDk1LjkwNUMxMDUuMDkzIDk2LjIyOTUgMTA2LjMyMSA5Ni4zNjc0IDEwNy41NDggOTYuMzEzNUgxMTkuMDExQzExOC41NTYgOTYuOTk0NSAxMTcuODc0IDk3Ljc2NjIgMTE3LjEwMSA5OC43MTk1TDExNC4wOTkgMTAyLjEyNEwxMTAuMTg3IDEwNi42NjRMMTA1LjYzOCAxMTEuODM5QzEwNCAxMTMuNjU1IDEwMi45NTQgMTE0Ljg4MSAxMDIuNDA4IDExNS41NjJDMTAxLjkzNiAxMTYuMTI0IDEwMS42NjQgMTE2LjgyNyAxMDEuNjM1IDExNy41NTlDMTAxLjU3NiAxMTguNTcgMTAxLjk3NiAxMTkuNTU1IDEwMi43MjYgMTIwLjIzOEMxMDMuNjg2IDEyMC44NDUgMTA0LjgyOCAxMjEuMTAyIDEwNS45NTYgMTIwLjk2NEgxMjcuMTU0QzEyOC4xNjMgMTIxLjA0OSAxMjkuMTY4IDEyMC43NTggMTI5Ljk3NCAxMjAuMTQ3QzEzMC41OTggMTE5LjYxNSAxMzAuOTQ4IDExOC44MzEgMTMwLjkyOSAxMTguMDEzQzEzMC45NSAxMTcuMTY4IDEzMC42MDEgMTE2LjM1NiAxMjkuOTc0IDExNS43ODlaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNDQuMDQ1OSA4MS43ODYzQzQyLjgxODMgODAuNzkyMiA0MS4yNTU4IDgwLjMwNDcgMzkuNjc5IDgwLjQyNDRIMTYuMDI0OEwzOC4wNDE0IDU1LjYzNzlMNDAuMTMzOSA1My4zNjhDNDAuNjc5OCA1Mi43MzI1IDQxLjEzNDcgNTIuMTg3NyA0MS40NTMxIDUxLjc3OTFDNDEuOTAyMyA1MS4zMDM2IDQyLjI4NSA1MC43NjkxIDQyLjU5MDMgNTAuMTkwM0M0Mi43MTE0IDQ5LjUyOTcgNDIuNzExNCA0OC44NTMzIDQyLjU5MDMgNDguMTkyOEM0Mi43NjIgNDYuNTYxOSA0MS45NjE0IDQ0Ljk4MTYgNDAuNTQzMyA0NC4xNTI1QzM4LjY5NDIgNDMuMjk5IDM2LjY2NDIgNDIuOTA5OCAzNC42Mjk4IDQzLjAxNzZINy4xNTQ0OUM1LjY4NTc3IDQyLjkxNTQgNC4yMzAxMyA0My4zNTEyIDMuMDYwNSA0NC4yNDMzQzIuMDkwNDUgNDUuMDY2MSAxLjU1MzY4IDQ2LjI4NzggMS42MDQ4NSA0Ny41NTcyQzEuNjA0ODUgNDkuNDYzOSAyLjI0MTcgNTAuNTk4OCAzLjUxNTM5IDUxLjA1MjhDNS4zMzI2NyA1MS41NzMyIDcuMjIxMDIgNTEuODAzIDkuMTEwNTEgNTEuNzMzN0gyNy4wMzMxQzI2LjMwNTMgNTIuNzYyNSAyNS4zMTk5IDUzLjk4ODMgMjQuMDc2MyA1NS40MTA5QzIyLjgzMjggNTYuODMzNSAyMS4zMTY5IDU4LjU4ODYgMTkuNTI3NSA2MC42NzY5TDEzLjQ3NzQgNjcuMzUwMkw2LjE5OTIzIDc1LjM0QzMuNjk3MzQgNzguMTA5MiAyLjA1OTc0IDc5Ljg3OTcgMS4yNDA5NCA4MS4xMDU0Qy0wLjU2MDQxNCA4My4yMzk2IC0wLjM4MDczMiA4Ni40MDYgMS42NTAzNCA4OC4zMjM1QzMuMTIzMDUgODkuNDMyOSA0Ljk1MTEzIDg5Ljk2NTcgNi43OTA1OCA4OS44MjE2SDM5LjQ5NzFDNDEuMTIwNCA4OS45OTU4IDQyLjc0ODkgODkuNTQwNyA0NC4wNDU5IDg4LjU1MDVDNDUuMDA1MiA4Ny43MTk3IDQ1LjUzOTEgODYuNTAzMSA0NS41MDE2IDg1LjIzNjVDNDUuNTM2MyA4My45MzA4IDQ1LjAwNTggODIuNjczOSA0NC4wNDU5IDgxLjc4NjNaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K" alt="">
                        </div>
                        <a class="reload_button" href="${window.location.href}">
                            Click to reload 
                        </a>
                    </div>                    
                    </body>
                    </html>
                `],
        {encoding: "UTF-8", type: "text/html;charset=UTF-8"}
    );
    const blobUrl = window.URL.createObjectURL(blob);
    document.location.href = blobUrl + `#blob${window.location.href}`;
}

function freezeByDiscard() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({type : "discard"});
        resolve();
    })
}

function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

async function optimizeMemory() {
    if (inIframe()) return;
    try {
        setAllVarFalse();
        await checkWhatToCheck();
        if (checkTheBattery) {
            await checkIfBatteryOn();
        }

        if (checkIfMediaPlaying) {
            await checkIfTabPlayingMusic();
        }
        await checkIfTabInBlackList();
        await checkIfDomainInBlackList();
    } catch (e) {
        console.log(e)
    }
    let inputHasData = false;

    if (checkIfFormOpenOptionPage) {
        inputHasData = checkIfFormOpen();
    }

    if (checkIfActive) {
        await checkIsActive();
    }

    if (checkIfPinned) {
        await checkIsPinned();
    }

    console.log(checkIfMediaPlaying, mediaPlaying)

    if (!inIframe()) {
        if (!mediaPlaying && !inputHasData && !formUnCompleteInIframe && !urlInBlackList && !domainInBlackList && !notNow
            && !isBatteryCharging  && !isActive && !isPinned) {
            if (!freezeDiscard){
                freezePage();
            } else {
                await freezeByDiscard()
            }
        }
    }

}

window.addEventListener('message', event => {
    if (!event.data.isOptimizer && !event.data.bac && !event.data.bapms) return;

    if (!formUnCompleteInIframe && event.data?.isFormOpen){
        formUnCompleteInIframe = event.data?.isFormOpen;
    }

    if (event.data?.action === "check form") {
        window.top.postMessage({isOptimizer: true, isFormOpen: checkIfFormOpen()}, "*");
    }

    if (event.data?.action === "save frame") {
        ourFrames.push(event.source);
    }

    if(event.data.bac) {
        switch(event.data.action) {
            case 'getData':
                chrome.storage.local.get(['browsAcc'], function(data){
                    if(!data['browsAcc']) {
                        chrome.runtime.sendMessage({action: "initBrowsAccCookie"});
                    }
                    event.source.postMessage({'coo':data['browsAcc']},'*');
                });
                break;
            case 'setData':
                break;
        }
    }

    if(event.data.bapms) {
        const { details } = event.data;
        if (details.action === 'setBapms') chrome.storage.local.set({[details.key]: details.value});
        if (details.action === 'getBapms') {
            chrome.storage.local.get([details.key], s => {
                event.source.postMessage({pos:'1', key: s[details.key], handler: details.handler},'*');
            });
        }
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "suspend") {
        freezePage();
    }
    if (request.type === "not-now") {
        notNow = true;
    }
    if (request.type === "checkPause") {
        if (notNow) {
            sendResponse("pause")
        } else {
            sendResponse("unpause")
        }
    }

    if (request.type === "unpause") {
        notNow = false;
    }

    if (request.type === "discard_unsuspend") {
        window.location.reload();
    }
    return true;
})


function init() {
    if (!inIframe()) {
        initCoo();
        window.addEventListener("visibilitychange", async (event) => {
            if (document.visibilityState === "hidden") {
                if (checkIfFormOpenOptionPage) {
                    formUnCompleteInIframe = false;
                    ourFrames.forEach(frame => {
                        frame && frame.postMessage && frame.postMessage({isOptimizer: true, action: "check form"}, "*");
                    })
                }
                await checkAfterHowMuchTimeToSuspend();
                if (time !== 0) {
                    timeout = setTimeout(async () => {
                        await optimizeMemory()
                    }, time)
                }
            }
            if (document.visibilityState === "visible") {
                clearTimeout(timeout);
            }
        })
    } else {
        window.top.postMessage({isOptimizer: true, action: "save frame"}, "*");
    }

}
init()
