<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { copyContact, motionBehavior, shouldShowIntro } from './interactions'

const openProject = ref(null)
const radarView = ref('before')
const prismView = ref('fact')
const opsChoice = ref('steady')
const arcadeStep = ref(1)
const copied = ref('')
const videoEnabled = ref({})
const introKey = 'portfolio-intro-v1'
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const introSeen = () => {
  try { return window.sessionStorage.getItem(introKey) === '1' } catch { return false }
}
const introVisible = ref(shouldShowIntro({ seen: introSeen(), reducedMotion: reducedMotion() }))
const introReady = ref(false)
let revealObserver
let copyTimer
let introTimer
let stopStarfield
const mountStarfield = () => {
  const canvas = document.querySelector('.sky-grain')
  if (!canvas) return () => {}
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}
  const reduced = reducedMotion()
  let width = 0
  let height = 0
  let stars = []
  let frame
  const random = (seed) => {
    let value = seed >>> 0
    return () => { value = (1664525 * value + 1013904223) >>> 0; return value / 4294967296 }
  }
  const resize = () => {
    width = window.innerWidth
    height = window.innerHeight
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    const next = random(28417 + width * 7 + height)
    stars = Array.from({ length: Math.max(10, Math.round(width * height / 24000)) }, () => ({
      x: next() * width,
      y: next() * height,
      radius: .45 + next() * .65,
      base: .12 + next() * .23,
      pulse: next() < .22 ? .14 + next() * .22 : .02 + next() * .05,
      phase: next() * Math.PI * 2,
      speed: .0005 + next() * .0011
    }))
  }
  const draw = (time = 0) => {
    ctx.clearRect(0, 0, width, height)
    for (const star of stars) {
      const shimmer = reduced ? 0 : (Math.sin(time * star.speed + star.phase) + 1) / 2
      ctx.fillStyle = `rgba(142,190,255,${star.base + star.pulse * shimmer})`
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      ctx.fill()
    }
    if (!reduced) frame = window.requestAnimationFrame(draw)
  }
  const onResize = () => { resize(); if (reduced) draw() }
  resize()
  draw()
  window.addEventListener('resize', onResize)
  return () => { window.removeEventListener('resize', onResize); window.cancelAnimationFrame(frame) }
}
const startIntro = () => {
  if (!introVisible.value || introReady.value) return
  introReady.value = true
  introTimer = window.setTimeout(closeIntro, 3400)
}
const closeIntro = (skipped = false) => {
  if (!introVisible.value) return
  introVisible.value = false
  clearTimeout(introTimer)
  try { window.sessionStorage.setItem(introKey, '1') } catch { /* private storage may be unavailable */ }
  if (skipped) nextTick(() => document.querySelector('.hero .button')?.focus({ preventScroll: true }))
}
const copyEmail = async () => {
  copied.value = await copyContact(navigator.clipboard)
  clearTimeout(copyTimer)
  copyTimer = window.setTimeout(() => { copied.value = '' }, 5000)
}
const toggleProject = async (id) => {
  openProject.value = openProject.value === id ? null : id
  await nextTick()
  if (openProject.value) document.querySelector(`#detail-${id}`)?.scrollIntoView({ behavior: motionBehavior(reducedMotion()), block: 'start' })
}
const playVideo = async (id) => {
  videoEnabled.value[id] = true
  await nextTick()
  document.querySelector(`#demo-${id} video, #detail-${id} video`)?.play().catch(() => {})
}
onMounted(() => {
  stopStarfield = mountStarfield()
  const introImage = document.querySelector('.boot-intro__portrait img')
  if (introImage?.complete && introImage.naturalWidth) startIntro()
  if (reducedMotion() || !('IntersectionObserver' in window)) return
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('arrived')
        revealObserver.unobserve(entry.target)
      }
    })
  }, { threshold: 0.08 })
  document.querySelectorAll('.home-project, .section-head, .education-three article, .process-grid article').forEach(el => revealObserver.observe(el))
})
onBeforeUnmount(() => { revealObserver?.disconnect(); stopStarfield?.(); clearTimeout(copyTimer); clearTimeout(introTimer) })

