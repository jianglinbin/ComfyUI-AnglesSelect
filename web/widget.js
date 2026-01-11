import { loadThreeJS } from './three-loader.js';
import { AZIMUTH_MAP, ELEVATION_MAP, DISTANCE_MAP, AZIMUTHS, ELEVATIONS } from './constants.js';
import { ModelLoader } from './model-loader.js';
import { t } from './i18n.js';

// 模型位置偏移配置
const MODEL_OFFSET = {
    x: 0,    // 左右偏移：负数向左，正数向右
    y: -40,    // 垂直偏移：负数向下，正数向上
    z: -40,  // 前后偏移：负数向前，正数向后
    scale: 1 // 大小缩放：1为默认大小，大于1放大，小于1缩小
};

export class AnglesSelector3DWidget {
    constructor(node, container) {
        this.node = node;
        this.container = container;
        this.selectedPoints = [];
        this.pointMeshes = [];
        this.gridLines = { 0: [], 1: [], 2: [] };  // 按距离层分组的网格线
        this.layerVisible = { 0: true, 1: true, 2: true };  // 层可见性
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.THREE = null;
        this.animationId = null;
        this.spherical = null;
        this.raycaster = null;
        this.mouse = null;
    }

    async init() {
        try {
            this.THREE = await loadThreeJS();
            if (!this.THREE) return;
            
            this.raycaster = new this.THREE.Raycaster();
            this.raycaster.params.Sphere = { threshold: 8 };
            this.mouse = new this.THREE.Vector2();
            
            this.setupScene();
            await this.createFigure();
            this.createGridSpheres();
            this.createPoints();
            this.setupControls();
            this.setupRaycaster();
            this.animate();
            this.setupResizeObserver();
        } catch (e) {
            console.error("AnglesSelector3D: Init error", e);
        }
    }

    setupResizeObserver() {
        const cc = this.container.querySelector('.canvas-container');
        if (!cc) return;
        
        // 使用 ResizeObserver 监听容器大小变化
        const ro = new ResizeObserver(() => this.handleResize());
        ro.observe(cc);
        ro.observe(this.container);
        
        // 定期检查大小变化（备用方案）
        this.resizeInterval = setInterval(() => this.handleResize(), 500);
    }

