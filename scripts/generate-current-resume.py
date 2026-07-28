from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
FINAL_PDF = OUTPUT_DIR / "杜雨菲_AI产品经理_产品助理_简历.pdf"
PORTFOLIO_URL = "https://duyufei-ai-product-portfolio.duyufei000.chatgpt.site"
EDGE_URL = "https://microsoftedge.microsoft.com/addons/detail/aidmlojjjgebhogkffbebnfpjhfbpfmm"

PAGE_W, PAGE_H = A4
LEFT = 42
RIGHT = PAGE_W - 42
NAVY = HexColor("#123047")
TEAL = HexColor("#15979D")
MUTED = HexColor("#5B6E7D")
LIGHT = HexColor("#D7E2E5")
PALE = HexColor("#F2F7F7")

pdfmetrics.registerFont(TTFont("YaHei", r"C:\Windows\Fonts\msyh.ttc"))
pdfmetrics.registerFont(TTFont("YaHeiBold", r"C:\Windows\Fonts\msyhbd.ttc"))


def wrap_text(text, font, size, max_width):
    lines, current = [], ""
    for char in text:
        candidate = current + char
        if pdfmetrics.stringWidth(candidate, font, size) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = char
    if current:
        lines.append(current)
    return lines


def draw_text(c, text, x, y, font="YaHei", size=8.6, color=NAVY):
    c.setFont(font, size)
    c.setFillColor(color)
    c.drawString(x, y, text)


def section(c, title, y):
    draw_text(c, title, LEFT, y, "YaHeiBold", 13.4, NAVY)
    c.setStrokeColor(TEAL)
    c.setLineWidth(1.1)
    c.line(LEFT, y - 7, RIGHT, y - 7)
    return y - 22


def bullet(c, text, y, size=8.45, leading=12.2, indent=12):
    max_width = RIGHT - LEFT - indent
    lines = wrap_text(text, "YaHei", size, max_width)
    draw_text(c, "•", LEFT + 1, y, "YaHeiBold", size, TEAL)
    for index, line in enumerate(lines):
        draw_text(c, line, LEFT + indent, y - index * leading, "YaHei", size, NAVY)
    return y - len(lines) * leading - 2


def project_header(c, title, role, y, link=None, link_label=None):
    draw_text(c, title, LEFT, y, "YaHeiBold", 10.7, NAVY)
    role_width = pdfmetrics.stringWidth(role, "YaHei", 8.1)
    draw_text(c, role, RIGHT - role_width, y + 0.5, "YaHei", 8.1, MUTED)
    y -= 13
    if link and link_label:
        draw_text(c, link_label, LEFT, y, "YaHei", 7.9, TEAL)
        width = pdfmetrics.stringWidth(link_label, "YaHei", 7.9)
        c.linkURL(link, (LEFT, y - 2, LEFT + width, y + 9), relative=0)
        y -= 12
    return y