const projects = [
  {
    no: '01', id: 'agent', featured: true,
    title: '求职 Agent｜本地桌面岗位处理工作流', status: '本地运行 · 可联系演示',
    intro: '每天重复打开岗位、读 JD、对照经历、写招呼语。我把这条链路做成了在 Windows 桌面运行的 Agent。',
    iteration: '最难的不是让它点“发送”，而是确定消息究竟有没有发出。一次动作超时可能发生在点击之后，所以我让不确定状态停下来，交给人工核对。',
    tech: { problem: '逐个岗位阅读与沟通重复耗时；自动发送一旦点错对象或重试过头，会真的打扰招聘方。', plan: 'Python 通过 UI Automation 读取岗位和聊天界面；硬规则先过滤明确门槛，DeepSeek API 对完整 JD 返回 A / B / 跳过的 JSON 判断；SQLite 保存岗位正文、判定和发送状态，并按岗位身份去重。', challenge: '同一张卡片的公司字段可能时有时无，身份会漂移；发送前核对岗位与聊天对象。超时后无法证明消息未送达，就记为 send_ambiguous、停止本轮，不自动重发。', state: '本地运行、持续自用；代码未公开，可联系看演示。' },
    tags: ['Python', '大模型 API', 'UI Automation', 'SQLite'], primaryLabel: '查看开发复盘', secondaryLabel: '联系看演示', secondaryHref: 'mailto:duyufei000@126.com?subject=求职Agent演示',
    detail: [
      ['READ · 先确认读到的是哪份岗位', '输入是列表卡片和打开的完整 JD；核对标题、公司、薪资等字段，信息不完整则留档，已处理岗位不重复进入。输出一份可以复查的岗位快照。'],
      ['CHECK · 让模型判断，让代码守边界', '输入是完整 JD 与真实项目经历。确定性规则先拦学历、地点、年限等硬冲突；DeepSeek API 返回结构化 JSON，经字段校验后形成 A / B / 跳过、缺口与项目证据。输出判断和沟通草稿。'],
      ['VERIFY · 结果必须从界面读回来', '输入是候选岗位和待发送内容。发送前核对聊天对象；执行后观察聊天记录。只有能看到对应消息才写 sent；不能确认时写 send_ambiguous，并停止。'],
      ['失败恢复 · 宁可暂停也不猜', '读岗位或操作通道超时：保留记录与检查点，不自动重放。页面状态错位：岗位或聊天对象不一致就停。重复发送风险：SQLite 的 sending / sent / send_ambiguous 状态都会阻止再次自动发送，待人工核实。']
    ]
  },
  {
    no: '02', id: 'plugin',
    title: 'AI Job Radar｜招聘网页内的岗位决策助手',
    status: '已上架 Edge 商店',
    intro: '第一版要把 BOSS 岗位搬进独立面板；我用起来发现，分析前多了一次搬运，判断后还得回原站沟通。于是把工具移到招聘网页的侧边栏。',
    tech: { problem: '看一个岗位要反复读完整 JD，再逐项对照简历；独立岗位库让这个过程更绕。', plan: 'Manifest V3 内容脚本读取当前页已加载的完整 JD，侧边栏展示判断；简历支持 PDF / TXT / Markdown，扫描版 PDF 先在本地 OCR，提取经历由用户确认；模型返回硬条件、职责、JD 原文与简历证据。', challenge: '只靠岗位标题或关键词会误判。把“明确冲突 / 未知 / 偏好”分开，核对引用是否出自 JD 与简历；证据不足就降低建议等级。只分析当前已加载页面，不替用户发送。', state: 'Edge 商店已上架；可安装或观看演示。' },
    iteration: '我删掉独立搜索和岗位搬运，保留最有用的判断：这一岗值不值得沟通，依据到底在哪一句。',
    evidence: { task: '在招聘网页中快速判断岗位是否值得沟通。', assumption: '将岗位集中到独立 Dashboard，可以提高分析和管理效率。', tradeoff: '发现岗位搬运增加步骤后，删除独立搜索和搬运流程，将产品嵌入原招聘场景；读取完整 JD 后再判断，并保留用户手动投递。', validation: '核心流程已完成，Edge 商店已上线；下一步验证判断结果是否真正减少岗位筛选成本。' },
    tags: ['个人独立项目', '浏览器扩展', 'Edge 商店已上架', '可查看演示'],
    video: 'media/ai-job-plugin-small.mp4', poster: 'media/ai-job-plugin-poster.jpg',
    primaryLabel: '查看项目复盘', secondaryLabel: '观看演示', secondaryHref: '#demo-plugin',
    detail: [
      ['为什么从 Dashboard 改到侧边栏', '第一版有公司库、岗位库和匹配分数，却没有独立岗位源。岗位要从 BOSS 搬来，正则分数也更像“这个 JD 是否像 AI 产品岗”，无法说明“我是否够得着”。我保留个人证据分析，把入口放回原本浏览岗位的页面。'],
      ['怎么防止“关键词相同 = 匹配”', '读取完整 JD，分别处理硬门槛与核心职责。侧边栏逐项展示 JD 原文、简历原文、证据等级和仍存在的差距；未知信息不假装满足，缺证据时下调推荐。'],
      ['为什么不做自动投递', '浏览器扩展只处理当前已加载岗位。上传简历和选择模型服务商需要用户主动确认；最终招呼语留给用户检查、复制和发送。页面结构变化时解析可能失效，因此读取失败要显示“信息不足”。']
    ]
  },
  {
    no: '03', id: 'prism',
    title: '多棱镜｜人生事件多角度解释工具',
    status: '已上线 · 可在线体验',
    intro: '我不想让 AI 把一段经历讲成唯一真相。多棱镜把“发生了什么”和“可能怎么解释”分开，再给每种解释一个现实中能检验的动作。',
    tech: { problem: '人容易把一次事件归结为单一原因；通用聊天回答又容易把猜测写成事实。', plan: 'Next.js / TypeScript 的分析接口接收事件描述；模型按 JSON 结构输出事实、跨学科解释、适用边界和下一步实验。Explore 打开可能性，Converge 给临时判断；历史记录保存在本地。', challenge: '提示词从单一分析迭代到双模式与可验证实验，并约束空泛的“人人都适用”解释。模型调用或解析失败时切到模拟解释引擎；模拟结果只是演示降级，不冒充实时模型推理。', state: '在线可体验；是否调用真实模型取决于服务端 API 配置。' },
    iteration: '从“多给几个解释”改到“每个解释都要说清不成立的条件”。对我来说，能被现实推翻的解释，才值得显示给用户。',
    evidence: { task: '面对一件困扰自己的事情时，区分事实、猜测和可以继续验证的信息。', assumption: '多提供几个解释，就能帮助用户走出单一归因。', tradeoff: '不让 AI 直接给出“最可能的真相”，而是强制区分事实与推测，并为不同解释提供下一步验证方向。', validation: '产品已上线，可完成完整输入和结构化输出流程；下一步观察用户能否真正理解事实与推测的区别。' },
    tags: ['AI 输出结构设计', '个人独立项目', '可在线体验'],
    video: 'media/multi-prism-small.mp4', poster: 'media/multi-prism-poster.jpg',
    primaryLabel: '查看设计与实现', secondaryLabel: '在线体验', secondaryHref: 'https://deluxe-cheesecake-203e56.netlify.app/', codeHref: 'https://github.com/yuyuyyyyyyyyyyyy/multi-prism', external: true,
    detail: [
      ['从“安慰”改成“可检验的解释”', '早期让模型直接给原因和建议，很容易产出漂亮但武断的话。我把回答拆成事实、多个竞争解释、关键变量和下一步实验；每个解释都要写适用边界与不成立条件。'],
      ['真实模型与演示降级如何区分', '服务端通过环境变量配置兼容 Chat Completions 的模型接口，解析 JSON 并整理字段。无 Key 或调用失败时进入内置模拟解释引擎，保证流程能演示，但不把模板输出说成模型分析。'],
      ['仍然需要验证什么', '现在能跑通输入、分析、历史回看和分享。尚需继续检验用户是否能看懂“可能解释”与“事实”的边界，尤其要留意重复解释和不可执行的实验。']
    ]
  },
  {
    no: '04', id: 'reading',
    title: '牡丹亭 · 惊梦｜古典戏曲互动阅读', status: '已上线 · 可在线体验',
    intro: '最初想用 AI “教懂”《牡丹亭》，后来发现一提问就像在做题。我改成让读者划下触动自己的原文，后面的句子再回来回应它。',
    iteration: '我把 AI 从讲解者退到幕后：原文和人工审核的关系是证据，模型只在这些候选里寻找连接；找不到就让书保持沉默。',
    tech: { problem: '高一学生知道“姹紫嫣红”名句，却难把它放回完整《惊梦》；AI 随意续写又会破坏原文可信度。', plan: 'React / TypeScript 记录划线与阅读进度；MCP 提供取校对原文、寻找后文回声、角色回应三种工具。服务端为原文签发 evidenceId，只从 25 条人工审核关系中找回声，模型负责候选语义排序。', challenge: '用户或模型提交的“原文”可能错引，服务端按 evidenceId 重新核验；未读章节由剧透边界拦截。无可信证据时返回 speak:false，模型异常时用有据的本地规则降级。', state: '在线作品与 MCP 端点已部署；可打开阅读。' },
    tags: ['React', 'TypeScript', 'AI 检索'], primaryLabel: '查看开发复盘', secondaryLabel: '打开作品', secondaryHref: 'https://yuyuyyyyyyyyyyyy.github.io/mudanting-jingmeng/', codeHref: 'https://github.com/yuyuyyyyyyyyyyyy/mudanting-jingmeng', external: true,
    detail: [
      ['为什么让 AI 退到幕后', '早期的“AI 辅读”太像课堂测验，互动会打断阅读。现在读者通过划原文表达判断，系统记录“我从哪一句开始看见杜丽娘的变化”；读完后把这段判断历程和后文并置。'],
      ['原文与模型之间的信任边界', '校对原文存在服务端，每段有稳定 evidenceId。find_textual_echo 只能从人工审核的关系中找回应，并检查来源段落和当前阅读进度；模型可以排序，不能发明原文或越过剧透边界。'],
      ['允许它不说话', '角色回应工具先检查证据和请求边界。没有可靠原文、遇到提示注入或请求未读剧情时，返回结构化拒绝或 speak:false；这是预期状态，不把编造当作“体验完整”。']
    ]
  },
  {
    no: '05', id: 'ops', supporting: true,
    title: '探索运营｜内容平台运营策略推演小程序',
    status: '微信小程序已上线',
    intro: '我想把“平台会怎样回应一条内容”从抽象规则变成能亲手试的过程：写内容、做投放选择、看反馈，再带着变化进入下一章。',
    tech: { problem: '流量、信任和平台风险之间的牵连难靠说明文字理解；玩家也需要看懂选择为何带来不同后果。', plan: '微信小程序把选题、标题、内容、情绪、时机等输入映射到 hook、retention、save、share、risk、trust 六维指标；世界状态记录平台管控、舆情、趋势等变量，再影响后续评分与事件。', challenge: '最初体验者看不懂目标和反馈，于是先改新手引导与结果解释。逻辑核查还发现任务推进字段、可选标签与评分画像不一致等问题；通过跨文件追踪和分支回放定位。', state: '微信小程序已上线；可扫码体验。' },
    iteration: '第一版给了很多规则，却没让人看懂自己刚做了什么。我先补任务目标、状态解释和即时反馈，而不是继续往系统里加事件。',
    evidence: { task: '通过具体选择理解内容平台中的流量、信任、风险和商业化取舍。', assumption: '只要规则和事件足够完整，用户就能理解玩法。', tradeoff: '第一版用户不容易理解目标和选择后果，因此重做新手引导、任务说明与即时反馈，而不是继续增加更多事件。', validation: '微信小程序已上线，可以直接体验完整章节流程。' },
    tags: ['微信小程序', '已上线', '可直接体验', '个人独立项目'],
    video: 'media/explore-ops-small.mp4', poster: 'media/explore-ops-poster.jpg', qr: 'media/explore-ops-miniprogram-code.jpg',
    primaryLabel: '查看项目复盘', secondaryLabel: '立即体验', secondaryHref: '#ops-qr',
    detail: [
      ['从规则堆叠到能看懂的反馈', '首版章节和状态系统已经能跑，但体验者不知道这一轮的目标，也看不清选择如何改变下一轮。我重写新手目标、任务说明和结果文案，让规则在使用时被看见。'],
      ['评分为什么要连着世界状态', '发布内容不是只加一个分数。recommendation.js 先计算六维信号，再让文本与玩家行为改写平台管控、舆情和趋势；这些状态会反过来修正后续结果。'],
      ['如何排查“剧情走不下去”', '上线前逐文件核查创建、发布、结果、任务推进的字段传递，并回放正常、失败与边界分支。曾定位到任务条件读取了错误层级字段、选项词表与评分画像错位；这类问题比视觉上的“像不像游戏”更先影响可玩性。']
    ]
  }
]

