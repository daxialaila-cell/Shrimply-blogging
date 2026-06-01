const coverColor = () => {
    const pageColor = PAGE_CONFIG.color;
    if (pageColor) {
        setThemeColors(pageColor);
    } else {
        const path = document.getElementById("post-cover")?.src;
        path ? handleApiColor(path) : setDefaultThemeColors();
    }
}

const handleApiColor = (path) => {
    const cacheGroup = JSON.parse(localStorage.getItem('Shrimply')) || { postcolor: {} };
    const color = cacheGroup.postcolor[path]?.value;
    if (color) {
        setThemeColors(color);
    } else {
        img2color(path);
    }
}

const img2color = (src) => {
    fetch(`${src}?imageAve`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(({ RGB }) => {
            const formattedRGB = `#${RGB.slice(2)}`;
            setThemeColors(formattedRGB);
            cacheColor(src, formattedRGB);
        })
        .catch(error => console.error('Error fetching color:', error));
}

const setThemeColors = (value) => {
    if (!value) return setDefaultThemeColors();
    const [r, g, b] = value.match(/\w\w/g).map(x => parseInt(x, 16));
    const themeColors = {
        main: value,
        op: `${value}23`,
        opDeep: `${value}dd`,
        none: `${value}00`
    };
    Object.entries(themeColors).forEach(([key, color]) => {
        document.documentElement.style.setProperty(`--sb-${key}`, color);
    });
    adjustBrightness(r, g, b);
    document.getElementById("coverdiv").classList.add("loaded");
    initThemeColor();
}

const setDefaultThemeColors = () => {
    const vars = ['--sb-theme', '--sb-theme-op', '--sb-theme-op-deep', '--sb-theme-none'];
    vars.forEach((varName, i) => {
        document.documentElement.style.setProperty(['--sb-main', '--sb-main-op', '--sb-main-op-deep', '--sb-main-none'][i], `var(${varName})`);
    });
    initThemeColor();
}

const cacheColor = (src, color) => {
    const cacheGroup = JSON.parse(localStorage.getItem('Shrimply')) || { postcolor: {} };
    cacheGroup.postcolor[src] = { value: color, expiration: Date.now() + coverColorConfig.time };
    localStorage.setItem('Shrimply', JSON.stringify(cacheGroup));
}

const adjustBrightness = (r, g, b) => {
    const brightness = Math.round(((r * 299) + (g * 587) + (b * 114)) / 1000);
    if (brightness < 125) {
        document.querySelectorAll('.card-content').forEach(item => {
            item.style.setProperty('--sb-card-bg', 'var(--sb-white)');
        });
        document.querySelectorAll('.sayhi').forEach(item => {
            item.style.setProperty('background', 'var(--sb-white-op)');
            item.style.setProperty('color', 'var(--sb-white)');
        });
    }
}