    handleResize() {
        if (!this.renderer || !this.camera) return;
        const cc = this.container.querySelector('.canvas-container');
        if (!cc) return;
        const w = cc.clientWidth || 400;
        const h = cc.clientHeight || 320;
        
        // 只在尺寸真正变化时更新
        if (this.lastWidth === w && this.lastHeight === h) return;
        this.lastWidth = w;
        this.lastHeight = h;
        
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    setupScene() {
        const THREE = this.THREE;
        const cc = this.container.querySelector('.canvas-container');
        const w = cc?.clientWidth || 400, h = cc?.clientHeight || 320;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
        this.camera.position.set(0, 150, 350);  // 正面视角：X=0(居中), Y=150(略高), Z=350(前方)
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        if (cc) cc.appendChild(this.renderer.domElement);

        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const dl = new THREE.DirectionalLight(0xffffff, 0.8);
        dl.position.set(100, 100, 100);
        this.scene.add(dl);
        
        this.spherical = new THREE.Spherical();
        this.spherical.setFromVector3(this.camera.position);
    }

    async createFigure() {
        const THREE = this.THREE;
        const modelLoader = new ModelLoader(THREE);
        
        // 尝试加载 GLB 模型
        const modelPath = new URL('./models/toon_cat_free.glb', import.meta.url).href;
        try {
            const model = await modelLoader.loadModel(modelPath);
            
            // 调整模型大小和位置
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            
            // 缩放到合适大小（约120单位高，原来的3倍），并应用自定义缩放
            const scale = (120 / size.y) * MODEL_OFFSET.scale;
            model.scale.set(scale, scale, scale);
            
            // 应用偏移量（在文件头配置）
            model.position.set(
                -center.x * scale + MODEL_OFFSET.x,
                -center.y * scale + MODEL_OFFSET.y,
                -center.z * scale + MODEL_OFFSET.z
            );
            
            console.log('Model bounds:', { size, center, scale, position: model.position });
            
            this.scene.add(model);
            console.log('GLB model loaded successfully');
        } catch (error) {
            console.warn('Failed to load GLB model, using fallback:', error);
            // 加载失败时使用备用方案
            const figure = modelLoader.createSimpleHumanoid(THREE);
            this.scene.add(figure);
        }
    }

    createGridSpheres() {
        const THREE = this.THREE;
        let di = 0;
        for (const { radius, color } of Object.values(DISTANCE_MAP)) {
            for (const elev of ELEVATIONS) {
                const er = (elev * Math.PI) / 180;
                const rr = radius * Math.cos(er), y = radius * Math.sin(er);
                const curve = new THREE.EllipseCurve(0, 0, rr, rr, 0, 2 * Math.PI, false, 0);
                const pts = curve.getPoints(64).map(p => new THREE.Vector3(p.x, y, p.y));
                const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.3 }));
                line.userData.distanceLayer = di;
                this.scene.add(line);
                this.gridLines[di].push(line);
            }
            for (const azim of AZIMUTHS) {
                const ar = (azim * Math.PI) / 180, pts = [];
                for (let e = -90; e <= 90; e += 5) {
                    const er = (e * Math.PI) / 180;
                    pts.push(new THREE.Vector3(radius * Math.cos(er) * Math.sin(ar), radius * Math.sin(er), radius * Math.cos(er) * Math.cos(ar)));
                }
                const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.3 }));
                line.userData.distanceLayer = di;
                this.scene.add(line);
                this.gridLines[di].push(line);
            }
            di++;
        }
        
        // 在最外层添加方位标签
        this.createViewLabels();
    }

    createViewLabels() {
        const THREE = this.THREE;
        const outerRadius = DISTANCE_MAP[2].radius + 30; // 最外层半径 + 偏移
        
        const labels = [
            { text: t('front'), azim: 0, color: '#FF0000' },
            { text: t('right'), azim: 90, color: '#00FF00' },
            { text: t('back'), azim: 180, color: '#0088FF' },
            { text: t('left'), azim: 270, color: '#FFFF00' },
            { text: t('frontRight'), azim: 45, color: '#FF8800' },
            { text: t('backRight'), azim: 135, color: '#00FFAA' },
            { text: t('backLeft'), azim: 225, color: '#00DDFF' },
            { text: t('frontLeft'), azim: 315, color: '#FF00FF' }
        ];
        
        for (const label of labels) {
            const ar = (label.azim * Math.PI) / 180;
            const x = outerRadius * Math.sin(ar);
            const z = outerRadius * Math.cos(ar);
            
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = label.color;
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label.text, 64, 32);
            
            const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ 
                map: new THREE.CanvasTexture(canvas),
                transparent: true
            }));
            sprite.position.set(x, 0, z);
            sprite.scale.set(30, 15, 1);
            this.scene.add(sprite);
        }
        
        // 添加上下标签
        const verticalLabels = [
            { text: t('top'), y: outerRadius, color: '#00FFFF' },
            { text: t('bottom'), y: -outerRadius, color: '#FF66FF' }
        ];
        
        for (const label of verticalLabels) {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = label.color;
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label.text, 64, 32);
            
            const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ 
                map: new THREE.CanvasTexture(canvas),
                transparent: true
            }));
            sprite.position.set(0, label.y, 0);
            sprite.scale.set(30, 15, 1);
            this.scene.add(sprite);
        }
    }

    createPoints() {
        const THREE = this.THREE;
        this.pointMeshes = [];
        let di = 0;
        for (const { radius, color } of Object.values(DISTANCE_MAP)) {
            for (const azim of AZIMUTHS) {
                for (const elev of ELEVATIONS) {
                    const ar = (azim * Math.PI) / 180, er = (elev * Math.PI) / 180;
                    const m = new THREE.Mesh(new THREE.SphereGeometry(7, 16, 16), new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.7, emissive: color, emissiveIntensity: 0.2 }));
                    m.position.set(radius * Math.cos(er) * Math.sin(ar), radius * Math.sin(er), radius * Math.cos(er) * Math.cos(ar));
                    m.userData = { azimuth: azim, elevation: elev, distance: di, baseColor: color, selected: false };
                    this.scene.add(m);
                    this.pointMeshes.push(m);
                }
            }
            di++;
        }
    }

    toggleLayerVisibility(layerIndex) {
        this.layerVisible[layerIndex] = !this.layerVisible[layerIndex];
        const visible = this.layerVisible[layerIndex];
        
        // 切换网格线可见性
        for (const line of this.gridLines[layerIndex]) {
            line.visible = visible;
        }
        
        // 切换点可见性
        for (const m of this.pointMeshes) {
            if (m.userData.distance === layerIndex) {
                m.visible = visible;
            }
        }
        
        return visible;
    }

    setupControls() {
        let drag = false, prev = { x: 0, y: 0 };
        const cv = this.renderer.domElement;
        cv.addEventListener('mousedown', e => { if (e.button === 0) { drag = true; prev = { x: e.clientX, y: e.clientY }; } });
        cv.addEventListener('mousemove', e => {
            if (!drag) return;
            this.spherical.theta -= (e.clientX - prev.x) * 0.01;
            this.spherical.phi -= (e.clientY - prev.y) * 0.01;
            this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi));
            this.camera.position.setFromSpherical(this.spherical);
            this.camera.lookAt(0, 0, 0);
            prev = { x: e.clientX, y: e.clientY };
        });
        cv.addEventListener('mouseup', () => drag = false);
        cv.addEventListener('mouseleave', () => drag = false);
        cv.addEventListener('wheel', e => {
            e.preventDefault();
            this.spherical.radius = Math.max(150, Math.min(600, this.spherical.radius + e.deltaY * 0.5));
            this.camera.position.setFromSpherical(this.spherical);
            this.camera.lookAt(0, 0, 0);
        }, { passive: false });
        cv.addEventListener('dblclick', () => {
            this.spherical.set(350, Math.PI / 3, 0);  // 双击重置到正面视角
            this.camera.position.setFromSpherical(this.spherical);
            this.camera.lookAt(0, 0, 0);
        });
    }

    setupRaycaster() {
        const cv = this.renderer.domElement;
        let hovered = null;
        cv.addEventListener('mousemove', e => {
            const r = cv.getBoundingClientRect();
            this.mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
            this.mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.camera);
            // 只检测可见的点
            const visiblePoints = this.pointMeshes.filter(m => m.visible);
            const hits = this.raycaster.intersectObjects(visiblePoints);
            if (hovered && !hovered.userData.selected) { hovered.scale.set(1, 1, 1); hovered.material.opacity = 0.7; hovered.material.emissiveIntensity = 0.2; }
            if (hits.length > 0) {
                hovered = hits[0].object;
                if (!hovered.userData.selected) { hovered.scale.set(1.3, 1.3, 1.3); hovered.material.opacity = 1; hovered.material.emissiveIntensity = 0.5; }
                cv.style.cursor = 'pointer';
            } else { hovered = null; cv.style.cursor = 'grab'; }
        });
        cv.addEventListener('click', e => {
            const r = cv.getBoundingClientRect();
            this.mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
            this.mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const visiblePoints = this.pointMeshes.filter(m => m.visible);
            const hits = this.raycaster.intersectObjects(visiblePoints);
            if (hits.length > 0) this.togglePoint(hits[0].object);
        });
    }

    togglePoint(mesh) {
        const ud = mesh.userData;
        if (ud.selected) {
            ud.selected = false;
            mesh.material.color.setHex(ud.baseColor);
            mesh.material.emissive.setHex(ud.baseColor);
            mesh.material.opacity = 0.7;
            mesh.material.emissiveIntensity = 0.2;
            mesh.scale.set(1, 1, 1);
            this.selectedPoints = this.selectedPoints.filter(p => !(p.azimuth === ud.azimuth && p.elevation === ud.elevation && p.distance === ud.distance));
        } else {
            ud.selected = true;
            mesh.material.color.setHex(0xFFFFFF);
            mesh.material.emissive.setHex(0xFFFFFF);
            mesh.material.opacity = 1;
            mesh.material.emissiveIntensity = 0.5;
            mesh.scale.set(1.3, 1.3, 1.3);
            this.selectedPoints.push({ azimuth: ud.azimuth, elevation: ud.elevation, distance: ud.distance });
        }
        this.updateNodeValue();
        this.updateSelectionDisplay();
    }

    updateNodeValue() {
        // 查找 selected_points widget 并更新值
        const w = this.node.widgets?.find(w => w.name === "selected_points");
        if (w) {
            w.value = JSON.stringify(this.selectedPoints);
            console.log('Updated selected_points:', w.value);
        } else {
            console.warn('selected_points widget not found');
        }
    }

    updateSelectionDisplay() {
        const d = this.container.querySelector('.selection-display');
        if (!d) return;
        if (this.selectedPoints.length === 0) {
            d.innerHTML = `<div class="no-selection">${t('noSelection')}</div>`;
            return;
        }
        let h = `<div class="selection-count">${t('selectedCount', { n: this.selectedPoints.length })}</div><div class="selection-list">`;
        for (const p of this.selectedPoints) {
            const c = DISTANCE_MAP[p.distance].color.toString(16).padStart(6, '0');
            h += `<div class="selection-item" style="border-left:3px solid #${c}"><span>${AZIMUTH_MAP[p.azimuth]}, ${ELEVATION_MAP[p.elevation]}, ${DISTANCE_MAP[p.distance].name}</span><button class="remove-btn" data-a="${p.azimuth}" data-e="${p.elevation}" data-d="${p.distance}">×</button></div>`;
        }
        d.innerHTML = h + '</div>';
        d.querySelectorAll('.remove-btn').forEach(b => {
            b.onclick = e => {
                const m = this.pointMeshes.find(m => m.userData.azimuth === +e.target.dataset.a && m.userData.elevation === +e.target.dataset.e && m.userData.distance === +e.target.dataset.d);
                if (m) this.togglePoint(m);
            };
        });
    }

    clearAll() {
        for (const m of this.pointMeshes) {
            if (m.userData.selected) {
                m.userData.selected = false;
                m.material.color.setHex(m.userData.baseColor);
                m.material.emissive.setHex(m.userData.baseColor);
                m.material.opacity = 0.7;
                m.material.emissiveIntensity = 0.2;
                m.scale.set(1, 1, 1);
            }
        }
        this.selectedPoints = [];
        this.updateNodeValue();
        this.updateSelectionDisplay();
    }

    selectLayer(di) {
        if (!this.layerVisible[di]) return; // 隐藏的层不能全选
        for (const m of this.pointMeshes) if (m.userData.distance === di && !m.userData.selected) this.togglePoint(m);
    }

    animate() {
        if (!this.renderer) return;
        this.animationId = requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.resizeInterval) clearInterval(this.resizeInterval);
        if (this.renderer) { this.renderer.dispose(); this.renderer.domElement?.remove(); }
    }
}
