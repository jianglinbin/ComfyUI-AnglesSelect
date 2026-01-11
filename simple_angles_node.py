import locale

class SimpleAnglesSelector:
    """
    Simple Angles Selector - Generate prompt from azimuth, elevation and distance parameters
    """
    
    AZIMUTH_MAP = {
        0: "front view",
        45: "front-right quarter view",
        90: "right side view",
        135: "back-right quarter view",
        180: "back view",
        225: "back-left quarter view",
        270: "left side view",
        315: "front-left quarter view"
    }
    
    ELEVATION_MAP = {
        -30: "low-angle shot",
        0: "eye-level shot",
        30: "elevated shot",
        60: "high-angle shot"
    }
    
    DISTANCE_MAP = {
        0: "close-up",
        1: "medium shot",
        2: "wide shot"
    }
    
    # 多语言标签
    LABELS = {
        'zh': {
            'azimuth': '方位角',
            'elevation': '仰角',
            'distance': '距离',
            'azimuth_values': ['前', '右前', '右', '右后', '后', '左后', '左', '左前'],
            'elevation_values': ['低角度', '平视', '高角度', '俯视'],
            'distance_values': ['近景', '中景', '远景']
        },
        'en': {
            'azimuth': 'Azimuth',
            'elevation': 'Elevation', 
            'distance': 'Distance',
            'azimuth_values': ['Front', 'Front-Right', 'Right', 'Back-Right', 'Back', 'Back-Left', 'Left', 'Front-Left'],
            'elevation_values': ['Low Angle', 'Eye Level', 'Elevated', 'High Angle'],
            'distance_values': ['Close-up', 'Medium', 'Wide']
        }
    }
    
    @classmethod
    def get_lang(cls):
        lang = locale.getdefaultlocale()[0] or ''
        return 'zh' if lang.startswith('zh') else 'en'
    
    @classmethod
    def INPUT_TYPES(cls):
        lang = cls.get_lang()
        labels = cls.LABELS[lang]
        
        azimuth_options = dict(zip(labels['azimuth_values'], [0, 45, 90, 135, 180, 225, 270, 315]))
        elevation_options = dict(zip(labels['elevation_values'], [-30, 0, 30, 60]))
        distance_options = dict(zip(labels['distance_values'], [0, 1, 2]))
        
        return {
            "required": {
                labels['azimuth']: (list(azimuth_options.keys()), {"default": labels['azimuth_values'][0]}),
                labels['elevation']: (list(elevation_options.keys()), {"default": labels['elevation_values'][1]}),
                labels['distance']: (list(distance_options.keys()), {"default": labels['distance_values'][1]})
            }
        }
    
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("prompt",)
    FUNCTION = "generate_prompt"
    CATEGORY = "utils"
    
    def generate_prompt(self, **kwargs):
        lang = self.get_lang()
        labels = self.LABELS[lang]
        
        # 获取参数值
        azimuth_label = kwargs.get(labels['azimuth'], labels['azimuth_values'][0])
        elevation_label = kwargs.get(labels['elevation'], labels['elevation_values'][1])
        distance_label = kwargs.get(labels['distance'], labels['distance_values'][1])
        
        # 转换为数值
        azimuth_idx = labels['azimuth_values'].index(azimuth_label) if azimuth_label in labels['azimuth_values'] else 0
        elevation_idx = labels['elevation_values'].index(elevation_label) if elevation_label in labels['elevation_values'] else 1
        distance_idx = labels['distance_values'].index(distance_label) if distance_label in labels['distance_values'] else 1
        
        azimuth = [0, 45, 90, 135, 180, 225, 270, 315][azimuth_idx]
        elevation = [-30, 0, 30, 60][elevation_idx]
        distance = [0, 1, 2][distance_idx]
        
        # 生成提示词
        azimuth_text = self.AZIMUTH_MAP.get(azimuth, "front view")
        elevation_text = self.ELEVATION_MAP.get(elevation, "eye-level shot")
        distance_text = self.DISTANCE_MAP.get(distance, "medium shot")
        
        prompt = f"<sks> {azimuth_text} {elevation_text} {distance_text}"
        return (prompt,)
