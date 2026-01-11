// 国际化模块 - 根据系统语言显示中英文

const translations = {
    zh: {
        noSelection: '未选择任何角度 (点击球面上的点进行选择)',
        selectedCount: '已选择: {n} 个角度',
        clearAll: '清除全部',
        selectAllCloseUp: '全选近景',
        selectAllMedium: '全选中景',
        selectAllWide: '全选远景',
        closeUp: '近景',
        medium: '中景',
        wide: '远景',
        top: '上',
        bottom: '下',
        front: '前',
        back: '后',
        left: '左',
        right: '右',
        frontRight: '右前',
        backRight: '右后',
        backLeft: '左后',
        frontLeft: '左前'
    },
    en: {
        noSelection: 'No angles selected (click points on sphere)',
        selectedCount: 'Selected: {n} angles',
        clearAll: 'Clear All',
        selectAllCloseUp: 'Select All close-up',
        selectAllMedium: 'Select All medium',
        selectAllWide: 'Select All wide',
        closeUp: 'close-up',
        medium: 'medium',
        wide: 'wide',
        top: 'TOP',
        bottom: 'BOTTOM',
        front: 'FRONT',
        back: 'BACK',
        left: 'LEFT',
        right: 'RIGHT',
        frontRight: 'FR',
        backRight: 'BR',
        backLeft: 'BL',
        frontLeft: 'FL'
    }
};

// 检测系统语言，中文返回 'zh'，其他返回 'en'
function detectLanguage() {
    const lang = navigator.language || navigator.userLanguage || 'en';
    return lang.startsWith('zh') ? 'zh' : 'en';
}

const currentLang = detectLanguage();

// 翻译函数
export function t(key, params = {}) {
    let text = translations[currentLang][key] || translations['en'][key] || key;
    // 替换参数，如 {n}
    for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, v);
    }
    return text;
}

// 获取当前语言
export function getLang() {
    return currentLang;
}
