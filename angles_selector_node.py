class AnglesSelector3D:
    """
    3D Angles Selector for Multi-Angle LoRA Prompt Generation
    Generates prompts in format: <sks> [azimuth] [elevation] [distance]
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
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "selected_points": ("STRING", {"default": "[]", "multiline": False})
            }
        }
    
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("prompt",)
    OUTPUT_IS_LIST = (True,)
    FUNCTION = "generate_prompt"
    CATEGORY = "utils"
    
    def generate_prompt(self, selected_points="[]"):
        import json
        
        try:
            points = json.loads(selected_points)
        except:
            points = []
        
        if not points:
            return ([],)
        
        prompts = []
        for point in points:
            azimuth = point.get("azimuth", 0)
            elevation = point.get("elevation", 0)
            distance = point.get("distance", 1)
            
            azimuth_text = self.AZIMUTH_MAP.get(azimuth, "front view")
            elevation_text = self.ELEVATION_MAP.get(elevation, "eye-level shot")
            distance_text = self.DISTANCE_MAP.get(distance, "medium shot")
            
            prompt = f"<sks> {azimuth_text} {elevation_text} {distance_text}"
            prompts.append(prompt)
        
        return (prompts,)
