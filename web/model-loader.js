// GLB/GLTF 模型加载器
export class ModelLoader {
    constructor(THREE) {
        this.THREE = THREE;
        this.loader = null;
    }

    async loadGLTFLoader() {
        // 动态加载 GLTFLoader
        if (this.loader) return this.loader;
        
        return new Promise((resolve, reject) => {
            // 检查是否已经加载
            if (window.THREE && window.THREE.GLTFLoader) {
                this.loader = new window.THREE.GLTFLoader();
                resolve(this.loader);
                return;
            }
            
            const script = document.createElement('script');
            script.src = new URL('./lib/GLTFLoader.js', import.meta.url).href;
            script.onload = () => {
                if (window.THREE && window.THREE.GLTFLoader) {
                    this.loader = new window.THREE.GLTFLoader();
                    resolve(this.loader);
                } else {
                    reject(new Error('GLTFLoader not found after loading script'));
                }
            };
            script.onerror = () => reject(new Error('Failed to load GLTFLoader script'));
            document.head.appendChild(script);
        });
    }

    async loadModel(url) {
        const loader = await this.loadGLTFLoader();
        return new Promise((resolve, reject) => {
            loader.load(
                url,
                (gltf) => resolve(gltf.scene),
                undefined,
                reject
            );
        });
    }

    // 创建程序化的简单人物模型（备用方案）
    createSimpleHumanoid(THREE) {
        const group = new THREE.Group();
        
        // 材质
        const frontMat = new THREE.MeshPhongMaterial({ color: 0x4A90D9 });
        const backMat = new THREE.MeshPhongMaterial({ color: 0x2D5A8A });
        
        // 头部
        const head = new THREE.Mesh(new THREE.SphereGeometry(8, 16, 16), frontMat);
        head.position.y = 28;
        group.add(head);
        
        // 颈部
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 4, 8), frontMat);
        neck.position.y = 22;
        group.add(neck);
        
        // 躯干
        const torso = new THREE.Mesh(new THREE.BoxGeometry(14, 20, 8), frontMat);
        torso.position.y = 10;
        group.add(torso);
        
        // 臀部
        const hips = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 7), frontMat);
        hips.position.y = -2;
        group.add(hips);
        
        // 左臂
        const leftShoulder = new THREE.Mesh(new THREE.SphereGeometry(3, 8, 8), frontMat);
        leftShoulder.position.set(-8.5, 17, 0);
        group.add(leftShoulder);
        
        const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2, 10, 8), frontMat);
        leftUpperArm.position.set(-8.5, 10, 0);
        group.add(leftUpperArm);
        
        const leftElbow = new THREE.Mesh(new THREE.SphereGeometry(2.5, 8, 8), frontMat);
        leftElbow.position.set(-8.5, 5, 0);
        group.add(leftElbow);
        
        const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(2, 1.5, 9, 8), frontMat);
        leftForearm.position.set(-8.5, 0, 0);
        group.add(leftForearm);
        
        const leftHand = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 8), frontMat);
        leftHand.position.set(-8.5, -4.5, 0);
        group.add(leftHand);
        
        // 右臂（镜像）
        const rightShoulder = new THREE.Mesh(new THREE.SphereGeometry(3, 8, 8), frontMat);
        rightShoulder.position.set(8.5, 17, 0);
        group.add(rightShoulder);
        
        const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2, 10, 8), frontMat);
        rightUpperArm.position.set(8.5, 10, 0);
        group.add(rightUpperArm);
        
        const rightElbow = new THREE.Mesh(new THREE.SphereGeometry(2.5, 8, 8), frontMat);
        rightElbow.position.set(8.5, 5, 0);
        group.add(rightElbow);
        
        const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(2, 1.5, 9, 8), frontMat);
        rightForearm.position.set(8.5, 0, 0);
        group.add(rightForearm);
        
        const rightHand = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 8), frontMat);
        rightHand.position.set(8.5, -4.5, 0);
        group.add(rightHand);
        
        // 左腿
        const leftHip = new THREE.Mesh(new THREE.SphereGeometry(3, 8, 8), frontMat);
        leftHip.position.set(-4, -5, 0);
        group.add(leftHip);
        
        const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(3, 2.5, 12, 8), frontMat);
        leftThigh.position.set(-4, -12, 0);
        group.add(leftThigh);
        
        const leftKnee = new THREE.Mesh(new THREE.SphereGeometry(2.5, 8, 8), frontMat);
        leftKnee.position.set(-4, -18, 0);
        group.add(leftKnee);
        
        const leftShin = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2, 12, 8), frontMat);
        leftShin.position.set(-4, -25, 0);
        group.add(leftShin);
        
        const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 5), frontMat);
        leftFoot.position.set(-4, -32, 1);
        group.add(leftFoot);
        
        // 右腿（镜像）
        const rightHip = new THREE.Mesh(new THREE.SphereGeometry(3, 8, 8), frontMat);
        rightHip.position.set(4, -5, 0);
        group.add(rightHip);
        
        const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(3, 2.5, 12, 8), frontMat);
        rightThigh.position.set(4, -12, 0);
        group.add(rightThigh);
        
        const rightKnee = new THREE.Mesh(new THREE.SphereGeometry(2.5, 8, 8), frontMat);
        rightKnee.position.set(4, -18, 0);
        group.add(rightKnee);
        
        const rightShin = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2, 12, 8), frontMat);
        rightShin.position.set(4, -25, 0);
        group.add(rightShin);
        
        const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 5), frontMat);
        rightFoot.position.set(4, -32, 1);
        group.add(rightFoot);
        
        // 添加正面标记
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('F', 64, 64);
        
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas) }));
        sprite.position.set(0, 10, 10);
        sprite.scale.set(15, 15, 1);
        group.add(sprite);
        
        // 添加背面标记
        const canvasBack = document.createElement('canvas');
        canvasBack.width = canvasBack.height = 128;
        const ctxBack = canvasBack.getContext('2d');
        ctxBack.fillStyle = '#888';
        ctxBack.font = 'bold 80px Arial';
        ctxBack.textAlign = 'center';
        ctxBack.textBaseline = 'middle';
        ctxBack.fillText('B', 64, 64);
        
        const spriteBack = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvasBack) }));
        spriteBack.position.set(0, 10, -10);
        spriteBack.scale.set(15, 15, 1);
        group.add(spriteBack);
        
        // 调整整体位置，使脚部在原点
        group.position.y = 33;
        
        return group;
    }
}