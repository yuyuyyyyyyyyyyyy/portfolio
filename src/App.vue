<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'

const openProject = ref(null)
const prismView = ref('fact')
const opsChoice = ref('steady')
const copied = ref('')
const stage = ref(null)
const turning = ref(false)
const progress = ref(0)
const onScroll = () => {
  const doc = document.documentElement
  const max = doc.scrollHeight - window.innerHeight
  progress.value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
}
let observer
let copyTimer
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText('duyufei000@126.com')
    copied.value = '邮箱已复制'
  } catch {
    copied.value = '复制未成功，可点击邮箱直接联系'
  }
  clearTimeout(copyTimer)
  copyTimer = window.setTimeout(() => { copied.value = '' }, 5000)
}
const toggleProject = async id => {
  openProject.value = openProject.value === id ? null : id
  await nextTick()
  if (openProject.value) document.getElementById('detail-' + id)?.scrollIntoView({ behavior: reducedMotion() ? 'instant' : 'smooth', block: 'start' })
}
const moveSculpture = event => {
  if (reducedMotion() || event.pointerType === 'touch' || !stage.value) return
  turning.value = true
  const bounds = stage.value.getBoundingClientRect()
  stage.value.style.setProperty('--turn-x', ((event.clientY - bounds.top) / bounds.height - .5) * -12 + 'deg')
  stage.value.style.setProperty('--turn-y', ((event.clientX - bounds.left) / bounds.width - .5) * 16 + 'deg')
}
const resetSculpture = () => {
  turning.value = false
  stage.value?.style.setProperty('--turn-x', '0deg')
  stage.value?.style.setProperty('--turn-y', '0deg')
}
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  const reveals = document.querySelectorAll('[data-reveal]')
  if (reducedMotion() || !('IntersectionObserver' in window)) {
    reveals.forEach(element => element.classList.add('is-visible'))
    return
  }
  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: .06 })
  reveals.forEach(element => observer.observe(element))
})
onBeforeUnmount(() => {
  observer?.disconnect()
  clearTimeout(copyTimer)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})