def generate():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(FINAL_PDF), pagesize=A4)
    c.setTitle("杜雨菲｜AI 产品经理 / 产品助理简历")
    c.setAuthor("杜雨菲")

    # Header
    y = PAGE_H - 45
    draw_text(c, "杜雨菲", LEFT, y, "YaHeiBold", 24, NAVY)
    draw_text(c, "AI 产品经理 / 产品助理", LEFT + 111, y + 2, "YaHeiBold", 13, TEAL)
    y -= 23
    contact = "17386624550  ｜  duyufei000@126.com  ｜  上海  ｜  2025 届本科  ｜  可尽快到岗"
    draw_text(c, contact, LEFT, y, "YaHei", 8.5, MUTED)
    y -= 17
    label = "作品集（项目详情、演示与在线体验）："
    draw_text(c, label, LEFT, y, "YaHeiBold", 8.5, NAVY)
    label_w = pdfmetrics.stringWidth(label, "YaHeiBold", 8.5)
    draw_text(c, PORTFOLIO_URL, LEFT + label_w, y, "YaHei", 8.2, TEAL)
    url_w = pdfmetrics.stringWidth(PORTFOLIO_URL, "YaHei", 8.2)
    c.linkURL(PORTFOLIO_URL, (LEFT + label_w, y - 2, LEFT + label_w + url_w, y + 10), relative=0)
    y -= 18

    # Summary panel
    c.setFillColor(PALE)
    c.roundRect(LEFT, y - 42, RIGHT - LEFT, 48, 3, stroke=0, fill=1)
    summary = (
        "计算机科学与技术本科，独立完成浏览器扩展、AI 网站和微信小程序。"
        "能够从真实使用场景识别问题，在用户价值、技术限制和投入成本之间做取舍，"
        "并将方案推进到可运行、可验证的版本。"
    )
    for i, line in enumerate(wrap_text(summary, "YaHei", 8.8, RIGHT - LEFT - 20)):
        draw_text(c, line, LEFT + 10, y - 10 - i * 13, "YaHei", 8.8, NAVY)
    y -= 56

    # Projects
    y = section(c, "代表项目", y)
    y = project_header(
        c,
        "AI Job Radar｜招聘网页内的岗位决策助手",
        "产品设计与独立开发｜Edge 商店已上线",
        y,
        EDGE_URL,
        "Edge 商店：点击查看并安装插件 ↗",
    )
    y = bullet(c, "识别求职者反复读取完整 JD、核对硬门槛、对照简历和组织招呼语的重复任务，设计招聘页面内的即时判断流程。", y)
    y = bullet(c, "第一版是独立 Dashboard，但“搬入 Radar—等待分析—返回招聘网站”反而增加步骤；因此删除岗位采集与独立搜索，重构为网页侧边助手。", y)
    y = bullet(c, "完成完整 JD 读取、硬门槛判断、职责与简历证据匹配、三档行动建议和可编辑招呼语；保留手动投递，避免误投与平台风控。", y)
    y = bullet(c, "产品已通过 Microsoft Edge 商店审核并公开上架；下一步验证分析结论是否真正减少岗位筛选成本。", y)
    y -= 3

    y = project_header(c, "多棱镜｜人生事件多角度解释工具", "产品设计与独立开发｜网站已上线", y)
    y = bullet(c, "针对用户容易陷入单一归因的问题，设计“事实—不同解释—下一步验证”结构，帮助区分已发生的事实与暂时无法确认的推测。", y)
    y = bullet(c, "不让 AI 直接给出“最可能的真相”，而是约束输出结构，并为不同解释提供可继续验证的方向。", y)
    y = bullet(c, "完成前端、模型接口、结构化输出与部署，可在线体验；下一步观察用户能否真正理解事实与推测的边界。", y)
    y -= 3

    y = project_header(c, "探索运营｜内容平台运营策略推演小程序", "产品设计与独立开发｜微信小程序已上线", y)
    y = bullet(c, "将流量、信任、平台风险与商业化压力转化为章节式选择和状态反馈，让用户通过具体决策理解内容运营取舍。", y)
    y = bullet(c, "第一版体验者不容易理解目标和选择后果，因此重做新手引导、任务说明和即时反馈，而不是继续增加更多事件。", y)
    y = bullet(c, "完成章节、状态模型及正常、失败、边界等 7 条分支测试；微信小程序目前在线，可直接扫码体验。", y)
    y -= 2

    # Skills
    y = section(c, "产品与技术", y)
    skill_rows = [
        ("产品工作", "问题拆解、用户流程、原型与交互、AI 输出规则、需求优先级、版本复盘"),
        ("技术理解", "Vue、Next.js、TypeScript、Node.js、浏览器扩展、微信小程序、大模型接口、Git"),
        ("AI 应用", "提示词与结构化输出、大模型 API、Ollama 本地部署、LoRA 微调实践"),
    ]
    for label_text, value in skill_rows:
        draw_text(c, label_text, LEFT, y, "YaHeiBold", 8.7, TEAL)
        draw_text(c, value, LEFT + 52, y, "YaHei", 8.5, NAVY)
        y -= 14
    y -= 2

    # Education
    y = section(c, "教育背景", y)
    draw_text(c, "长江师范学院｜计算机科学与技术｜本科", LEFT, y, "YaHeiBold", 10.2, NAVY)
    date_text = "2020.09 - 2025.06"
    date_w = pdfmetrics.stringWidth(date_text, "YaHei", 8.5)
    draw_text(c, date_text, RIGHT - date_w, y, "YaHei", 8.5, MUTED)
    y -= 15
    draw_text(c, "“1+2+1”联合培养，大二、大三赴山东科技大学青岛校区交流学习近两年。", LEFT, y, "YaHei", 8.4, MUTED)
    y -= 14
    draw_text(c, "专业排名第 4｜优异奖学金｜CET-4｜主修数据结构、计算机网络、Java、计算机组成原理", LEFT, y, "YaHei", 8.4, NAVY)

    # Footer accent
    c.setStrokeColor(TEAL)
    c.setLineWidth(2)
    c.line(LEFT, 29, RIGHT, 29)
    footer = "求职方向：AI 产品经理 / 产品助理"
    draw_text(c, footer, LEFT, 17, "YaHei", 7.5, MUTED)
    c.save()
    return FINAL_PDF


if __name__ == "__main__":
    print(generate())
