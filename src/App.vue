<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { copyContact, motionBehavior } from './interactions'

const openProject = ref(null)
const radarView = ref('before')
const prismView = ref('fact')
const opsChoice = ref('steady')
const copied = ref('')
let revealObserver
let copyTimer
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
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
onMounted(() => {
  if (reducedMotion() || !('IntersectionObserver' in window)) return
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('arrived')
        revealObserver.unobserve(entry.target)
      }
    })
  }, { threshold: 0.08 })
  document.querySelectorAll('.home-project, .section-head, .education-three article, .lab-card').forEach(el => revealObserver.observe(el))
})
onBeforeUnmount(() => { revealObserver?.disconnect(); clearTimeout(copyTimer) })

const projects = [
  {
    no: '01', id: 'plugin', featured: true,
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
    no: '03', id: 'ops', supporting: true,
    title: '探索运营｜内容平台运营策略推演小程序',
    status: '微信小程序已上线',
    intro: '将平台限流、热点变化、公众情绪、内容管控和商业化压力等抽象机制，转化为可以体验和决策的章节式微信小程序。',
    iteration: '第一版发布后，体验者反馈不容易理解玩法，因此重新修改了新手引导、任务说明和反馈文案，降低首次体验的理解成本。',
    evidence: { task: '通过具体选择理解内容平台中的流量、信任、风险和商业化取舍。', assumption: '只要规则和事件足够完整，用户就能理解玩法。', tradeoff: '第一版用户不容易理解目标和选择后果，因此重做新手引导、任务说明与即时反馈，而不是继续增加更多事件。', validation: '微信小程序已上线，可以直接体验完整章节流程。' },
    tags: ['微信小程序', '已上线', '可直接体验', '个人独立项目'],
    video: 'media/explore-ops-small.mp4', poster: 'media/explore-ops-poster.jpg', qr: 'media/explore-ops-miniprogram-code.jpg',
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
  ['03', '做出可运行版本', '将三个想法分别落地为浏览器扩展、AI 应用和微信小程序，而不是只停留在原型图。'],
  ['04', '根据使用问题迭代', '根据真实体验，重构 Radar 的产品形态，修改探索运营的新手引导。']
]
</script>

<template>
  <div class="site-shell">
    <a class="skip-link" href="#work">跳到项目内容</a>
    <nav class="nav shell">
      <a class="brand" href="#top"><span>雨<span class="brand-dot">.</span></span><b>杜雨菲 <small>PRODUCT & CODE</small></b></a>
      <div class="nav-links"><a href="#work">代表项目</a><a href="#process">工作方式</a><a href="#education">教育与技能</a><a class="nav-cta" href="mailto:duyufei000@126.com">联系我</a></div>
    </nav>

    <main id="top">
      <section class="hero shell job-hero">
        <div class="hero-copy">
          <p class="eyebrow"><i></i>开放工作机会 <span>武汉 / 北京</span></p>
          <p class="hero-index">杜雨菲的个人产品实验室 / 2026</p>
          <h1>让想法落地。<br>让 AI <em>真正有用。</em></h1>
          <p class="lead">你好，我是杜雨菲。计算机本科，做产品，也写代码。<br>我把日常里反复遇到的问题，做成可以使用的 AI 应用——<br>从第一版原型，到上线，再到真实使用中的修正。</p>
          <div class="actions"><a class="button primary" href="#work">探索我的作品 <span>↘</span></a><a class="button" :href="asset('杜雨菲_AI产品助理_简历.pdf')" download>下载简历 ↗</a></div>
          <p class="hero-footnote">AI 应用 / Agent 开发 <span>·</span> 技术产品助理</p>
        </div>
        <aside class="hero-product" aria-label="精选项目 AI Job Radar">
          <div class="studio-label"><span>FROM IDEA TO REALITY</span><span>01 / FEATURED</span></div>
          <div class="orbital-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><span class="orbit-center">做<span>出来。</span></span><span class="orbit-note note-one">DEFINE</span><span class="orbit-note note-two">BUILD</span><span class="orbit-note note-three">VERIFY</span></div>
          <a class="hero-preview" href="#plugin"><img :src="asset('media/ai-job-plugin-poster.jpg')" alt="AI Job Radar 真实产品界面"><div><small>已上架 EDGE 商店</small><b>AI Job Radar <span>↗</span></b></div></a>
          <span class="studio-caption">不是停在原型。是把它用起来。</span>
        </aside>
      </section>
      <div class="discipline-strip shell"><span>从问题出发，经过代码，回到使用者。</span><span>PRODUCT THINKING <i>✳</i> AI APPLICATIONS <i>✳</i> CREATIVE CODING</span></div>

      <section id="work" class="section shell work-home">
        <header class="section-head"><div><p class="kicker">01 / SELECTED WORK</p><h2>把问题，<br>做成作品<span class="accent">。</span></h2></div><p>每个项目都从一个具体困扰开始。<br>这里有可体验的产品，也有我改变主意的过程。</p></header>

        <article v-for="project in projects" :key="project.id" :id="project.id" class="home-project" :class="{ featured: project.featured, supporting: project.supporting }">
          <div class="card-copy">
            <div class="card-top"><span>{{ project.no }}</span><p><i></i>{{ project.status }}</p></div>
            <h3 class="project-name">{{ project.title.split('｜')[0] }}</h3><p class="project-subtitle">{{ project.title.split('｜')[1] }}</p>
            <p class="project-intro">{{ project.intro }}</p>
            <div class="iteration"><b>核心产品迭代</b><p>{{ project.iteration }}</p></div>
            <div v-if="project.featured" class="radar-switch" aria-label="AI Job Radar 产品迭代对比">
              <div class="switch-tabs" aria-label="对比产品方案"><button type="button" :aria-pressed="radarView === 'before'" :class="{ active: radarView === 'before' }" @click="radarView = 'before'">第一版方案</button><button type="button" :aria-pressed="radarView === 'after'" :class="{ active: radarView === 'after' }" @click="radarView = 'after'">重构后方案</button></div>
              <div v-if="radarView === 'before'" class="flow-panel"><b>第一版</b><p>浏览招聘网站 → 搬入 Radar → 等待分析 → 返回招聘网站 → 手动沟通</p><span>问题：增加页面切换和岗位维护成本。</span></div>
              <div v-else class="flow-panel improved"><b>重构后</b><p>浏览招聘网站 → 页面内获得判断 → 决定是否沟通</p><span>结果：不改变用户原有使用场景。</span></div>
              <strong class="decision-proof">我不是因为第一版无法实现而改变方案，而是因为它已经能运行，却没有真正减少用户成本。</strong>
            </div>
            <div class="card-tags"><span v-for="tag in project.tags" :key="tag">{{ tag }}</span></div>
            <div class="card-actions"><button class="button primary" type="button" @click="toggleProject(project.id)" :aria-expanded="openProject === project.id">{{ openProject === project.id ? '收起项目复盘' : project.primaryLabel }}</button><a class="button" :href="project.secondaryHref" :target="project.external ? '_blank' : null" :rel="project.external ? 'noreferrer' : null">{{ project.secondaryLabel }}</a><a v-if="project.id === 'plugin'" class="button store-button" href="https://microsoftedge.microsoft.com/addons/detail/aidmlojjjgebhogkffbebnfpjhfbpfmm" target="_blank" rel="noreferrer">下载 Edge 插件</a></div>
          </div>

          <div class="card-media mechanism-media" :id="`demo-${project.id}`">
            <template v-if="project.id === 'plugin'"><div class="video-head"><div><span>真实产品界面</span><b>从完整 JD 生成行动判断</b></div><small>{{ project.status }}</small></div><video :src="asset(project.video)" :poster="asset(project.poster)" controls preload="metadata" playsinline :aria-label="`${project.title} 演示视频`"></video></template>
            <div v-else-if="project.id === 'prism'" class="prism-mechanism"><span class="mechanism-label">输入事件</span><h4>“他没有回复我。”</h4><div class="mechanism-tabs"><button :class="{active: prismView === 'fact'}" @click="prismView = 'fact'">事实</button><button :class="{active: prismView === 'possibility'}" @click="prismView = 'possibility'">不同解释</button><button :class="{active: prismView === 'verify'}" @click="prismView = 'verify'">下一步验证</button></div><p v-if="prismView === 'fact'"><b>可以确认：</b>消息已发出，目前没有收到回复。</p><p v-else-if="prismView === 'possibility'"><b>还有可能：</b>正在忙、没有看到、不知道如何回应，或暂时不想回复。</p><p v-else><b>可以验证：</b>等待一个合理时间，再通过其他行为观察关系，而不是立即认定原因。</p></div>
            <div v-else class="ops-mechanism"><span class="mechanism-label">第 03 章 · 流量波动</span><h4>热点突然出现，你会怎么选？</h4><div class="ops-stats"><p><b>关注度</b><i>{{ opsChoice === 'trend' ? '+24' : '+8' }}</i></p><p><b>信任度</b><i>{{ opsChoice === 'trend' ? '-6' : '+12' }}</i></p><p><b>平台风险</b><i>{{ opsChoice === 'trend' ? '上升' : '稳定' }}</i></p></div><div class="ops-actions"><button :class="{active: opsChoice === 'trend'}" @click="opsChoice = 'trend'">立即追热点</button><button :class="{active: opsChoice === 'steady'}" @click="opsChoice = 'steady'">坚持垂直内容</button></div><div id="ops-qr" class="qr-entry"><img :src="asset(project.qr)" alt="探索运营微信小程序码"><div><b>微信扫码体验</b><p>小程序目前在线。</p></div></div></div>
          </div>

          <section v-if="openProject === project.id" :id="`detail-${project.id}`" class="case-detail">
            <header><p class="kicker">项目详情</p><h3 class="project-name">{{ project.title.split('｜')[0] }}</h3><p class="project-subtitle">{{ project.title.split('｜')[1] }}</p></header>
            <div class="detail-grid"><details v-for="(section, index) in project.detail" :key="section[0]" :open="index === 0"><summary><span>{{ section[0] }}</span><i aria-hidden="true">展开</i></summary><p>{{ section[1] }}</p></details></div>
            <div v-if="project.id !== 'plugin'" class="detail-video"><p class="kicker">真实产品演示</p><video :src="asset(project.video)" :poster="asset(project.poster)" controls preload="none" playsinline :aria-label="`${project.title} 演示视频`"></video></div>
            <div class="detail-links"><a v-if="project.id === 'plugin'" class="button primary" href="https://microsoftedge.microsoft.com/addons/detail/aidmlojjjgebhogkffbebnfpjhfbpfmm" target="_blank" rel="noreferrer">在 Edge 商店查看</a><a v-if="project.id === 'prism'" class="button primary" href="https://deluxe-cheesecake-203e56.netlify.app/" target="_blank" rel="noreferrer">在线体验多棱镜</a><a v-if="project.id === 'ops'" class="button primary" href="#ops-qr">扫描小程序码体验</a><a class="button" :href="`#demo-${project.id}`">观看演示</a></div>
          </section>
        </article>
      </section>

      <section class="section shell lab-section" id="lab">
        <header class="section-head"><div><p class="kicker">02 / WORK IN PROGRESS</p><h2>还在继续的<br>探索<span class="accent">。</span></h2></div><p>我也关心：当 AI 出错时，<br>系统能不能发现，能不能停下来。</p></header>
        <div class="lab-grid">
          <article class="lab-card agent-card"><span class="lab-label">LOCAL TOOL / 持续自用</span><h3>求职 Agent<span>↗</span></h3><p>把重复的岗位阅读、判断和桌面操作串成工作流，再用状态记录、去重与发送核验约束执行。</p><div class="agent-flow" aria-label="工作流程"><span>读取岗位</span><i>→</i><span>判断与校验</span><i>→</i><span>执行与记录</span></div><div class="lab-bottom"><span>Python · UI Automation · SQLite</span><a href="mailto:duyufei000@126.com?subject=求职Agent演示">联系看演示 ↗</a></div><small>本地运行，代码未公开；异常检测与手机文本控制台仍在迭代。</small></article>
          <article class="lab-card reading-card"><span class="lab-label">INTERACTIVE READING / 在线作品</span><h3>牡丹亭 · 惊梦<span>↗</span></h3><blockquote>原来姹紫嫣红开遍。</blockquote><p>面向高一学生的古典戏曲互动阅读。AI 负责检索，让原文与读者划下的句子建立联系。</p><div class="lab-bottom"><span>React · TypeScript</span><a href="https://yuyuyyyyyyyyyyyy.github.io/mudanting-jingmeng/" target="_blank" rel="noreferrer">打开作品 ↗</a></div></article>
        </div>
      </section>

      <section id="process" class="section process-section"><div class="shell"><header class="section-head inverse"><div><p class="kicker">我的产品工作方式</p><h2>我如何把产品判断<br>落到真实版本里。</h2></div></header><div class="process-grid"><article v-for="item in process" :key="item[0]"><b>{{ item[0] }}</b><h3>{{ item[1] }}</h3><p>{{ item[2] }}</p></article></div></div></section>

      <section id="education" class="shell education-compact"><p class="kicker">04 / ABOUT ME</p><div class="education-three"><article><span>教育背景</span><h3>计算机科学与技术本科</h3><p>长江师范学院｜山东科技大学联合培养</p><p>2025 届 · 专业排名第 4 · CET-4</p></article><article><span>从需求到原型</span><h3>产品思考 × 动手实现</h3><p>问题拆解、用户流程、原型与交互、AI 输出规则、需求优先级、版本复盘。</p></article><article><span>项目中使用的技术</span><h3>让想法有实现路径</h3><p>Python、TypeScript、Vue、React / Next.js、浏览器扩展、大模型 API、SQLite 与 Git。</p><p>结合实现限制调整方案，也明确尚未验证的边界。</p></article></div></section>

      <section class="contact shell"><p class="kicker">LET’S BUILD SOMETHING USEFUL</p><h2>下一个有用的产品，<br>一起做<span>↗</span></h2><p>正在寻找 AI 应用 / Agent 开发、技术产品助理方向的机会。</p><div><a class="button lime" href="mailto:duyufei000@126.com">duyufei000@126.com ↗</a><button class="copy-email" type="button" @click="copyEmail">复制邮箱</button><a :href="asset('杜雨菲_AI产品助理_简历.pdf')" download>下载简历 ↓</a><a href="https://github.com/yuyuyyyyyyyyyyyy" target="_blank" rel="noreferrer">GitHub ↗</a></div><p class="copy-feedback" role="status">{{ copied }}</p></section>
    </main>
    <footer class="footer shell"><span>© 2026 杜雨菲 · 用作品说话</span><a href="#top">回到顶部 ↑</a><span>DESIGNED TO BE USEFUL.</span></footer>
  </div>
</template>