const projects = [
  {
    no: '01', id: 'plugin', featured: true, flip: true,
    stack: '浏览器扩展 · 内容脚本 · 大模型 API',
    outcome: '已通过 Microsoft Edge 商店审核并公开上架；未做推广，因此不写用户量与效率提升。',
    title: 'AI Job Radar｜招聘网页内的岗位决策助手',
    status: '已上架 Edge 商店',
    intro: '帮助求职者在浏览招聘岗位时，快速判断硬门槛、职责匹配和是否值得沟通，并根据简历证据生成招呼语。',
    iteration: '第一版是独立岗位管理平台，但“搬入系统—等待分析—返回招聘网站”的流程反而增加操作成本。因此我删除岗位搬运，将产品重构为招聘网页内的浏览器侧边助手。',
    evidence: { task: '在招聘网页中快速判断岗位是否值得沟通。', assumption: '将岗位集中到独立 Dashboard，可以提高分析和管理效率。', tradeoff: '发现岗位搬运增加步骤后，删除独立搜索和搬运流程，将产品嵌入原招聘场景；读取完整 JD 后再判断，并保留用户手动投递。', validation: '核心流程已完成，Edge 商店已上线；下一步验证判断结果是否真正减少岗位筛选成本。' },
    tags: ['个人独立项目', '浏览器扩展', 'Edge 商店已上架', '可查看演示'],
    video: 'media/ai-job-plugin-small.mp4', poster: 'media/ai-job-plugin-poster.jpg',
    primaryLabel: '查看项目复盘', secondaryLabel: '观看演示', secondaryHref: '#demo-plugin',
    detail: [
      ['01 项目概览', '一个嵌入招聘网页的浏览器扩展。目标不是替用户自动投递，而是在不改变原有浏览路径的前提下，减少重复阅读、核对和组织沟通内容的负担。'],
      ['02 使用场景与具体问题', '求职者在招聘网站浏览岗位时，需要打开完整 JD，核对学历、地点、证书和工作年限，对照自己的经历，判断是否值得沟通，再组织招呼语。这些步骤会在每个岗位上重复出现。'],
      ['03 第一版方案', '将岗位采集到独立 Dashboard，再进行集中分析、筛选和投递管理。第一版试图通过统一管理解决信息分散问题。'],
      ['04 第一版为什么不成立', '用户原本就在招聘网站浏览岗位。如果还需要导入 Radar、等待分析、再返回招聘网站沟通，产品没有减少步骤，反而增加了岗位维护和页面切换。'],
      ['05 我做出的关键产品取舍', '删除岗位搬运和独立搜索；改为招聘网页内侧边助手；必须读取完整 JD 而非岗位卡片摘要；先判断硬门槛，再比较核心职责与简历证据；保留手动沟通与投递；暂不做成功率预测。'],
      ['06 最终产品流程', '上传一次简历 → 打开招聘搜索页面 → 点击分析当前页 → 读取完整 JD → 岗位卡片展示行动结论、判断依据和招呼语 → 用户自行决定是否沟通。'],
      ['07 实际完成的功能和当前状态', '已完成简历信息读取、完整 JD 获取、硬门槛判断、职责与简历证据匹配、三档行动建议和可编辑招呼语；扩展已通过 Microsoft Edge 商店审核并公开上架。'],
      ['08 验证、反馈与迭代', '当前证据来自真实可运行流程、商店审核和持续自用测试。尚未积累规模化用户数据，因此不写用户数量或效率提升比例；现阶段重点观察分析依据是否足够清楚。'],
      ['09 当前限制与下一步', '页面解析依赖招聘网站结构，网站改版可能影响部分功能。下一步优先验证分析结论是否真正减少岗位判断成本，而不是继续增加功能。'],
      ['10 技术实现与项目链接', '浏览器扩展结合页面内容脚本、完整 JD 解析、简历信息与大模型结构化输出；扩展权限和平台风控共同决定了“页面内辅助、用户手动确认”的产品形态。']
    ]
  },
  {
    no: '02', id: 'prism',
    stack: 'Next.js · TypeScript · 结构化输出约束',
    outcome: '已上线，可在线完成一次从事件描述到结构化输出的完整流程。',
    title: '多棱镜｜人生事件多角度解释工具',
    status: '已上线 · 可在线体验',
    intro: '针对用户容易陷入单一归因的问题，将一件困扰人的事情拆分为“事实、不同解释、下一步验证”，帮助用户区分已经发生的事实和暂时无法确认的推测。',
    iteration: '没有把产品做成普通的安慰式聊天工具，而是限制 AI 区分事实与推测，并为不同解释提供可以继续验证的方向。',
    evidence: { task: '面对一件困扰自己的事情时，区分事实、猜测和可以继续验证的信息。', assumption: '多提供几个解释，就能帮助用户走出单一归因。', tradeoff: '不让 AI 直接给出“最可能的真相”，而是强制区分事实与推测，并为不同解释提供下一步验证方向。', validation: '产品已上线，可完成完整输入和结构化输出流程；下一步观察用户能否真正理解事实与推测的区别。' },
    tags: ['AI 输出结构设计', '个人独立项目', '可在线体验'],
    video: 'media/multi-prism-small.mp4', poster: 'media/multi-prism-poster.jpg',
    primaryLabel: '查看项目说明', secondaryLabel: '在线体验', secondaryHref: 'https://deluxe-cheesecake-203e56.netlify.app/', external: true,
    detail: [
      ['01 项目概览', '一个帮助用户重新组织困扰事件的 AI 工具，不替用户判断人生，也不把模型生成的解释包装成事实。'],
      ['02 使用场景与具体问题', '人在不确定关系或事件中容易把感受直接当作事实，并快速落入“只有这一种原因”的单一归因。'],
      ['03 第一版方案', '让模型直接分析事件原因并给出建议，输出接近常见的对话式 AI。'],
      ['04 第一版存在的问题', '直接分析容易产生武断推测；安慰式语言虽然顺耳，却没有帮助用户区分已知信息与未知信息。'],
      ['05 我做出的关键产品取舍', '不追求唯一答案；把输出限定为事实、多个解释和下一步验证；弱化安慰话术；明确模型能力边界。'],
      ['06 最终产品流程', '描述事件 → 分离可确认事实 → 生成多种可能解释 → 标注不确定性 → 给出可继续观察或验证的动作。'],
      ['07 实际完成的功能和当前状态', '已完成前端、模型接口、结构化输出和在线部署，可直接打开体验。'],
      ['08 验证、反馈与迭代', '重点检查模型是否把推测写成事实、解释是否重复、下一步是否可执行，并据此持续调整提示词和输出约束。'],
      ['09 当前限制与下一步', '模型解释不等于事实，也不能替代专业心理支持；下一步应继续验证不同用户是否能理解“可能解释”的边界。'],
      ['10 技术实现与项目链接', '使用 Next.js、TypeScript、大模型接口与结构化输出约束，在线版本提供完整核心流程。']
    ]
  },
  {
    no: '03', id: 'mudanting', flip: true,
    stack: 'React · TypeScript · 检索式阅读',
    outcome: '已上线，面向高一学生的古典戏曲互动阅读，可直接在线打开。',
    title: '牡丹亭｜由文字重新展开的互动阅读',
    status: '已上线 · 可在线体验',
    intro: '围绕《牡丹亭·惊梦·皂罗袍》制作互动阅读场景，让“原来—姹紫嫣红—似这般—断井颓垣”不只被解释，也通过层层展开的交互、节奏与视觉被感受。',
    iteration: '没有把它做成古诗词百科或一次性展示页，而是缩小到一句文本：先保留原文的阅读节奏，再让词义、画面与情绪逐层出现，验证数字媒介能否帮助人重新进入经典文本。',
    evidence: { task: '让不熟悉昆曲的读者，也能从一句原文进入《牡丹亭》的情绪与意象。', assumption: '增加释义和视觉效果，就能降低经典文本的理解门槛。', tradeoff: '不堆叠背景知识和功能；围绕一句“皂罗袍”设计分层阅读，把解释放在交互之后，并保留返回原文的路径。', validation: '完整互动流程已实现并公开上线，可在线体验；目前验证的是表达与交互闭环，尚无规模化用户数据。' },
    tags: ['互动叙事', '创意开发', '个人独立项目', '可在线体验'],
    poster: 'media/mudanting-youyuan.png',
    primaryLabel: '查看创作复盘', secondaryLabel: '在线体验', secondaryHref: 'https://yuyuyyyyyyyyyyyy.github.io/mudanting-jingmeng/', external: true,
    detail: [
      ['01 项目概览', '一个围绕《牡丹亭》第十出“惊梦”中《皂罗袍》一句展开的互动阅读实验。它尝试让文字从书页中缓慢浮起，成为可以被观看、触碰和理解的阅读过程。'],
      ['02 我想解决的问题', '经典文本常被压缩为注释、译文和知识点；读者可能理解了字面，却没有进入句子的节奏、转折和情绪。'],
      ['03 最初假设', '只要加入足够丰富的释义、画面和动效，就能让文本更容易理解。'],
      ['04 方案为什么收缩', '信息越多不一定越接近文本。因此项目最终只围绕一句“原来姹紫嫣红开遍，似这般都付与断井颓垣”组织体验。'],
      ['05 关键设计取舍', '先显示原文，再以“原来”和“姹紫嫣红”为交互入口；释义、情绪和游园画卷逐层出现；读者可以略过展开，也可以合上释义回到原文。'],
      ['06 实际完成的内容', '已完成折叠书页、原文层、词义层、情绪层、游园画卷及完整状态切换，并为键盘操作和可访问标签保留入口。'],
      ['07 当前验证边界', '项目已公开上线并可完成完整流程，但它仍是个人创作实验；没有用户规模、学习效果或商业结果数据。'],
      ['08 技术与创作方式', '使用 React、TypeScript 与 CSS 动效实现。AI帮助跨越视觉、交互和代码实现边界，具体阅读结构、内容取舍和迭代判断由我完成。']
    ]
  },
  {
    no: '04', id: 'ops', supporting: true,
    stack: '微信小程序 · 状态模型 · 分支逻辑',
    outcome: '微信小程序已上线，含 7 条分支可通过小程序码体验完整章节。',
    title: '探索运营｜内容平台运营策略推演小程序',
    status: '微信小程序已上线',
    intro: '将平台限流、热点变化、公众情绪、内容管控和商业化压力等抽象机制，转化为可以体验和决策的章节式微信小程序。',
    iteration: '第一版发布后，体验者反馈不容易理解玩法，因此重新修改了新手引导、任务说明和反馈文案，降低首次体验的理解成本。',
    evidence: { task: '通过具体选择理解内容平台中的流量、信任、风险和商业化取舍。', assumption: '只要规则和事件足够完整，用户就能理解玩法。', tradeoff: '第一版用户不容易理解目标和选择后果，因此重做新手引导、任务说明与即时反馈，而不是继续增加更多事件。', validation: '微信小程序已上线，可以直接体验完整章节流程。' },
    tags: ['微信小程序', '已上线', '可直接体验', '个人独立项目'],
    video: 'media/explore-ops-small.mp4', poster: 'media/explore-ops-poster.jpg', shot: 'media/explore-ops-search.jpg', qr: 'media/explore-ops-miniprogram-code.jpg',
    primaryLabel: '查看项目复盘', secondaryLabel: '立即体验', secondaryHref: '#ops-qr',
    detail: [
      ['01 项目概览', '一款章节式运营策略推演小程序，让用户通过内容选择、平台反馈和状态变化理解运营决策。'],
      ['02 使用场景与具体问题', '内容平台的流量机制、公众情绪、内容管控和变现压力较抽象，新手很难理解选择与结果之间的关系。'],
      ['03 第一版方案', '将多个运营变量放进剧情分支，通过发布内容和选择策略推动结果变化。'],
      ['04 第一版存在的问题', '首版虽然流程可运行，但目标、状态和结果之间的关系解释不足，体验者反馈不容易理解玩法。'],
      ['05 我做出的关键产品取舍', '保留章节式决策结构；减少首次进入时的信息量；补充新手目标、任务说明、状态解释和结果反馈。'],
      ['06 最终产品流程', '进入章节 → 理解当前目标 → 选择内容与策略 → 接收平台和用户反馈 → 观察状态变化 → 进入下一次决策。'],
      ['07 实际完成的功能和当前状态', '约一周完成首版，测试正常、失败和边界共 7 条分支；微信小程序目前在线，可通过页面中的小程序码直接体验。'],
      ['08 验证、反馈与迭代', '根据“看不懂玩法”的实际反馈，重做新手引导、任务说明和反馈文案。这里记录的是具体问题与修改，不虚构留存或增长数据。'],
      ['09 当前限制与下一步', '当前主要验证流程完整性和可理解性，尚未建立留存、完成率等长期指标；下一步应先观察新手能否独立完成首个章节。'],
      ['10 技术实现与项目链接', '使用微信小程序实现章节、状态模型和分支逻辑；页面提供真实小程序码与完整演示视频。']
    ]
  }
]

