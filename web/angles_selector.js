import { app } from "../../scripts/app.js";
import { AnglesSelector3DWidget } from './widget.js';
import { t } from './i18n.js';

const STYLES = `
    .angles-selector-container { font-family: Arial, sans-serif; color: #fff; padding: 5px; height: 100%; display: flex; flex-direction: column; }
    .angles-selector-container canvas { border-radius: 8px; display: block; width: 100% !important; height: 100% !important; }
    .canvas-container { width: 100%; flex: 1; min-height: 200px; }
    .selection-display { margin-top: 8px; max-height: 100px; overflow-y: auto; font-size: 11px; }
    .selection-count { font-weight: bold; margin-bottom: 4px; color: #4ECDC4; }
    .selection-list { max-height: 80px; overflow-y: auto; }
    .selection-item { display: flex; justify-content: space-between; align-items: center; padding: 3px 6px; margin: 2px 0; background: rgba(255,255,255,0.1); border-radius: 3px; font-size: 10px; }
    .remove-btn { background: none; border: none; color: #ff6b6b; cursor: pointer; font-size: 14px; padding: 0 4px; }
    .remove-btn:hover { color: #ff4444; }
    .no-selection { color: #888; font-style: italic; font-size: 11px; }
    .control-buttons { display: flex; gap: 4px; margin-top: 8px; flex-wrap: wrap; }
    .control-btn { padding: 4px 8px; border: none; border-radius: 3px; cursor: pointer; font-size: 10px; color: #fff; }
    .control-btn:hover { opacity: 0.8; }
    .control-btn.clear { background: #ff6b6b; }
    .control-btn.close-up { background: #FF6B6B; }
    .control-btn.medium { background: #FFD93D; color: #333; }
    .control-btn.wide { background: #6BCB77; }
    .bottom-controls { display: flex; gap: 8px; margin-top: 8px; align-items: center; flex-wrap: wrap; }
    .legend { display: flex; gap: 8px; font-size: 10px; align-items: center; }
    .legend-item { display: inline-flex; align-items: center; gap: 4px; cursor: pointer; padding: 2px 6px; border-radius: 3px; }
    .legend-item:hover { background: rgba(255,255,255,0.1); }
    .legend-item.layer-hidden { opacity: 0.4; }
    .legend-item.layer-hidden span:last-child { text-decoration: line-through; }
    .legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
`;

function getTemplate() {
    return `
    <style>${STYLES}</style>
    <div class="canvas-container"></div>
    <div class="selection-display"><div class="no-selection">${t('noSelection')}</div></div>
    <div class="control-buttons">
        <button class="control-btn clear">${t('clearAll')}</button>
        <button class="control-btn close-up">${t('selectAllCloseUp')}</button>
        <button class="control-btn medium">${t('selectAllMedium')}</button>
        <button class="control-btn wide">${t('selectAllWide')}</button>
    </div>
    <div class="legend">
        <div class="legend-item" data-layer="0"><span class="legend-dot" style="background:#FF6B6B"></span><span>${t('closeUp')}</span></div>
        <div class="legend-item" data-layer="1"><span class="legend-dot" style="background:#FFD93D"></span><span>${t('medium')}</span></div>
        <div class="legend-item" data-layer="2"><span class="legend-dot" style="background:#6BCB77"></span><span>${t('wide')}</span></div>
    </div>
`;
}

app.registerExtension({
    name: "Comfy.AnglesSelector3D",
    
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name !== "AnglesSelector3D") return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = async function() {
            if (onNodeCreated) onNodeCreated.apply(this, arguments);
            
            this.selector3D = null;
            this.size = [420, 520];
            
            const container = document.createElement('div');
            container.className = 'angles-selector-container';
            container.innerHTML = getTemplate();

            this.addDOMWidget("selector3d", "custom", container, { serialize: false, hideOnZoom: false });

            this.selector3D = new AnglesSelector3DWidget(this, container);
            await this.selector3D.init();

            // 隐藏 selected_points 文本输入框（但保留其功能）
            const selectedPointsWidget = this.widgets?.find(w => w.name === "selected_points");
            if (selectedPointsWidget) {
                selectedPointsWidget.computeSize = () => [0, 0];
                selectedPointsWidget.type = "converted-widget";
                selectedPointsWidget.hidden = true;
                if (selectedPointsWidget.inputEl) {
                    selectedPointsWidget.inputEl.style.display = 'none';
                }
            }

            container.querySelector('.control-btn.clear').onclick = () => this.selector3D.clearAll();
            container.querySelector('.control-btn.close-up').onclick = () => this.selector3D.selectLayer(0);
            container.querySelector('.control-btn.medium').onclick = () => this.selector3D.selectLayer(1);
            container.querySelector('.control-btn.wide').onclick = () => this.selector3D.selectLayer(2);

            // 图例点击切换层可见性
            container.querySelectorAll('.legend-item').forEach(item => {
                item.onclick = (e) => {
                    e.stopPropagation();
                    const layer = parseInt(item.dataset.layer);
                    const visible = this.selector3D.toggleLayerVisibility(layer);
                    item.classList.toggle('layer-hidden', !visible);
                };
            });
        };

        const onRemoved = nodeType.prototype.onRemoved;
        nodeType.prototype.onRemoved = function() {
            if (onRemoved) onRemoved.apply(this, arguments);
            if (this.selector3D) this.selector3D.destroy();
        };
    }
});
