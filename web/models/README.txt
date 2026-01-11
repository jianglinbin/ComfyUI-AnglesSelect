如何使用自定义 GLB 人物模型
================================

1. 将你的 GLB 模型文件放在此目录，例如：human.glb

2. 推荐的模型规格：
   - 格式：GLB 或 GLTF
   - 面数：500-2000 三角面
   - 尺寸：建议高度 1-2 单位
   - 朝向：正面朝向 +Z 轴
   - 位置：脚部在原点 (0,0,0)

3. 修改 widget.js 中的 createFigure() 方法：
   取消注释 GLB 加载代码，并修改模型路径

4. 免费 GLB 人物模型资源：
   - Mixamo: https://www.mixamo.com/ (需要 Adobe 账号)
   - Sketchfab: https://sketchfab.com/3d-models?features=downloadable&sort_by=-likeCount
   - Poly Pizza: https://poly.pizza/
   - Quaternius: http://quaternius.com/

5. 当前使用的是程序化生成的简单人物模型（无需额外文件）