const asset = (p) => import.meta.env.BASE_URL + p

const process = [
  ['01', '读取与复现', '先拿到完整输入和可复现样例：岗位 JD、页面状态、模型输出或用户操作。'],
  ['02', '拆分判断边界', '把确定性门槛交给规则，语义判断交给模型，外部动作前增加身份校验。'],
  ['03', '实现可运行链路', '串起接口、JSON 校验、页面交互和状态记录，让每一步都有可检查的输出。'],
  ['04', '用失败修正实现', '记录超时和状态错位；结果不明确时暂停并保留现场，再根据实际反馈改流程。']
]
</script>

<template>
  <div v-if="introVisible" class="boot-intro" :class="{ 'is-ready': introReady }" role="dialog" aria-modal="true" aria-label="杜雨菲的赛博朋克开场">
    <div class="boot-intro__frame">
      <div class="boot-intro__portrait"><img :src="asset('media/blue-digital-silhouette-v2.webp')" alt="蓝色数字点阵女性侧影插画" width="1672" height="940" fetchpriority="high" @load="startIntro" @error="closeIntro"></div>
      <div class="boot-intro__copy"><span>SIGNAL / DU YUFEI</span><h2>杜雨菲</h2><p>AI 应用 / Agent 开发工程师</p><small>保持好奇，把想法做出来。</small></div>
      <div class="boot-intro__progress" aria-hidden="true"></div>
    </div>
    <button type="button" class="boot-intro__skip" @click="closeIntro(true)">跳过开场 ↗</button>
  </div>
  <div class="site-shell" :inert="introVisible">
    <canvas class="sky-grain" aria-hidden="true"></canvas>
    <a class="skip-link" href="#work">跳到项目内容</a>
    <nav class="nav shell">
      <a class="brand" href="#top"><span>雨<span class="brand-dot">.</span></span><b>杜雨菲 <small>AI APPLICATIONS & AGENTS</small></b></a>
      <div class="nav-links"><a href="#work">代表项目</a><a href="#process">工作方式</a><a href="#education">教育与技能</a><a class="nav-cta" href="mailto:duyufei000@126.com">联系我</a></div>
    </nav>

    <main id="top">
      <section class="hero shell job-hero">
        <div class="hero-copy">
          <p class="eyebrow"><i></i>开放工作机会 <span>武汉 / 北京</span></p>
          <p class="hero-index">你好，我是杜雨菲 / AI 应用开发</p>
          <h1>AI 应用 /<br><em>Agent 开发工程师</em></h1>
          <p class="lead">保持好奇，把想法做出来。</p>
          <div class="actions"><a class="button primary" href="#work">探索我的作品 <span>↘</span></a><a class="button" :href="asset('杜雨菲_Agent应用开发_简历.pdf')" download>下载简历 ↗</a></div>
          <p class="hero-footnote">Python <span>·</span> 大模型 API <span>·</span> UI Automation <span>·</span> SQLite</p>
        </div>
        <aside class="hero-product" :class="`step-${arcadeStep}`" aria-label="项目与工作过程速览">
          <div class="hero-note-grid">
            <button type="button" class="workflow-key" :aria-pressed="arcadeStep === 1" @click="arcadeStep = 1"><small>01</small>发现真实问题</button><button type="button" class="workflow-key" :aria-pressed="arcadeStep === 2" @click="arcadeStep = 2"><small>02</small>拆清边界</button><button type="button" class="workflow-key" :aria-pressed="arcadeStep === 3" @click="arcadeStep = 3"><small>03</small>做出可运行版本</button>
            <button type="button" class="workflow-key" :aria-pressed="arcadeStep === 4" @click="arcadeStep = 4"><small>04</small>根据使用继续重构</button><a href="#agent"><b>求职 Agent</b><small>本地运行 · 可演示 ↗</small></a><a href="#plugin"><b>AI Job Radar</b><small>Edge 商店已上架 ↗</small></a>
            <a href="#prism"><b>多棱镜</b><small>可在线体验 ↗</small></a><a href="#reading"><b>牡丹亭</b><small>可在线体验 ↗</small></a><a href="#ops"><b>探索运营</b><small>微信小程序已上线 ↗</small></a>
          </div>
          <span class="studio-caption">IDEA ↔ REALITY</span>
        </aside>
      </section>
      <div class="discipline-strip shell"><span>从真实输入到可验证输出。</span><span>PYTHON <i>✳</i> AI APPLICATIONS <i>✳</i> AGENT WORKFLOWS</span></div>

      <section id="work" class="section shell work-home">
        <header class="section-head"><div><p class="kicker">01 / SELECTED WORK</p><h2>做过的项目<span class="accent">。</span></h2></div><p>从一个真实问题开始，写清我怎么做、在哪一步改了主意，以及目前做到哪里。</p></header>

        <article v-for="project in projects" :key="project.id" :id="project.id" class="home-project" :class="{ featured: project.featured, supporting: project.supporting }">
          <div class="card-copy">
            <div class="card-top"><span>{{ project.no }}</span><p><i></i>{{ project.status }}</p></div>
            <h3 class="project-name">{{ project.title.split('｜')[0] }}</h3><p class="project-subtitle">{{ project.title.split('｜')[1] }}</p>
            <p class="project-intro">{{ project.intro }}</p>
            <div class="iteration"><b>我改变了什么</b><p>{{ project.iteration }}</p></div>
            <div class="card-tags"><span v-for="tag in project.tags" :key="tag">{{ tag }}</span></div>
            <div class="card-actions"><button class="button primary" type="button" @click="toggleProject(project.id)" :aria-expanded="openProject === project.id">{{ openProject === project.id ? '收起开发复盘' : project.primaryLabel }}</button><a class="button" :href="project.secondaryHref" :target="project.external ? '_blank' : null" :rel="project.external ? 'noreferrer' : null">{{ project.secondaryLabel }}</a><a v-if="project.codeHref" class="button" :href="project.codeHref" target="_blank" rel="noreferrer">查看源码 ↗</a><a v-if="project.id === 'plugin'" class="button store-button" href="https://microsoftedge.microsoft.com/addons/detail/aidmlojjjgebhogkffbebnfpjhfbpfmm" target="_blank" rel="noreferrer">下载 Edge 插件</a></div>
          </div>

          <div class="card-media mechanism-media" :id="`demo-${project.id}`">
            <div v-if="project.id === 'agent'" class="agent-mechanism"><figure class="project-art"><img :src="asset('media/agent-concept-v2.webp')" alt="用纸片与连线表现读取、判断、核验的抽象插画" loading="lazy" decoding="async" width="1280" height="720"><figcaption>概念插画 · 非产品截图</figcaption></figure><span class="mechanism-label">LOCAL AGENT / READ → CHECK → VERIFY</span><h4>把判断与执行分开</h4><div class="agent-flow" aria-label="READ CHECK VERIFY 流程"><span>READ<br>读取岗位</span><i>→</i><span>CHECK<br>规则与模型判断</span><i>→</i><span>VERIFY<br>发送核验</span></div><p>每一步都保留可检查的输入、判断和输出；发送结果不明确时停止。</p></div>
            <template v-else-if="project.id === 'plugin'"><div class="video-head"><div><span>真实产品界面</span><b>从完整 JD 生成行动判断</b></div><small>{{ project.status }}</small></div><div v-if="!videoEnabled[project.id]" class="video-preview"><img :src="asset(project.poster)" alt="AI Job Radar 演示视频封面" loading="lazy" decoding="async" width="854" height="480"><button type="button" @click="playVideo(project.id)" aria-label="播放 AI Job Radar 演示视频"><span aria-hidden="true">▶</span>播放演示</button></div><video v-else :src="asset(project.video)" :poster="asset(project.poster)" controls preload="none" playsinline :aria-label="`${project.title} 演示视频`"></video></template>
            <div v-else-if="project.id === 'prism'" class="prism-mechanism"><figure class="project-art"><img :src="asset('media/prism-concept-v2.webp')" alt="同一个球体穿过多块棱镜，产生不同观察路径的抽象插画" loading="lazy" decoding="async" width="1280" height="720"><figcaption>概念插画 · 非产品截图</figcaption></figure><span class="mechanism-label">输入事件</span><h4>“他没有回复我。”</h4><div class="mechanism-tabs"><button :class="{active: prismView === 'fact'}" @click="prismView = 'fact'">事实</button><button :class="{active: prismView === 'possibility'}" @click="prismView = 'possibility'">不同解释</button><button :class="{active: prismView === 'verify'}" @click="prismView = 'verify'">下一步验证</button></div><p v-if="prismView === 'fact'"><b>可以确认：</b>消息已发出，目前没有收到回复。</p><p v-else-if="prismView === 'possibility'"><b>还有可能：</b>正在忙、没有看到、不知道如何回应，或暂时不想回复。</p><p v-else><b>可以验证：</b>等待一个合理时间，再通过其他行为观察关系，而不是立即认定原因。</p></div>
            <div v-else-if="project.id === 'reading'" class="reading-mechanism"><figure class="project-art"><img :src="asset('media/reading-concept-v2.webp')" alt="书页中展开园林与牡丹，细线连接前后页的概念插画" loading="lazy" decoding="async" width="1280" height="720"><figcaption>概念插画 · 非作品截图</figcaption></figure><span class="mechanism-label">INTERACTIVE READING</span><blockquote>原来姹紫嫣红开遍。</blockquote><p>划选原文 → 找到后文回声 → 回到文本继续阅读</p></div>
            <div v-else class="ops-mechanism"><span class="mechanism-label">第 03 章 · 流量波动</span><h4>热点突然出现，你会怎么选？</h4><div class="ops-stats"><p><b>关注度</b><i>{{ opsChoice === 'trend' ? '+24' : '+8' }}</i></p><p><b>信任度</b><i>{{ opsChoice === 'trend' ? '-6' : '+12' }}</i></p><p><b>平台风险</b><i>{{ opsChoice === 'trend' ? '上升' : '稳定' }}</i></p></div><div class="ops-actions"><button :class="{active: opsChoice === 'trend'}" @click="opsChoice = 'trend'">立即追热点</button><button :class="{active: opsChoice === 'steady'}" @click="opsChoice = 'steady'">坚持垂直内容</button></div><div id="ops-qr" class="qr-entry"><img :src="asset(project.qr)" alt="探索运营微信小程序码" loading="lazy" decoding="async" width="86" height="86"><div><b>微信扫码体验</b><p>小程序目前在线。</p></div></div></div>
          </div>

          <section class="tech-explanation" :aria-label="`${project.title.split('｜')[0]}技术说明`">
            <div class="tech-heading"><span>TECHNICAL NOTES / {{ project.no }}</span><h4>技术说明</h4></div>
            <dl><div><dt>问题</dt><dd>{{ project.tech.problem }}</dd></div><div><dt>方案</dt><dd>{{ project.tech.plan }}</dd></div><div><dt>卡点</dt><dd>{{ project.tech.challenge }}</dd></div><div><dt>状态</dt><dd>{{ project.tech.state }}</dd></div></dl>
          </section>

          <section v-if="openProject === project.id" :id="`detail-${project.id}`" class="case-detail">
            <header><p class="kicker">BUILD LOG / {{ project.no }}</p><h3 class="project-name">为什么这样做</h3></header>
            <div v-if="project.id === 'plugin'" class="radar-switch" aria-label="AI Job Radar 产品迭代对比">
              <div class="switch-tabs" aria-label="对比产品方案"><button type="button" :aria-pressed="radarView === 'before'" :class="{ active: radarView === 'before' }" @click="radarView = 'before'">第一版方案</button><button type="button" :aria-pressed="radarView === 'after'" :class="{ active: radarView === 'after' }" @click="radarView = 'after'">重构后方案</button></div>
              <div v-if="radarView === 'before'" class="flow-panel"><b>第一版</b><p>浏览招聘网站 → 搬入 Radar → 等待分析 → 返回招聘网站 → 手动沟通</p><span>问题：增加页面切换和岗位维护成本。</span></div>
              <div v-else class="flow-panel improved"><b>重构后</b><p>浏览招聘网站 → 页面内获得判断 → 决定是否沟通</p><span>结果：不改变用户原有使用场景。</span></div>
            </div>
            <div class="detail-grid"><section v-for="section in project.detail" :key="section[0]" class="detail-story"><h4>{{ section[0] }}</h4><p>{{ section[1] }}</p></section></div>
            <div v-if="project.video && project.id !== 'plugin'" :id="`video-${project.id}`" class="detail-video"><p class="kicker">真实产品演示</p><div v-if="!videoEnabled[project.id]" class="video-preview"><img :src="asset(project.poster)" :alt="`${project.title} 演示视频封面`" loading="lazy" decoding="async" width="854" height="480"><button type="button" @click="playVideo(project.id)" :aria-label="`播放 ${project.title} 演示视频`"><span aria-hidden="true">▶</span>播放演示</button></div><video v-else :src="asset(project.video)" :poster="asset(project.poster)" controls preload="none" playsinline :aria-label="`${project.title} 演示视频`"></video></div>
            <div class="detail-links"><a v-if="project.id === 'agent'" class="button primary" href="mailto:duyufei000@126.com?subject=求职Agent演示">联系看演示</a><a v-if="project.id === 'plugin'" class="button primary" href="https://microsoftedge.microsoft.com/addons/detail/aidmlojjjgebhogkffbebnfpjhfbpfmm" target="_blank" rel="noreferrer">在 Edge 商店查看</a><a v-if="project.id === 'prism'" class="button primary" href="https://deluxe-cheesecake-203e56.netlify.app/" target="_blank" rel="noreferrer">在线体验多棱镜</a><a v-if="project.id === 'reading'" class="button primary" href="https://yuyuyyyyyyyyyyyy.github.io/mudanting-jingmeng/" target="_blank" rel="noreferrer">打开作品</a><a v-if="project.id === 'ops'" class="button primary" href="#ops-qr">扫描小程序码体验</a><a v-if="project.video" class="button" :href="project.id === 'plugin' ? '#demo-plugin' : `#video-${project.id}`">观看演示</a></div>
          </section>
        </article>
      </section>

      <section id="process" class="section process-section"><div class="shell"><header class="section-head inverse"><div><p class="kicker">HOW I WORK</p><h2>我如何工作。</h2></div></header><div class="process-grid"><article v-for="item in process" :key="item[0]" :class="{ active: arcadeStep === Number(item[0]) }"><b>{{ item[0] }}</b><h3>{{ item[1] }}</h3><p>{{ item[2] }}</p></article></div></div></section>

      <section id="education" class="shell education-compact"><div class="education-heading"><div><p class="kicker">ABOUT ME</p><h2>关于我</h2><p>杜雨菲 · AI 应用 / Agent 开发工程师</p></div><figure class="profile-photo"><img :src="asset('photo.jpg')" alt="杜雨菲本人证件照" width="320" height="400" loading="lazy" decoding="async"><figcaption>杜雨菲 / 本人照片</figcaption></figure></div><div class="education-three"><article><span>教育背景</span><h3>计算机科学与技术本科</h3><p>长江师范学院｜山东科技大学联合培养</p><p>2025 届 · 专业排名第 4 · CET-4</p></article><article><span>项目实践</span><h3>从接口到可用流程</h3><p>独立实现本地 Agent、浏览器扩展和 AI 应用；关注输入校验、状态记录、失败处理与用户操作路径。</p></article><article><span>项目中使用的技术</span><h3>AI 应用开发</h3><p>Python、TypeScript、Vue、React / Next.js、浏览器扩展、大模型 API、SQLite 与 Git。</p><p>结合实现限制调整方案，也明确尚未验证的边界。</p></article></div></section>

      <section class="contact shell"><p class="kicker">LET’S BUILD SOMETHING USEFUL</p><h2>联系我<span>↗</span></h2><p>正在寻找 AI 应用 / Agent 开发工程师岗位。</p><div><a class="button lime" href="mailto:duyufei000@126.com">duyufei000@126.com ↗</a><button class="copy-email" type="button" @click="copyEmail">复制邮箱</button><a :href="asset('杜雨菲_Agent应用开发_简历.pdf')" download>下载简历 ↓</a><a href="https://github.com/yuyuyyyyyyyyyyyy" target="_blank" rel="noreferrer">GitHub ↗</a></div><p class="copy-feedback" role="status">{{ copied }}</p></section>
    </main>
    <footer class="footer shell"><span>© 2026 杜雨菲 · 用作品说话</span><a href="#top">回到顶部 ↑</a><span>DESIGNED TO BE USEFUL.</span></footer>
  </div>
</template>