const asset = (p) => import.meta.env.BASE_URL + p

const process = [
  ['01', '发现真实问题', 'AI Job Radar：求职者缺的不是另一个岗位库，而是浏览岗位时的即时判断。'],
  ['02', '缩小产品范围', '删除岗位采集、独立搜索和复杂成功率预测，先验证是否值得沟通。'],
  ['03', '做出可运行版本', '把浏览器扩展、AI 应用、互动阅读和微信小程序真正做出来，而不是只停留在原型图。'],
  ['04', '根据限制继续重构', '根据真实体验重构 Radar，根据用户反馈修改探索运营，也在《牡丹亭》中收缩信息、保留阅读节奏。']
]

// 作品类型筛选用；顺序即筛选条顺序
const categories = [
  ['all', '全部'],
  ['plugin', '浏览器扩展'],
  ['prism', 'AI 应用'],
  ['mudanting', '互动阅读'],
  ['ops', '微信小程序'],
  ['agent', '本地 Agent']
]
const filter = ref('all')

// 首屏事实条：数字由作品数据数出，不手写。本地自用 = 下方 Agent 卡 1 个
const shippedCount = projects.filter(p => /已上线|已上架/.test(p.status)).length
const heroFacts = [
  ['作品', String(projects.length + 1).padStart(2, '0')],
  ['已上线 / 上架', String(shippedCount).padStart(2, '0')],
  ['本地自用', '01']
]

