import locale
from .angles_selector_node import AnglesSelector3D
from .simple_angles_node import SimpleAnglesSelector

NODE_CLASS_MAPPINGS = {
    "AnglesSelector3D": AnglesSelector3D,
    "SimpleAnglesSelector": SimpleAnglesSelector
}

# 根据系统语言设置节点显示名称
def get_display_name():
    lang = locale.getdefaultlocale()[0] or ''
    if lang.startswith('zh'):
        return "3D角度选择器"
    return "3D Angles Selector"

def get_simple_display_name():
    lang = locale.getdefaultlocale()[0] or ''
    if lang.startswith('zh'):
        return "简易角度选择器"
    return "Simple Angles Selector"

NODE_DISPLAY_NAME_MAPPINGS = {
    "AnglesSelector3D": get_display_name(),
    "SimpleAnglesSelector": get_simple_display_name()
}

WEB_DIRECTORY = "./web"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
