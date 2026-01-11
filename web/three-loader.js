let threeLoaded = false;
let threeLoadPromise = null;

export async function loadThreeJS() {
    if (window.THREE && threeLoaded) return window.THREE;
    if (threeLoadPromise) return threeLoadPromise;
    
    threeLoadPromise = new Promise((resolve, reject) => {
        if (window.THREE) {
            threeLoaded = true;
            resolve(window.THREE);
            return;
        }
        const script = document.createElement('script');
        script.src = new URL('./lib/three.min.js', import.meta.url).href;
        script.onload = () => { threeLoaded = true; resolve(window.THREE); };
        script.onerror = reject;
        document.head.appendChild(script);
    });
    return threeLoadPromise;
}