// 这个站点的迭代记录，取自 ISSUES.md 里真实发生过的事
const siteLog = [
  ['09-18', '视觉重设计：暖纸色、橙色环结、混合项目版式'],
  ['09-19', '手机端导航、字体加载、减少动效三处修复'],
  ['09-20', '环结改为按几何计算明暗，手写 SVG 生成器'],
  ['09-20', '新增「方法」段落、栏目索引与滚动进度']
]

// 首屏与作品之间的刻度带；条目全部取自 About 的能力行与各项目 stack，不新增说法
const tickerKeys = [
  '问题拆解', '用户流程', '原型与交互', 'AI 输出规则', '需求优先级', '版本复盘',
  '浏览器扩展', '微信小程序', '大模型 API', '结构化输出', 'UI Automation', 'SQLite'
]
</script>

<template>
  <div class="studio">
    <a class="skip-link" href="#work">跳到作品</a>
    <div class="read-progress" :style="{ transform: 'scaleX(' + progress + ')' }" aria-hidden="true"></div>
    <header class="masthead">
      <a class="wordmark" href="#top" aria-label="杜雨菲，回到首页">雨<span class="logo-dot">.</span><small>DU YUFEI<br>PRODUCT & CODE</small></a>
      <nav aria-label="主导航"><a href="#work">作品 <sup>05</sup></a><a href="#process">方法</a><a href="#about">关于我</a><a class="nav-contact" href="#contact">聊聊想法 <span>↗</span></a></nav>
    </header>

    <main>
      <section id="top" class="hero"><div class="dots d-hero" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        <div class="hero-topline"><span><i class="status-dot"></i> OPEN TO WORK · 武汉 / 北京</span></div>
        <div class="hero-grid">
          <div class="hero-copy">
            <p class="tiny-label">你好，我是杜雨菲 / AI 产品与应用</p>
            <h1>保持好奇。<br>把想法<span class="last-line">做<span class="hand-circle">出来<svg viewBox="0 0 240 112" aria-hidden="true"><path d="M225 27C195 4 58-1 21 33S-3 94 111 101 247 54 225 27M219 22C184 5 49 12 17 44"/></svg></span><span class="orange-dot">。</span></span></h1>
            <div class="hero-bottom">
              <p>做产品，也把它写成代码。<br>我从真实的小问题出发，<br>让 AI 走进可以使用的日常。</p>
              <a class="round-link" href="#work" aria-label="向下浏览我的作品"><span>探索作品</span><b>↘</b></a>
            </div>
          </div>
          <div class="slipwall" aria-hidden="true">
            <template v-for="step in process" :key="'s' + step[0]"><div class="slip"><b>{{ step[0] }}</b><span>{{ step[1] }}</span></div></template>
            <template v-for="project in projects" :key="'p' + project.id"><div class="slip slip-p"><span>{{ project.title.split('｜')[0] }}</span><em>{{ project.status }}</em></div></template>
            <div class="slip slip-a"><span>一个真实问题</span></div>
            <div class="slip slip-b"><span>一个可运行的答案</span></div>
            <div class="slip slip-f"><span>2025 届 · 计算机科学与技术</span></div>
            <div class="slip slip-f"><span>AI 产品经理 / 产品助理</span></div>
            <div class="slipwall-note"><span>IDEA ↔ REALITY</span></div>
          </div>
        </div>
        <div class="hero-footer"><span>AI 产品经理 / 产品助理 · AI 应用与 Agent 开发<br>计算机科学与技术本科 · 独立产品实践</span><dl class="hero-facts"><template v-for="fact in heroFacts" :key="fact[0]"><dt>{{ fact[0] }}</dt><dd>{{ fact[1] }}</dd></template></dl><a :href="asset('杜雨菲_AI产品助理_简历.pdf')" download>下载我的简历 ↗</a></div>
      </section>

      <div class="ticker" aria-hidden="true"><div class="ticker-track"><span v-for="n in 2" :key="n" class="ticker-set"><i v-for="k in tickerKeys" :key="k">{{ k }}</i></span></div></div>

      <section id="work" class="works"><div class="dots d-works" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        <div class="section-rule"><span>作品</span><span>01 / 04</span></div>
        <header class="section-heading" data-reveal><div><span class="tiny-label">SELECTED WORK / 01—05</span><h2>一些想法，<em>已经发生。</em></h2></div><p>可以打开，可以体验。<br>也可以看看，我为什么这样做。</p></header>
        <div class="works-filter" role="group" aria-label="按类型筛选作品"><span class="tiny-label">筛选</span><button v-for="c in categories" :key="c[0]" :aria-pressed="filter === c[0]" @click="filter = c[0]">{{ c[1] }}</button></div>
        <div class="project-grid">
          <article v-for="project in projects" v-show="filter === 'all' || filter === project.id" :key="project.id" :id="project.id" class="project-card" :class="'project-' + project.id" data-reveal>
            <div class="project-cover" :id="'demo-' + project.id">
              <div class="cover-label"><span>{{ project.id === 'plugin' ? '01 / BROWSER EXTENSION' : project.id === 'prism' ? '02 / AI APPLICATION' : project.id === 'mudanting' ? '03 / INTERACTIVE READING' : '04 / WECHAT MINI PROGRAM' }}</span><span>↗</span></div>
              <template v-if="project.id === 'plugin'">
                <div class="radar-title"><span>AI Job Radar</span><p>把判断，放回工作现场。</p></div>
                <div class="browser-frame"><div class="browser-chrome"><i></i><i></i><i></i><span>AI Job Radar / 产品演示</span></div><video :src="asset(project.video)" :poster="asset(project.poster)" controls preload="none" playsinline aria-label="AI Job Radar 产品演示"></video></div>
                <span class="cover-caption">招聘网页内的岗位决策助手 <b>EDGE 商店已上架 ↗</b></span>
              </template>
              <template v-else-if="project.id === 'prism'">
                <span class="prism-orbit orbit-one" aria-hidden="true"></span><span class="prism-orbit orbit-two" aria-hidden="true"></span>
                <div class="prism-preview"><span class="tiny-label">换个角度，看看这件事。</span><h3>“他没有回复我。”</h3><div class="segmented" aria-label="选择分析角度"><button v-for="(label, key) in {fact:'事实', possibility:'不同解释', verify:'下一步'}" :key="key" :aria-pressed="prismView === key" @click="prismView = key">{{ label }}</button></div><p class="prism-answer" aria-live="polite">{{ prismView === 'fact' ? '消息已经发出。目前，还没有收到回复。' : prismView === 'possibility' ? '可能在忙、没看到，或还不知道如何回应。解释并不只有一种。' : '等待一个合理时间，再观察其他行为。先别急着认定原因。' }}</p><p class="prism-next"><span>下一步</span>{{ prismView === 'fact' ? '分清哪些是已确认的事，哪些还只是推测。' : prismView === 'possibility' ? '挑一个解释，找一件能验证它的小事。' : '设定一个期限；到期仍无回复，就把它当作信息。' }}</p></div>
                <span class="cover-caption">多棱镜 <b>FACT / POSSIBILITY / ACTION</b></span>
              </template>
              <template v-else-if="project.id === 'mudanting'">
                <img class="reading-image" :src="asset(project.poster)" loading="lazy" alt="牡丹亭互动阅读的游园画卷">
                <div class="reading-overlay"><span>一场由文字展开的游园</span><h3>原来姹紫<br>嫣红开遍。</h3><a :href="project.secondaryHref" target="_blank" rel="noreferrer">入园，读一出戏 ↗</a></div>
              </template>
              <template v-else>
                <div class="ops-preview"><p class="tiny-label">探索运营 / 第 03 章</p><h3>流量，还是信任？</h3><p>热点突然出现。你的选择，会改变接下来的故事。</p><div class="ops-meters"><div><span>关注度</span><b>{{ opsChoice === 'trend' ? '+24' : '+8' }}</b></div><div><span>信任度</span><b>{{ opsChoice === 'trend' ? '−6' : '+12' }}</b></div><div><span>平台风险</span><b>{{ opsChoice === 'trend' ? '上升' : '稳定' }}</b></div></div><div class="segmented"><button :aria-pressed="opsChoice === 'trend'" @click="opsChoice = 'trend'">追赶热点 ↗</button><button :aria-pressed="opsChoice === 'steady'" @click="opsChoice = 'steady'">坚持内容 →</button></div><p class="ops-feedback" aria-live="polite"><span>平台反馈</span>{{ opsChoice === 'trend' ? '热点带来了曝光，但部分老读者开始质疑你的立场。' : '数据保持平稳，但这条热点的窗口正在关闭。' }}</p><div class="ops-branches"><span>剧情分支</span><i v-for="n in 7" :key="n" :class="{ on: n <= 3 }"></i><b>03 / 07</b></div></div>
                <span class="cover-caption">每一次选择，都有回响。<b>WECHAT MINI PROGRAM</b></span><div class="ops-qr"><img :src="asset('media/explore-ops-miniprogram-code.jpg')" loading="lazy" alt="探索运营微信小程序码"><span>微信扫码体验</span></div>
              </template>
            </div>
            <div class="project-info"><span class="project-no">{{ project.no }}</span><div><span class="project-kind">{{ project.status }}</span><h3>{{ project.title.split('｜')[0] }}</h3><p>{{ project.title.split('｜')[1] }}</p><p class="project-outcome">{{ project.outcome }}</p><p class="project-stack">{{ project.stack }}</p></div><button class="project-open" :aria-label="(openProject === project.id ? '收起' : '查看') + project.title.split('｜')[0] + '项目复盘'" :aria-expanded="openProject === project.id" :aria-controls="'detail-' + project.id" @click="toggleProject(project.id)">{{ openProject === project.id ? '−' : '↗' }}</button></div>
            <section v-if="openProject === project.id" :id="'detail-' + project.id" class="case-detail">
              <p class="tiny-label">BEHIND THE PROJECT</p><h4>为什么做，又为什么改变。</h4><p>{{ project.intro }}</p><p class="case-tags"><span v-for="t in project.tags" :key="t">{{ t }}</span></p><div class="case-assume"><span>最初假设</span><p>{{ project.evidence.assumption }}</p></div><div class="case-insight"><span>一次关键取舍</span><p>{{ project.iteration }}</p></div>
              <div class="case-details"><details v-for="item in project.detail" :key="item[0]"><summary>{{ item[0] }} <span>＋</span></summary><p>{{ item[1] }}</p></details></div>
              <figure class="case-figure"><img :src="asset(project.shot || project.poster)" loading="lazy" :alt="project.title.split('｜')[0] + ' 的产品画面'"><figcaption>{{ project.id === 'plugin' ? 'AI Job Radar：在招聘网页中给出判断结果的实际界面' : project.id === 'prism' ? '多棱镜：事实 → 多种解释 → 下一步的完整流程' : project.id === 'mudanting' ? '《牡丹亭》互动阅读的游园画卷' : '探索运营小程序：在微信搜索中可直接检索到' }}</figcaption></figure>
              <video v-if="project.video && project.id !== 'plugin'" :src="asset(project.video)" :poster="asset(project.poster)" controls preload="none" playsinline :aria-label="project.title.split('｜')[0] + '演示视频'"></video>
              <div v-if="project.qr" id="ops-qr" class="qr-entry"><img :src="asset(project.qr)" alt="探索运营微信小程序码"><p>微信扫码<br>体验探索运营</p></div>
              <div class="case-links"><a v-if="project.id === 'plugin'" href="https://microsoftedge.microsoft.com/addons/detail/aidmlojjjgebhogkffbebnfpjhfbpfmm" target="_blank" rel="noreferrer">打开 Edge 商店 ↗</a><a v-else-if="project.external" :href="project.secondaryHref" target="_blank" rel="noreferrer">打开在线作品 ↗</a><span>{{ project.evidence.validation }}</span></div>
            </section>
          </article>
        </div>
      </section>

      <section class="agent-section" v-show="filter === 'all' || filter === 'agent'"><article id="agent" class="agent-project" data-reveal>
            <div class="agent-copy"><span class="tiny-label">05 / LOCAL AGENT · 持续自用</span><h3>让重复的事，<br>有一个<span>可靠的帮手。</span></h3><p>求职 Agent / 从岗位阅读、判断到发送核验，<br>把真实使用里的问题，一次次写进系统。</p><a href="mailto:duyufei000@126.com?subject=求职Agent演示">聊聊这个项目 <span>↗</span></a><small>本地运行 · 代码未公开 · 持续迭代</small></div>
            <div class="terminal"><div class="terminal-head"><span><i></i> LOCAL AGENT</span><span>流程示意 / 非实时数据</span></div><div class="terminal-body"><p><span>01</span> READ <b>读取完整岗位信息</b></p><p><span>02</span> CHECK <b>核对门槛与个人经历</b></p><p><span>03</span> VERIFY <b>确认岗位与聊天对象</b></p><p class="terminal-stop"><span>!</span> RESULT UNKNOWN<br><strong>停止本轮，保留记录。<br>等待核实，禁止自动重发。</strong></p><p class="terminal-prompt">› <i></i></p></div><div class="terminal-foot">PYTHON <span>·</span> UI AUTOMATION <span>·</span> SQLITE</div></div>
          </article></section>

      <section id="process" class="process-section"><div class="dots d-process" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        <div class="section-rule"><span>方法</span><span>02 / 04</span></div>
        <div class="process-head" data-reveal><span class="tiny-label">HOW I WORK</span><h2>我如何把产品判断，<br>落到真实版本里。</h2><p>每一步都由一个具体项目推动，而不是先写好方法论再去找项目。</p></div>
        <ol class="process-list"><li v-for="step in process" :key="step[0]" data-reveal><span class="process-no">{{ step[0] }}</span><h3>{{ step[1] }}</h3><p>{{ step[2] }}</p></li></ol>
      </section>

      <section id="about" class="about-section" data-reveal><div class="dots d-about" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        <div class="section-rule"><span>关于</span><span>03 / 04</span></div>
        <div class="about-title"><span class="tiny-label">THE PERSON BEHIND THE PRODUCTS</span><h2>先问为什么。<br>再试着<span>做出来。</span></h2><span class="about-star" aria-hidden="true">✳</span><figure class="about-photo"><img :src="asset('photo.jpg')" alt="杜雨菲" loading="lazy" width="1040" height="1456"><figcaption><span>杜雨菲</span><span>2026</span></figcaption></figure><div class="about-log"><span class="tiny-label">这个站点</span><dl><template v-for="row in siteLog" :key="row[0] + row[1]"><dt>{{ row[0] }}</dt><dd>{{ row[1] }}</dd></template></dl></div></div>
        <div class="about-copy"><p class="about-lead">我是杜雨菲，计算机科学与技术本科。<br>喜欢在产品判断与动手实现之间，<br>寻找那个更有用的答案。</p><p>我独立推进问题定义、交互、代码和上线，也会因为真实使用的反馈改变方案。比如把求职助手从独立平台搬回招聘网页，把抽象的运营机制变成可体验的选择。</p><div class="about-facts"><div><span>教育</span><p>长江师范学院 · 计算机科学与技术（本科）｜2020.09 – 2025.06<br>“1+2+1”联合培养：大二、大三赴山东科技大学（青岛校区）交换近两年<br>大一专业排名第 4 · 优异奖学金 · CET-4<br>毕业设计：基于微服务架构的餐饮店原材料管理系统（独立前后端开发）</p></div><div><span>方向</span><p>AI 产品经理 / 产品助理<br>AI 应用与 Agent 开发</p></div><div><span>产品</span><p>问题拆解、用户流程、原型与交互<br>AI 输出规则、需求优先级、版本复盘</p></div><div><span>技术</span><p>Python、TypeScript、Vue、React / Next.js<br>浏览器扩展、大模型 API、SQLite 与 Git</p></div></div><div class="about-jobs"><span class="tiny-label">工作与项目经历</span><dl><dt>2024.08–2024.11</dt><dd>前端开发实习生 · 近未来（武汉）科技有限公司<br>实地参与真实项目开发流程，补全前端工程能力（HTML / CSS / JS、微信小程序、Next.js）；养成先想清楚再动手、用工程化方式保证质量的习惯。</dd><dt>2021.09–2023.01</dt><dd>卓越工程师项目 · 计算机专业负责人｜长江师范学院 × 山东科技大学<br>对接两校课程与学分体系，协助老师整理成绩、通知选课、收集转达同学问题，保障跨校学分转换顺畅。</dd></dl></div></div>
      </section>

      <section id="contact" class="contact-section" data-reveal><div class="dots d-contact" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="section-rule"><span>联系</span><span>04 / 04</span></div><div class="contact-top"><span class="tiny-label">HAVE SOMETHING IN MIND?</span><span><i class="status-dot"></i> 开放工作与合作机会</span></div><a class="contact-title" href="mailto:duyufei000@126.com">下一个想法，<br>一起<span>发生。</span><b>↗</b></a><div class="contact-bottom"><div><a href="mailto:duyufei000@126.com">duyufei000@126.com</a><button @click="copyEmail">复制邮箱 ↗</button></div><div><a :href="asset('杜雨菲_AI产品助理_简历.pdf')" download>下载简历 ↗</a><a href="https://github.com/yuyuyyyyyyyyyyyy" target="_blank" rel="noreferrer">GitHub ↗</a></div></div><p class="copy-feedback" role="status">{{ copied }}</p></section>
    </main>
    <footer class="footer"><div class="dots d-footer" aria-hidden="true"><i></i><i></i></div><span>© 2026 杜雨菲</span><span class="footer-note">MADE WITH CURIOSITY & CODE.</span><span class="colophon">字体 Noto Serif SC · 手写 SVG 图形与动效 · 最后更新 2026-09</span><a href="#top">回到顶部 ↑</a></footer>
  </div>
</template>










