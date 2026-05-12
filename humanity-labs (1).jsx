import { useState, useCallback, useMemo, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
// T uses CSS custom properties for live theme switching
const T = {
  bg0:"var(--c-bg0)", bg1:"var(--c-bg1)", bg2:"var(--c-bg2)",
  border:"var(--c-border)", borderHi:"var(--c-borderHi)",
  txt0:"var(--c-txt0)", txt1:"var(--c-txt1)", txt2:"var(--c-txt2)",
  blue:"var(--c-blue)", purple:"var(--c-purple)", amber:"var(--c-amber)",
  red:"var(--c-red)", green:"var(--c-green)", orange:"var(--c-orange)",
};

const THEMES = {
  abyss:     { name:"Abyss",      icon:"⬛", vars:"--c-bg0:#05080f;--c-bg1:#090e1a;--c-bg2:#0e1628;--c-border:#162035;--c-borderHi:#1e3050;--c-txt0:#eef2ff;--c-txt1:#8899bb;--c-txt2:#445577;--c-blue:#3dd6f5;--c-purple:#9d7bff;--c-amber:#f0a040;--c-red:#f0605a;--c-green:#2ee8a0;--c-orange:#ff7c50;--c-accent1:#3dd6f5;--c-glow:rgba(61,214,245,0.12);", body:"background:#05080f;color:#eef2ff;", st:"#090e1a", sh:"#162035", rb:"#162035", rt:"#3dd6f5" },
  daylight:  { name:"Daylight",   icon:"⬜", vars:"--c-bg0:#f5f7ff;--c-bg1:#ffffff;--c-bg2:#eaeffa;--c-border:#d0d8ee;--c-borderHi:#a8b8d8;--c-txt0:#0c1526;--c-txt1:#2a3f6a;--c-txt2:#607090;--c-blue:#0066cc;--c-purple:#6b3ac2;--c-amber:#c87800;--c-red:#cc2020;--c-green:#067a52;--c-orange:#cc5000;--c-accent1:#0066cc;--c-glow:rgba(0,102,204,0.10);", body:"background:#f5f7ff;color:#0c1526;", st:"#eaeffa", sh:"#d0d8ee", rb:"#d0d8ee", rt:"#0066cc" },
  terminal:  { name:"Terminal",   icon:"💚", vars:"--c-bg0:#020806;--c-bg1:#040c08;--c-bg2:#071410;--c-border:#0d2818;--c-borderHi:#164030;--c-txt0:#00ff88;--c-txt1:#00cc66;--c-txt2:#007744;--c-blue:#00ff88;--c-purple:#00ccaa;--c-amber:#aaff00;--c-red:#ff4444;--c-green:#00ff88;--c-orange:#ffaa00;--c-accent1:#00ff88;--c-glow:rgba(0,255,136,0.10);", body:"background:#020806;color:#00ff88;", st:"#040c08", sh:"#0d2818", rb:"#0d2818", rt:"#00ff88" },
  sunset:    { name:"Sunset",     icon:"🌆", vars:"--c-bg0:#130818;--c-bg1:#1e0d28;--c-bg2:#281238;--c-border:#3d1a55;--c-borderHi:#5a2878;--c-txt0:#fff0ee;--c-txt1:#e8b8cc;--c-txt2:#996688;--c-blue:#ff5eaa;--c-purple:#cc3aff;--c-amber:#ffaa30;--c-red:#ff3355;--c-green:#40ffaa;--c-orange:#ff6633;--c-accent1:#ff5eaa;--c-glow:rgba(255,94,170,0.12);", body:"background:#130818;color:#fff0ee;", st:"#1e0d28", sh:"#3d1a55", rb:"#3d1a55", rt:"#ff5eaa" },
  arctic:    { name:"Arctic",     icon:"🔷", vars:"--c-bg0:#e6f2ff;--c-bg1:#d8ebff;--c-bg2:#c4ddf8;--c-border:#8ab8e0;--c-borderHi:#5090c8;--c-txt0:#001a3a;--c-txt1:#12406a;--c-txt2:#3a6090;--c-blue:#004eaa;--c-purple:#5030b8;--c-amber:#b87000;--c-red:#aa1818;--c-green:#007845;--c-orange:#b04800;--c-accent1:#004eaa;--c-glow:rgba(0,78,170,0.10);", body:"background:#e6f2ff;color:#001a3a;", st:"#c4ddf8", sh:"#8ab8e0", rb:"#8ab8e0", rt:"#004eaa" },
  vapor:     { name:"Vaporwave",  icon:"💜", vars:"--c-bg0:#100820;--c-bg1:#1c1030;--c-bg2:#281440;--c-border:#502280;--c-borderHi:#7833aa;--c-txt0:#ffddff;--c-txt1:#ff88ee;--c-txt2:#bb55aa;--c-blue:#00ddff;--c-purple:#ff22cc;--c-amber:#ffdd00;--c-red:#ff2266;--c-green:#33ffcc;--c-orange:#ff8844;--c-accent1:#ff22cc;--c-glow:rgba(255,34,204,0.12);", body:"background:#100820;color:#ffddff;", st:"#1c1030", sh:"#502280", rb:"#502280", rt:"#ff22cc" },
  parchment: { name:"Parchment",  icon:"📜", vars:"--c-bg0:#faf5e8;--c-bg1:#f4ecda;--c-bg2:#ebe0c5;--c-border:#c8b080;--c-borderHi:#a09050;--c-txt0:#250e02;--c-txt1:#4a2c10;--c-txt2:#785030;--c-blue:#1a4878;--c-purple:#4a1e6a;--c-amber:#8a5800;--c-red:#881a18;--c-green:#144e20;--c-orange:#7a3010;--c-accent1:#1a4878;--c-glow:rgba(26,72,120,0.08);", body:"background:#faf5e8;color:#250e02;", st:"#ebe0c5", sh:"#c8b080", rb:"#c8b080", rt:"#1a4878" },
};

function applyTheme(key) {
  const t = THEMES[key] || THEMES.abyss;
  t.vars.split(';').filter(Boolean).forEach(v => {
    const i = v.indexOf(':'); if (i > 0) document.documentElement.style.setProperty(v.slice(0,i).trim(), v.slice(i+1).trim());
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const COUNTRIES = "Afghanistan,Algeria,Angola,Argentina,Australia,Bangladesh,Bolivia,Brazil,Cameroon,Canada,Chile,China,Colombia,Congo DRC,Cuba,Czech Republic,Ecuador,Egypt,Ethiopia,France,Germany,Ghana,Greece,Guatemala,Haiti,Hungary,India,Indonesia,Iran,Iraq,Israel,Italy,Japan,Jordan,Kenya,Malaysia,Mexico,Morocco,Myanmar,Nepal,Netherlands,New Zealand,Nigeria,Pakistan,Peru,Philippines,Poland,Portugal,Romania,Russia,Saudi Arabia,Senegal,South Africa,South Korea,Spain,Sri Lanka,Sudan,Sweden,Switzerland,Syria,Tanzania,Thailand,Turkey,Uganda,Ukraine,United Kingdom,United States,Venezuela,Vietnam,Yemen,Zimbabwe".split(",");
const ETHNICITIES = ["Arab / Middle Eastern","Bengali","Black / African","Black / African American","Black / Afro-Caribbean","Central Asian","Chinese / Han","Filipino","Hispanic / Latino","Indigenous (Americas)","Iranian / Persian","Japanese","Jewish","Korean","Kurdish","Mixed / Multiracial","Pacific Islander","Russian / East Slavic","Somali / East African","South Asian (Indian)","Southeast Asian","Turkish","Vietnamese","West African","White / Anglo-Saxon","White / Eastern European","White / Northern European","White / Southern European","Other"];
const RELIGIONS = ["Atheist / Non-religious","Agnostic","Animism / Folk Religion","Buddhism","Catholic","Eastern Orthodox","Evangelical / Pentecostal","Hinduism","Islam (Shia)","Islam (Sunni)","Judaism","Protestant","Secular / Cultural","Sikhism","Spiritual","Taoism","Other"];
const EDUS = ["No formal education","Primary school","Middle school","High school / GED","Vocational / Trade school","Some college","Associate's degree","Bachelor's degree","Master's degree","Professional degree","Doctorate / PhD"];
const INCOMES = ["Extreme poverty","Below poverty line","Working poor","Working class","Lower-middle class","Middle class","Upper-middle class","Upper class","Ultra-wealthy"];
const OCC_CATS = ["Agriculture / Farming","Manual Labor / Construction","Manufacturing / Factory","Transportation / Logistics","Service (Retail/Food/Hospitality)","Healthcare","Education / Academia","Technology / Engineering","Business / Finance","Government / Public Service","Legal","Arts / Media / Creative","Military / Security","Religious / Clergy","Informal Economy","Homemaker","Unemployed","Student","Retired"];
const EMPLOY = ["Employed full-time","Employed part-time","Self-employed","Unemployed","Gig / informal economy","Student","Retired","Homemaker","Unable to work"];
const CITIES = ["Remote rural","Rural","Small town","Suburban","Urban","Megacity / Metro"];
const VALUES_ALL = "Achievement,Adventure,Benevolence,Civic duty,Community,Compassion,Conformity,Creativity,Education,Equality,Environment,Faith / Religion,Family,Freedom,Hard work,Honor,Independence,Innovation,Justice,Loyalty,Nationalism,Order,Power,Security,Self-direction,Spirituality,Status,Tradition,Wealth".split(",");
const MEDIA_ALL = ["Social media heavy","Social media occasional","Mainstream TV news","Partisan TV news","Mainstream online news","Alternative online news","Print newspapers","Radio","Podcasts","Distrusts all media","Word-of-mouth community","International media","Low media engagement","Religious media"];
const POL_OPTS = ["Far-left","Left","Center-left","Center","Center-right","Right","Far-right","Libertarian","Nationalist / Populist","Socialist","Green / Eco-socialist","Religious Conservative","Theocratic","Apolitical"];
const REL_TYPES = ["spouse","partner","parent","child","sibling","close friend","colleague","classmate","neighbor","peer","mentor","rival","acquaintance"];
const PERSONA_COLORS = ["#38bdf8","#a78bfa","#f59e0b","#f87171","#34d399","#fb923c","#e879f9","#4ade80","#60a5fa","#f472b6","#22d3ee","#84cc16","#c084fc","#2dd4bf","#ff6b6b","#818cf8","#6ee7b7","#93c5fd","#fca5a5","#fbbf24"];
const EMOJIS = ["👤","👨","👩","🧑","👴","👵","👦","👧","👨‍⚕️","👩‍⚕️","👨‍🏫","👩‍🏫","👨‍🌾","👩‍🌾","👷","👮","🧕","🧑‍🍳","👨‍💼","👩‍💼","👨‍💻","👩‍💻","🧑‍🔧","👨‍🏭","👩‍🏭","🧑‍⚖️","🧑‍🎨","🧑‍🔬"];

// ─── 200-SCENARIO CATALOG  (8 categories × 25 scenarios) ────────────────────
const SCENARIO_CATALOG = [
  { id:"eco", icon:"💰", label:"Economic & Financial", color:"#34d399", scenarios:[
    {id:"e1",label:"Factory Mass Closure",text:"The region's largest manufacturer closes all facilities, laying off 5,000 workers. Management cites automation and cheaper overseas labor. No meaningful severance offered."},
    {id:"e2",label:"Hyperinflation Shock",text:"Annual inflation reaches 40% in a single month. Food and fuel prices have doubled. The central bank raises rates sharply, triggering a credit freeze for small businesses."},
    {id:"e3",label:"Stock Market Crash",text:"Global markets dropped 35% over four weeks. Pension funds are down sharply. Governments are deadlocked between emergency stimulus and austerity."},
    {id:"e4",label:"Recession Declared",text:"The economy has officially entered recession. Unemployment is rising fast. Government revenues are collapsing. Businesses are cutting investment."},
    {id:"e5",label:"Housing Affordability Crisis",text:"Average home prices are now 14× median income. Rents have risen 60% in three years. An entire generation cannot afford to buy or rent near work."},
    {id:"e6",label:"Currency Collapse",text:"The local currency lost 60% of its value against the dollar in six months. Imported goods are unaffordable. Foreign debt is unpayable without an IMF bailout."},
    {id:"e7",label:"Universal Basic Income Pilot",text:"The government announced a 12-month UBI pilot: every adult receives $800/month unconditionally. Funded by a new wealth tax. Employers and economists are sharply divided."},
    {id:"e8",label:"Gig Economy Expansion",text:"A major platform will replace all full-time warehouse and delivery jobs with gig contracts by year-end, eliminating benefits for 80,000 employees. Shares surged on the news."},
    {id:"e9",label:"Bank Failure",text:"One of the country's top-five banks has collapsed due to bad loans. Deposits over $250,000 are frozen. Contagion risk to other banks is being urgently debated."},
    {id:"e10",label:"Trade War Escalation",text:"The two largest trading partners imposed mutual 25% tariffs. Supply chains are disrupted. Consumer goods prices are rising and export industries are shedding jobs."},
    {id:"e11",label:"Austerity Package",text:"To secure an IMF loan, the government announced deep cuts: subsidies on fuel, bread, and medicine eliminated. Public sector wages frozen for three years."},
    {id:"e12",label:"Billionaire Wealth Tax",text:"Parliament is voting on a 2% annual wealth tax on net worth above $50 million. Business groups are threatening capital flight. Public polls show 71% support."},
    {id:"e13",label:"Food Price Spike",text:"Global commodity prices surged 45% following crop failures in three major regions. Basic staples — bread, rice, cooking oil — are now unaffordable for the bottom 40%."},
    {id:"e14",label:"Student Debt Cancelled",text:"The government has announced cancellation of all student loans and medical debt for households below median income. Critics call it unfair; supporters call it economic necessity."},
    {id:"e15",label:"White-Collar AI Wave",text:"A new AI platform is replacing accountants, paralegals, customer service workers, and junior analysts en masse. 30% of entry-level white-collar roles face elimination in 18 months."},
    {id:"e16",label:"Oil Price Collapse",text:"Oil dropped to $22/barrel following a supply glut. Nations dependent on oil revenue face catastrophic budget deficits. Entire economic models are suddenly unviable."},
    {id:"e17",label:"Crypto Market Implosion",text:"The three largest crypto exchanges simultaneously declared insolvency. Millions of retail investors lost their savings. Regulators are scrambling for a response."},
    {id:"e18",label:"Corporate Tax Leak",text:"A massive leak revealed the 50 largest national corporations paid an effective rate of 0.4% last year through offshore structures. The data is publicly published."},
    {id:"e19",label:"Small Business Collapse Wave",text:"One in three small businesses has closed permanently following rising costs and banks tightening credit. High streets are emptying. Local communities are hollowing out."},
    {id:"e20",label:"Sovereign Debt Default",text:"The national government has defaulted on its foreign debt for the first time in 50 years. The IMF is demanding painful structural reforms as the price of a rescue."},
    {id:"e21",label:"Rent Control Passed",text:"The city passed emergency rent control: all residential rents capped at 2021 levels. Landlords threaten a maintenance freeze. Tenant groups are celebrating."},
    {id:"e22",label:"Pension Crisis",text:"Actuaries warn the public pension system will be insolvent in 8 years. The government is considering raising the retirement age from 62 to 68. Workers are outraged."},
    {id:"e23",label:"Wealth Gap Report Goes Viral",text:"New data shows the top 1% now owns 52% of national wealth, up from 38% a decade ago. Median real wages fell 12% in the same period. The report spreads everywhere."},
    {id:"e24",label:"Farm Crisis",text:"A combination of drought, rising input costs, and cheap imports has pushed 40% of family farms to insolvency. Rural economies are collapsing."},
    {id:"e25",label:"Port Strike — Supply Chain",text:"A major port strike shut down 60% of import/export capacity for three weeks. Supermarket shelves are thinning. Manufacturing plants are pausing production."},
  ]},
  { id:"pol", icon:"🗳️", label:"Political & Governance", color:"#38bdf8", scenarios:[
    {id:"p1",label:"Populist Election Victory",text:"A hardline nationalist-populist won the presidency on a platform of immigration restriction, media crackdowns, withdrawal from international agreements, and eliminating the corrupt elite."},
    {id:"p2",label:"Attempted Military Coup",text:"Military generals announced they are taking control 'temporarily to restore order.' The elected president has been detained. Streets are tense. International condemnation is swift."},
    {id:"p3",label:"Corruption Mega-Scandal",text:"A whistleblower released documents showing the ruling party diverted $4 billion in public funds to private accounts over 7 years. Arrest warrants issued for cabinet members."},
    {id:"p4",label:"Far-Right Surge",text:"The far-right party tripled its vote share, finishing first in 12 of 16 regions. It now demands coalition inclusion, threatening to bring down the government otherwise."},
    {id:"p5",label:"Emergency Powers Invoked",text:"Citing a security threat, the prime minister invoked emergency powers: parliament suspended for 90 days, civil liberties restricted, protests require 72-hour advance approval."},
    {id:"p6",label:"Press Freedom Crackdown",text:"Three of the four largest independent newspapers have been forced to close or sell to government-aligned owners. Several journalists arrested on 'disinformation' charges."},
    {id:"p7",label:"Independence Referendum",text:"A restive region voted 62% in favor of independence. The central government refuses to recognize the vote. International observers are divided on its legitimacy."},
    {id:"p8",label:"Mass Protest Movement",text:"Millions have taken to the streets for three consecutive weeks demanding the government resign. The protests are leaderless, driven by economic frustration and corruption anger."},
    {id:"p9",label:"Election Fraud Allegations",text:"The losing party declared the election stolen, citing irregularities in 6 regions. Independent monitors found issues in 2 but no systemic fraud. Both sides are mobilizing."},
    {id:"p10",label:"Anti-Protest Law",text:"Parliament passed a law making unlicensed gatherings of more than 50 people illegal. Already used against striking workers and environmental protesters."},
    {id:"p11",label:"Political Assassination",text:"A prominent opposition leader has been killed in what appears to be a targeted attack. The government denies involvement. Streets are erupting in grief and rage."},
    {id:"p12",label:"Judiciary Capture",text:"The ruling party passed legislation allowing it to directly appoint all Supreme Court judges. Critics call it the end of judicial independence. Supporters call it democratic reform."},
    {id:"p13",label:"Foreign Election Interference",text:"Intelligence agencies confirmed a foreign power ran social media influence campaigns targeting the election. Evidence of foreign funding for political parties is now emerging."},
    {id:"p14",label:"Term Limit Removal",text:"The ruling leader pushed through a constitutional amendment removing presidential term limits. A referendum passed 67% in favor; opposition alleged ballot stuffing."},
    {id:"p15",label:"Coalition Government Collapse",text:"The fragile coalition collapsed over immigration. The country faces its third election in two years. Political fatigue and cynicism are at record levels."},
    {id:"p16",label:"International Sanctions",text:"The country was hit with sweeping international sanctions following human rights violations. Banks are freezing transactions. Medicine and technology imports are blocked."},
    {id:"p17",label:"Radical Left Victory",text:"A left-wing coalition won a surprise majority promising nationalization of energy, banking, and healthcare; a 70% top income tax; a guaranteed right to housing."},
    {id:"p18",label:"Anti-Corruption Purge",text:"A new anti-corruption commission arrested 340 officials, businesspeople, and military officers in a single week. Critics say it is a politically motivated purge of rivals."},
    {id:"p19",label:"Religious Law Proposed",text:"The governing religious party introduced legislation requiring all public behavior to comply with religious law, including dress codes, alcohol prohibition, and gender separation."},
    {id:"p20",label:"Decentralization Demand",text:"A regional movement demands fiscal and political autonomy — control over its own taxes, police, and education. The capital sees it as secession by stealth."},
    {id:"p21",label:"Truth Commission Opens",text:"A truth and reconciliation commission began public hearings into atrocities committed by the previous regime. Perpetrators are named. Victims testify. Old wounds reopen."},
    {id:"p22",label:"Dual Power Crisis",text:"Two figures both claim legitimate presidential power following a disputed election. Each has support of different military units. Embassies are choosing sides. Civil war is feared."},
    {id:"p23",label:"Alliance Membership Referendum",text:"A national referendum on leaving a major regional alliance (EU, ASEAN, African Union). Polls show 52/48 split. Both sides spending heavily on campaigns."},
    {id:"p24",label:"Mass Surveillance Exposed",text:"A classified data dump exposed mass surveillance of citizens, political opponents, and journalists — dwarfing prior scandals. The leaker is in hiding."},
    {id:"p25",label:"City Bankruptcy",text:"The country's second-largest city declared bankruptcy — unable to pay teachers, police, or utilities. Essential services are collapsing. National government debates a bailout."},
  ]},
  { id:"env", icon:"🌍", label:"Climate & Environment", color:"#34d399", scenarios:[
    {id:"v1",label:"500-Year Flood",text:"The worst flooding in recorded history submerged entire districts. Infrastructure destroyed. 200,000 displaced. Damage exceeds $40 billion. Scientists say this is climate change."},
    {id:"v2",label:"Megadrought Year Three",text:"The region is in its third consecutive year of drought. Rivers at 20% capacity. Crops failing. Water rationing in 40 cities. The aquifer is being depleted irreversibly."},
    {id:"v3",label:"Record Wildfire Season",text:"Wildfires burned 15 million acres — four times the previous record. Ten towns destroyed. Smoke blanketed cities for weeks. Scientists blame extreme heat and drought."},
    {id:"v4",label:"Category 5 Hurricane",text:"A record-intensity hurricane struck with 200mph winds. Entire barrier islands submerged. Death toll 2,000 and rising. Rebuilding projected to take a decade."},
    {id:"v5",label:"Carbon Tax Introduced",text:"A $60/tonne carbon tax was introduced. Fuel prices will rise 30%. Airlines and steel producers threaten to relocate. Environmental groups are celebrating. Fossil fuel workers are terrified."},
    {id:"v6",label:"International Water War",text:"Two neighboring countries are in a standoff over river water rights as a shared river drops to record lows. Both militaries have moved units to the border region."},
    {id:"v7",label:"Mass Species Die-Off",text:"A new report confirms 30% of vertebrate species are functionally extinct and ecosystems collapsing faster than models predicted. The energy industry calls it alarmist."},
    {id:"v8",label:"Reef System Collapse",text:"The nation's reef system — supporting 200,000 fishing jobs — has crossed the irreversible bleaching threshold. Scientists declare it functionally dead."},
    {id:"v9",label:"Nuclear Plant Incident",text:"A cooling system failure at a nuclear plant triggered evacuation of 80,000 people. Radiation elevated but below Chernobyl levels. Cause appears to be infrastructure neglect."},
    {id:"v10",label:"Coastal City Abandonment Plan",text:"Engineers released plans to abandon entire coastal neighborhoods of the capital within 20 years. 400,000 people will need to relocate. No budget exists for the displacement."},
    {id:"v11",label:"Fossil Fuel Phase-Out Vote",text:"Parliament is voting on a bill to ban all new fossil fuel extraction by 2030. Energy companies threaten investment strikes. Unions demand just-transition protections."},
    {id:"v12",label:"Extreme Heat Emergency",text:"Temperatures exceeded 48°C for 17 consecutive days. Hospitals overwhelmed. Elderly and outdoor workers are dying. The grid is failing under air conditioning demand."},
    {id:"v13",label:"Agricultural Collapse",text:"Heat stress and extreme weather cut national food production 35% in one season. Food imports cannot compensate. Prices spiraling. Food bank queues stretch for blocks."},
    {id:"v14",label:"Rainforest Tipping Point",text:"Scientists announce the Amazon has crossed a dieback tipping point — emitting more carbon than it absorbs. This changes all global climate models dramatically."},
    {id:"v15",label:"Air Quality Emergency",text:"Smog hit 50× WHO safe limits for 10 consecutive days. Hospitals full of respiratory patients. Schools and factories closed. A national emergency has been declared."},
    {id:"v16",label:"Green Energy Boom Town",text:"Massive solar and wind investment created 40,000 jobs in a depressed industrial region in 3 years. But older workers say the new jobs don't suit them or pay as well."},
    {id:"v17",label:"Glacier Disappearance",text:"The national glacier lost 80% of its mass. Rivers it feeds will see dramatically reduced summer flow in 10 years. Agriculture and hydropower are at existential risk."},
    {id:"v18",label:"Ocean Acidification Report",text:"New data shows ocean acidity up 30% since industrialization, collapsing shellfish populations. Coastal fishing communities are losing livelihoods permanently."},
    {id:"v19",label:"Methane Surge",text:"Satellites detected methane releases 10× higher than predicted from permafrost. Climate scientists are revising worst-case scenarios sharply upward."},
    {id:"v20",label:"Eco-Terrorism Attack",text:"An extremist group sabotaged a major oil pipeline, causing $2 billion in damage. Governments call it terrorism. Some activists express understanding for the desperation."},
    {id:"v21",label:"Pesticide Cancer Scandal",text:"Long-term studies definitively linked a widely used pesticide to elevated cancer rates in rural communities. The manufacturer knew since 2008 and suppressed the data."},
    {id:"v22",label:"Climate Refugee Influx",text:"150,000 climate refugees arrived from a region made uninhabitable by rising seas and failed harvests. They have nowhere to return to. No policy framework exists."},
    {id:"v23",label:"Geoengineering Experiment",text:"A coalition announced stratospheric aerosol injection to dim the sun — without global consensus. Scientists are deeply divided. The process cannot be reversed."},
    {id:"v24",label:"Dam Failure Disaster",text:"A major dam failed catastrophically, killing 1,800 and displacing 500,000. Investigation reveals the dam was known unsafe for 5 years but political pressure suppressed reports."},
    {id:"v25",label:"Microplastics Health Alarm",text:"New research shows microplastics in 98% of human blood samples studied, linked to hormone disruption and cancer. The plastics industry is lobbying to suppress the findings."},
  ]},
  { id:"tech", icon:"🤖", label:"Technology & AI", color:"#a78bfa", scenarios:[
    {id:"t1",label:"Mass AI Job Displacement",text:"An AI platform replaced 40% of entry-level white-collar roles within 18 months — paralegals, analysts, accountants, junior coders, customer service workers."},
    {id:"t2",label:"Deepfake Election Crisis",text:"A deepfake video went viral two days before elections showing the leading candidate confessing to a major crime. Almost certainly fake, but shared 200 million times."},
    {id:"t3",label:"Mass Surveillance Expansion",text:"All public spaces will be covered by facial recognition cameras linked to a social behavior scoring system. Opponents call it totalitarianism. Supporters call it crime prevention."},
    {id:"t4",label:"Social Media Algorithm Leak",text:"An internal leak revealed the dominant social platform knowingly amplified extremism and medical misinformation because it maximized engagement time."},
    {id:"t5",label:"Nation-State Cyberattack",text:"A cyberattack crippled power grids, hospitals, and financial networks for 72 hours. 23 hospitals diverted patients. Attributed to a foreign power but no formal accusation made."},
    {id:"t6",label:"Internet Shutdown",text:"The government ordered a complete internet shutdown for 96 hours during civil unrest. Businesses, hospitals, and families cut off. International condemnation is immediate."},
    {id:"t7",label:"Autonomous Weapons Deployed",text:"A military deployed fully autonomous lethal drones that select and kill without human oversight. An international treaty banning them has stalled in the UN."},
    {id:"t8",label:"Gene Drive Release",text:"A company released a gene-drive mosquito to eliminate malaria without global consensus. Scientists warn it could spread worldwide. It cannot be recalled."},
    {id:"t9",label:"800M Data Breach",text:"Personal data of 800 million citizens — health, finance, location, private messages — was stolen and posted publicly. Identity theft is exploding."},
    {id:"t10",label:"AI Content Flood",text:"Generative AI flooded the internet with so much synthetic content that distinguishing real from fake is practically impossible. Trust in all media has collapsed."},
    {id:"t11",label:"Tech Monopoly Breakup",text:"Regulators ordered the forced breakup of the country's largest tech company. It controls 85% of search, 70% of cloud, and all major consumer platforms. It's fighting furiously."},
    {id:"t12",label:"Neural Implant Launch",text:"A consumer brain-computer interface that reads thoughts and enhances memory is now on sale. Wealthy early adopters are buying. Ethicists warn of a two-tier humanity."},
    {id:"t13",label:"AI Discrimination Exposed",text:"AI systems used for hiring, bail, loans, and medical triage show systematic bias against ethnic minorities and women — at a scale no human auditor could detect."},
    {id:"t14",label:"Social Credit System Launch",text:"A city launched a mandatory social credit system: citizen scores based on behavior and associations. Low scores restrict transport, schools, and employment."},
    {id:"t15",label:"Encryption Broken",text:"A nation achieved quantum computing sufficient to break all current encryption. Every bank transaction, state secret, and private message is potentially readable."},
    {id:"t16",label:"Lab-Grown Meat Goes Mainstream",text:"Lab-grown meat now costs less than conventional beef. Major supermarkets switched. Livestock farming faces extinction. Rural agricultural communities are devastated."},
    {id:"t17",label:"Cash Abolished",text:"The central bank mandated a switch to government digital currency within 18 months. Cash abolished. The government will have full visibility of all transactions."},
    {id:"t18",label:"Forced Return to Office",text:"Major employers mandated full-time office return, ending remote work. Employees who relocated face impossible commutes or forced relocation. Resignations are surging."},
    {id:"t19",label:"AI Medical Misdiagnosis",text:"A widely used AI diagnostic tool systematically misdiagnosed a deadly cancer in dark-skinned patients due to biased training data. Hundreds received no treatment."},
    {id:"t20",label:"Tech Layoff Tsunami",text:"Ten major tech companies announced simultaneous layoffs totaling 250,000 jobs. Stock prices rose on the news. The gap between investor optimism and worker devastation is stark."},
    {id:"t21",label:"Synthetic Biology Weapon",text:"Intelligence agencies confirm a non-state group developed a synthetic pathogen in a home lab using publicly available AI biology tools. They have not yet deployed it."},
    {id:"t22",label:"Platform Violence Failure",text:"A wave of coordinated incitement to ethnic violence spread unchecked on the dominant social platform for 72 hours before removal. 140 people were killed."},
    {id:"t23",label:"Digital Divide Widens",text:"40% of the country's rural population has no usable internet. As government services move online and jobs require connectivity, this group faces systematic exclusion."},
    {id:"t24",label:"Drone Delivery Job Wipeout",text:"Drone delivery wiped out 60,000 courier jobs in two years. The drones are cheap and reliable. The workers are untrained for anything else. No safety net exists."},
    {id:"t25",label:"AI Legal Services",text:"AI legal tools now handle 80% of routine legal work at 1% of the cost of human lawyers. Law school applications have collapsed. The profession faces extinction."},
  ]},
  { id:"hlt", icon:"🏥", label:"Health & Wellbeing", color:"#f59e0b", scenarios:[
    {id:"h1",label:"Novel Pandemic",text:"Health authorities confirmed 800 local cases of a novel respiratory virus with a 3% mortality rate and 14-day incubation. An international health emergency has been declared."},
    {id:"h2",label:"Vaccine Hesitancy Surge",text:"Following a minor adverse event in a trial, vaccine refusal doubled nationally. Measles and polio have re-emerged. Hospitals are filling with preventable disease."},
    {id:"h3",label:"Healthcare System Collapse",text:"Chronic underfunding pushed the public health system to breaking point. Ambulance wait times average 4 hours. 60,000 patients on 18-month waiting lists for urgent surgery."},
    {id:"h4",label:"Mental Health Epidemic",text:"Depression, anxiety, and suicidal ideation have doubled in five years, especially among those aged 16–34. Waiting times for treatment average 18 months."},
    {id:"h5",label:"Opioid Crisis Peak",text:"Opioid overdose deaths reached a record 120,000 this year. Rural communities hardest hit. The pharmaceutical company involved agreed to a $22 billion settlement."},
    {id:"h6",label:"Antibiotic Resistance Emergency",text:"The health authority declared antibiotic resistance a national emergency. Routine surgeries now carry a 5% chance of an untreatable infection."},
    {id:"h7",label:"Obesity Intervention",text:"Government proposed a sugar tax, fast food ad ban near schools, and mandatory nutrition labels. The food industry has spent $400M lobbying against it."},
    {id:"h8",label:"Social Isolation Epidemic",text:"40% of adults report having no close friend. Deaths of despair — suicide, alcohol, overdose — now surpass car crashes for working-age men."},
    {id:"h9",label:"Drug Shortage Crisis",text:"A supply chain failure caused critical shortages of insulin, blood pressure medication, and chemotherapy drugs. Patients are rationing doses. Some are dying."},
    {id:"h10",label:"Insurance Denial Wave",text:"A major insurer used AI claims review to deny 80% of appeals for major procedures. Whistleblowers reveal targets for denial rates. Patients are dying."},
    {id:"h11",label:"Lead Poisoning Scandal",text:"Testing revealed elevated lead levels in the water supply of 40 cities, concentrated in low-income areas. The contamination has been ongoing for 15 years."},
    {id:"h12",label:"Birth Rate Collapse",text:"The birth rate fell below 1.1 — so far below replacement that models show a 40% population decline in 80 years. Pension systems are mathematically unsustainable."},
    {id:"h13",label:"Maternity Care Crisis",text:"Maternal mortality tripled in a decade, concentrated in rural and low-income areas. Black and indigenous women die at 4× the rate of white women."},
    {id:"h14",label:"Chronic Disease Pandemic",text:"60% of adults have at least one chronic preventable disease. Healthcare costs are consuming 20% of GDP with no structural response."},
    {id:"h15",label:"Dementia Care Collapse",text:"With an aging population, dementia cases doubled in a decade. Care homes are overwhelmed. 80% of dementia care falls on family members — mostly women."},
    {id:"h16",label:"Drug Decriminalization",text:"The government announced decriminalization of personal drug use and a $5B investment in addiction treatment. Police unions are furious. Public health experts celebrate."},
    {id:"h17",label:"Forced Psychiatric Detention",text:"New legislation allows police to detain anyone showing 'signs of mental illness' for 72 hours without judicial oversight. Mental health advocates warn of mass abuse."},
    {id:"h18",label:"Universal Healthcare Referendum",text:"A national referendum on moving to single-payer universal healthcare. Insurance companies spent $2B opposing it. Polls show 61% public support."},
    {id:"h19",label:"Air Pollution Deaths Report",text:"A study attributes 180,000 deaths per year nationally to air pollution, concentrated near industrial zones. The findings are formally disputed by industry-funded research."},
    {id:"h20",label:"Youth Suicide Wave",text:"Teen suicide rates rose 90% in 6 years. Studies link it strongly to social media and algorithmic design. The platforms deny responsibility. Parents are overwhelmed."},
    {id:"h21",label:"Pandemic Preparedness Gutted",text:"Government cut pandemic preparedness funding 70% to reduce the deficit. A new outbreak arrived and there are no stockpiles, trained teams, or response infrastructure."},
    {id:"h22",label:"Rare Disease Cluster",text:"300 cases of a rare pediatric disease emerged near a chemical plant. Parents link it to plant emissions. The company says 'no proven link.' No investigation ordered."},
    {id:"h23",label:"Longevity Drug for the Rich",text:"A new drug extends healthy life 20 years with no side effects. It costs $800,000. Accessible only to the ultra-wealthy, creating a biological two-tier humanity."},
    {id:"h24",label:"Hospital Privatization",text:"30 public hospitals are being privatized to raise revenue. Rural and poor urban areas will lose access to emergency care. Services will be restructured for profitability."},
    {id:"h25",label:"Famine Conditions Declared",text:"The UN declared famine in three regions. 2.4 million face starvation. Aid is blocked by internal conflict. International donors pledging funds but delivery is obstructed."},
  ]},
  { id:"sec", icon:"⚔️", label:"Security & Conflict", color:"#f87171", scenarios:[
    {id:"c1",label:"Urban Terrorist Attack",text:"A coordinated attack on public transport killed 180 people. Perpetrators claimed affiliation with a foreign extremist group. Emergency security measures have been declared."},
    {id:"c2",label:"Regional War Outbreak",text:"Armed conflict erupted between two neighboring countries over a disputed border. Artillery fire is ongoing. Refugees streaming across borders. Pressure for ceasefire mounting."},
    {id:"c3",label:"Civil War Begins",text:"Long-running ethnic and political tension exploded into open armed conflict. Militias control 40% of the country. The army is split. International actors are choosing sides."},
    {id:"c4",label:"Nuclear Threat Issued",text:"A nuclear-armed state issued a formal threat to use nuclear weapons if a named military intervention occurs. Markets have plunged. Governments are trying to assess credibility."},
    {id:"c5",label:"Police Brutality Viral",text:"Video of police killing an unarmed civilian went viral globally. Protests erupted in 60 cities. Three officers arrested. Police unions threatening to withdraw services."},
    {id:"c6",label:"Gang Violence Surge",text:"A new wave of gang violence made several urban districts effectively ungovernable. Extortion, kidnapping, and murder are daily. Residents are fleeing or arming themselves."},
    {id:"c7",label:"Ethnic Violence Erupts",text:"Violence between two ethnic communities killed 400 people in three days following a disputed land claim. Both communities have legitimate grievances. The state is seen as biased."},
    {id:"c8",label:"Military Occupation",text:"A neighboring country's military is occupying a border region, claiming it protects ethnic kin from persecution. The occupied country's government has appealed to international allies."},
    {id:"c9",label:"Femicide Emergency",text:"Following 2,300 women killed by intimate partners in one year, women's groups declared a national emergency. The justice system is seen as systematically failing to act."},
    {id:"c10",label:"Mass Shooting Event",text:"A mass shooting at a school killed 31 children and 4 teachers. The third in 18 months. The shooter was known to authorities but not stopped. Gun legislation debate at breaking point."},
    {id:"c11",label:"Genocide Warning",text:"The UN issued a formal genocide warning following systematic persecution of a minority: property seizure, expulsion, mass arrest, documented killings."},
    {id:"c12",label:"Cartel Territorial War",text:"Two major drug cartels are fighting for control of the country's main trafficking corridor. Towns are under cartel curfews. The army is present but outgunned in parts."},
    {id:"c13",label:"Child Trafficking Exposed",text:"An investigation exposed a trafficking network that moved 12,000 children across borders for forced labor. Senior officials and businesspeople are implicated."},
    {id:"c14",label:"Vigilante Justice Wave",text:"Following police failures, vigilante groups formed in 30 cities. They killed 80 people in two months, some with no evidence of wrongdoing. Support and condemnation are widespread."},
    {id:"c15",label:"Refugee Camp Attack",text:"A camp housing 80,000 displaced people was attacked by armed groups. 300 killed, infrastructure destroyed. Aid organizations are pulling out citing security."},
    {id:"c16",label:"Drone Strike Kills Wedding Party",text:"A military drone strike intended for militants killed a wedding party of 47 civilians. The military called it 'collateral damage.' The footage has been seen by 400 million people."},
    {id:"c17",label:"Food Weaponized in Siege",text:"A besieging force is deliberately blocking food aid to a city of 500,000. The UN estimates 60 people per day dying from starvation. An airlift is being blocked."},
    {id:"c18",label:"Mass Arrest Sweep",text:"Security forces arrested 8,000 people in sweeps following a terrorist attack. Human rights groups report widespread torture and indefinite detention without trial."},
    {id:"c19",label:"Piracy Resurgence",text:"Pirate attacks on shipping lanes tripled this year, disrupting vital trade routes. Insurance costs quadrupled. Naval escorts deployed but cannot cover all routes."},
    {id:"c20",label:"Head of State Assassinated",text:"The head of state has been assassinated. The deputy assumed power. Multiple groups are claiming or denying responsibility. The country's stability is uncertain."},
    {id:"c21",label:"Militia Arms Build-Up",text:"A domestic militia acquired military-grade weapons including anti-aircraft missiles. Intelligence suggests foreign state support. The government demanded disarmament. Refused."},
    {id:"c22",label:"All Borders Closed",text:"The country closed all land borders and suspended international flights indefinitely, citing a security threat. Thousands are stranded, including medical patients. Trade halted."},
    {id:"c23",label:"War Crimes Tribunal",text:"An international tribunal issued arrest warrants for 12 current and former government officials for war crimes. The government calls it politically motivated Western interference."},
    {id:"c24",label:"School Bombed",text:"A school in a conflict zone was bombed, killing 60 children. The strike was by a faction that received weapons from a major global power. Outrage is selective along political lines."},
    {id:"c25",label:"State Torture Exposed",text:"A leaked report confirms systematic torture in detention facilities, authorized at the highest government level. The government says the evidence is fabricated."},
  ]},
  { id:"soc", icon:"🧑‍🤝‍🧑", label:"Social & Cultural", color:"#e879f9", scenarios:[
    {id:"s1",label:"Racial Justice Uprising",text:"Months of protests following a high-profile killing of a person of color by police produced a mass movement demanding systemic change. Corporations issuing solidarity statements."},
    {id:"s2",label:"Feminist Mass Mobilization",text:"Millions of women walked out of work and school demanding equal pay, reproductive rights, and protection from violence. The largest feminist mobilization in the country's history."},
    {id:"s3",label:"LGBTQ Rights Rollback",text:"Parliament passed a law criminalizing same-sex relationships and banning gender-affirming care. Support from 60% of population. LGBTQ people are fleeing the country."},
    {id:"s4",label:"Religious Revival",text:"A charismatic religious movement grew from 100,000 to 8 million followers in three years. Its leader preaches traditional gender roles, rejection of science, separation from the state."},
    {id:"s5",label:"Generational Wealth Divide",text:"Data shows millennials and Gen Z will be the first generations in 200 years to be poorer than their parents. Housing, pensions, and wages all moved against young people."},
    {id:"s6",label:"Colonial Artifacts Returned",text:"A museum announced it will return 2,000 artifacts acquired during colonialism. Nationalists call it capitulation. Others call it long-overdue justice."},
    {id:"s7",label:"Social Media Ban for Minors",text:"Parliament is debating a law banning under-16s from social media entirely, following deaths linked to platform use. Parents are split. Platforms are fighting it."},
    {id:"s8",label:"Cancel Culture Controversy",text:"A beloved national figure was publicly accused of historical racist statements. Institutions removing their name from buildings. A culture war has erupted."},
    {id:"s9",label:"Loneliness Epidemic Report",text:"35% of adults have no close friends. Social isolation now costs more in health outcomes than smoking. Debate erupts on technology, work culture, and urban design."},
    {id:"s10",label:"Language Rights War",text:"A regional government made a minority language co-official. The central government calls it unconstitutional. Language riots have broken out in several cities."},
    {id:"s11",label:"Mass Secularization",text:"A census shows religious affiliation fell from 72% to 41% in 20 years. For many, this is liberation. For others, it signals civilizational collapse."},
    {id:"s12",label:"Indigenous Land Occupation",text:"An indigenous coalition is occupying land claimed by a mining company. They hold ancient legal title confirmed by courts. The company has government support and private security."},
    {id:"s13",label:"School Funding Racial Gap",text:"Analysis reveals school funding formulas produced de facto racial segregation: schools in white areas receive 3× the per-student funding of schools in minority areas."},
    {id:"s14",label:"Generational Values Divide",text:"A national survey shows the largest-ever gap between those over 55 and under 35 on gender, race, sexuality, and national identity. Families are fracturing."},
    {id:"s15",label:"Caste Discrimination Documented",text:"A landmark study proves caste discrimination is pervasive in hiring, healthcare, and justice systems despite being formally illegal. Dominant groups deny the evidence."},
    {id:"s16",label:"Meaning Crisis Report",text:"60% of adults describe their lives as 'lacking meaning and purpose' — the highest ever recorded. Rates of nihilism, radicalization, and cult recruitment are all rising."},
    {id:"s17",label:"Nationalism Wave",text:"A wave of nationalist sentiment created a political mood of 'our country first.' Minorities, immigrants, and cosmopolitans are increasingly targeted. Hate crimes up 80%."},
    {id:"s18",label:"Sex Work Decriminalized",text:"Parliament passed a law decriminalizing sex work. Sex workers celebrate safety gains. Feminist groups are divided. Religious conservatives are outraged."},
    {id:"s19",label:"Cult Mass Tragedy",text:"A destructive religious cult directed 400 members to take their lives. The leader had been known to authorities for years. Reopens questions about religious freedom."},
    {id:"s20",label:"History Curriculum War",text:"The government mandated a revised curriculum that critics say whitewashes colonialism and atrocities. Schools are refusing to adopt it. Teachers are being threatened."},
    {id:"s21",label:"Class Consciousness Surge",text:"A wave of working-class organizing is sweeping the country. 'Eat the rich' has become a political program gaining mainstream traction for the first time in decades."},
    {id:"s22",label:"Honor Violence Law Reform",text:"A landmark law increases penalties for honor-based violence. Religious conservatives say it criminalizes cultural practice. Women's rights groups say it is overdue and insufficient."},
    {id:"s23",label:"Pro-Natalist Policy Debate",text:"The government proposes cash payments for having a third child. Feminists call it demographic coercion. Nationalists say the nation is dying without it."},
    {id:"s24",label:"Cultural Appropriation Boycott",text:"A national entertainment company faced mass boycott for appropriating the culture of a historically marginalized group for profit without credit or compensation."},
    {id:"s25",label:"Homelessness Crisis",text:"The number of people sleeping on city streets tripled in five years. 'Housing first' programs defunded. Some cities criminalizing homelessness. Suffering is politically explosive."},
  ]},
  { id:"lab", icon:"👷", label:"Labor, Migration & Family", color:"#fb923c", scenarios:[
    {id:"l1",label:"Mass Deportation Campaign",text:"The government announced deportation of all undocumented immigrants — an estimated 3 million people. Raids are occurring in homes, schools, and hospitals. Family separations documented."},
    {id:"l2",label:"Refugee Surge",text:"300,000 refugees arrived in six months, fleeing a neighboring civil war. Camps are overwhelmed. Local services are strained. Sentiment is split between solidarity and xenophobia."},
    {id:"l3",label:"Brain Drain Emergency",text:"30% of the country's doctors, engineers, and teachers emigrated in three years. Hospitals have 40% vacancy rates. Schools are relying on unqualified substitutes."},
    {id:"l4",label:"General Strike",text:"The national trade union federation called a general strike. Public transport, schools, hospitals (emergency only), and government services are shut down."},
    {id:"l5",label:"Worker Strike Victory",text:"A three-month strike by warehouse workers ended with a 35% wage increase and restoration of benefits. The biggest labor victory in 30 years. Other sectors are energized."},
    {id:"l6",label:"Union Busting Memo Leaked",text:"A leaked memo revealed a major corporation's systematic strategy to prevent unionization: surveillance, false dismissal, and psychological pressure on organizers."},
    {id:"l7",label:"Child Labor Scandal",text:"Investigative journalists documented child labor in supply chains feeding a major national retailer. The goods were marketed with sustainability certifications."},
    {id:"l8",label:"Migrant Worker Abuse",text:"A major investigation documented systematic abuse of migrant workers on construction sites — wage theft, passport confiscation, physical violence."},
    {id:"l9",label:"Four-Day Work Week",text:"A national pilot of the four-day work week with no pay reduction is complete. Productivity was equal or better. 80% of workers want it permanent. Employers are divided."},
    {id:"l10",label:"Remote Work Rights Law",text:"New legislation gives all office workers the legal right to work remotely two days per week. Office landlords are alarmed. Many employers are furious."},
    {id:"l11",label:"Workplace Safety Deaths",text:"A building collapse killed 40 workers. Safety violations were known and unreported. The contractor had the lowest bid. The regulator had been defunded."},
    {id:"l12",label:"Sexual Harassment Reckoning",text:"A mass wave of workplace sexual harassment allegations across corporate, political, academic, and entertainment sectors produced the largest accountability reckoning in the country's history."},
    {id:"l13",label:"Domestic Worker Rights",text:"Domestic workers — primarily migrant women — are demanding inclusion in labor law protections. They currently have no minimum wage, no sick leave, no recourse for abuse."},
    {id:"l14",label:"Mass Immigration for Aging Economy",text:"To address demographic collapse, the government announced 500,000 immigrants annually for 10 years. Employers welcome it. Nationalists call it demographic replacement."},
    {id:"l15",label:"Zero-Hours Contract Ban",text:"The government banned zero-hours contracts, requiring all workers to have guaranteed minimum hours. Hospitality and retail industries warn of mass job cuts."},
    {id:"l16",label:"Remittance Tax Proposed",text:"A 15% tax on money sent by immigrants to home countries is proposed. Immigrant communities are outraged. The government says it will raise $3B for public services."},
    {id:"l17",label:"Second Generation Failure",text:"A major study shows children of immigrants score 30% lower on educational attainment, earn 25% less, and have worse health outcomes than comparably poor native children."},
    {id:"l18",label:"Care Work Wage Reform",text:"A policy reform proposes paying wages to full-time unpaid family carers — caring for children, elderly, or disabled relatives. Estimated 4 million qualify."},
    {id:"l19",label:"Elderly Care System Collapse",text:"400 care homes closed in three years due to underfunding and staff shortages. 80,000 elderly on waiting lists. Families are in crisis and cannot fill the gap."},
    {id:"l20",label:"Divorce Rate Spike",text:"The divorce rate hit a 40-year high following economic crisis and remote working pressures. Housing costs mean couples cannot separate even if they want to."},
    {id:"l21",label:"Domestic Abuse Pandemic",text:"Domestic abuse reports doubled in two years. Shelter space at 30% of need. A government minister called for education programs rather than shelters. Survivors are furious."},
    {id:"l22",label:"Return Migration Wave",text:"Economic collapse abroad is driving large-scale return of emigrants. They return with savings and skills — but also to a country with no jobs for them."},
    {id:"l23",label:"Statelessness Crisis",text:"A new citizenship law retroactively removed citizenship from 800,000 people whose parents were immigrants. They now have no nationality, healthcare, or schooling rights."},
    {id:"l24",label:"Parental Leave Expansion",text:"New legislation extends paid parental leave to 52 weeks at 80% salary, split equally between parents. Businesses under 50 employees are exempt, undermining the intent."},
    {id:"l25",label:"Gig Workers Reclassified",text:"A court ruled gig workers are employees, entitling them to full labor rights. The platform announced 40% price rises and workforce cuts. Both are happening simultaneously."},
  ]},
];
const ALL_SCENARIOS = SCENARIO_CATALOG.flatMap(cat =>
  cat.scenarios.map(s => ({...s, category:cat.label, categoryId:cat.id, categoryIcon:cat.icon, categoryColor:cat.color}))
);
// Legacy flat list for backwards compat
const SCENARIOS = ALL_SCENARIOS;


// ─────────────────────────────────────────────────────────────────────────────
// PERSONA FACTORY
// ─────────────────────────────────────────────────────────────────────────────
function mkP(o) {
  return {
    name: o.n, age: o.age, gender: o.g || "Male",
    country: o.c, cityType: o.city || "Urban",
    ethnicity: o.eth || "", religion: o.rel || "",
    language: o.lang || "Local language",
    income: o.inc || "Working class",
    education: o.edu || "High school / GED",
    occupationCategory: o.occ,
    occupation: o.job || o.occ,
    employmentStatus: o.emp || "Employed full-time",
    political: o.pol,
    values: o.vals || [],
    mediaHabits: o.media || [],
    personality: { O: o.O||0.5, C: o.C||0.5, E: o.E||0.5, A: o.A||0.5, N: o.N||0.5 },
    biases: { confirmation: o.cf||0.5, ingroup: o.ig||0.5, lossAversion: o.la||0.5, authority: o.au||0.5, optimism: o.op||0.5, statusQuo: o.sq||0.5 },
    mood: o.mood||0.55, stress: o.str||0.45, trust: o.tru||0.45, economicAnxiety: o.eco||0.45,
    emoji: o.em||"👤", backstory: o.back||"",
    pop: o.pop||null,  // millions of real people this archetype represents
    group: "", relations: [], id: null, color: null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL PERSONA LIBRARY  (census-accurate archetypes, 25 countries)
// Sources: UN WPP 2024, World Bank Gini, Pew Research, national censuses
// ─────────────────────────────────────────────────────────────────────────────
const RAW_LIBRARY = {
  "United States": [
    mkP({n:"James Walker",pop:28,age:52,g:"Male",c:"United States",city:"Rural",eth:"White / Anglo-Saxon",rel:"Evangelical / Pentecostal",lang:"English",inc:"Working class",edu:"High school / GED",occ:"Manufacturing / Factory",job:"Factory Line Worker",pol:"Right",vals:["Family","Hard work","Tradition","Faith / Religion","Security"],media:["Partisan TV news","Word-of-mouth community"],O:0.25,C:0.75,E:0.45,A:0.50,N:0.55,cf:0.73,ig:0.70,la:0.80,au:0.58,op:0.35,sq:0.70,mood:0.48,str:0.68,tru:0.28,eco:0.75,em:"👷",back:"Midwestern factory worker of 26 years. Evangelical faith and family are his pillars. Deeply distrustful of coastal elites. Fears automation will claim his livelihood before he retires."}),
    mkP({n:"Monique Davis",pop:9,age:38,g:"Female",c:"United States",city:"Urban",eth:"Black / African American",rel:"Protestant",lang:"English",inc:"Middle class",edu:"Bachelor's degree",occ:"Education / Academia",job:"Middle School Teacher",pol:"Center-left",vals:["Community","Justice","Education","Family","Equality"],media:["Social media heavy","Mainstream online news"],O:0.70,C:0.80,E:0.65,A:0.72,N:0.50,cf:0.45,ig:0.60,la:0.60,au:0.38,op:0.58,sq:0.42,mood:0.60,str:0.62,tru:0.42,eco:0.55,em:"👩‍🏫",back:"First in her family to finish college. Raised in Atlanta by a single mother. Passionate about her students but burned out by chronic underfunding and systemic inequality she witnesses daily."}),
    mkP({n:"Miguel Santos",pop:18,age:45,g:"Male",c:"United States",city:"Suburban",eth:"Hispanic / Latino",rel:"Catholic",lang:"Spanish, English",inc:"Working class",edu:"Some college",occ:"Manual Labor / Construction",job:"Construction Foreman",pol:"Center",vals:["Family","Hard work","Faith / Religion","Loyalty"],media:["Social media occasional","Mainstream TV news"],O:0.40,C:0.75,E:0.55,A:0.65,N:0.48,cf:0.58,ig:0.60,la:0.70,au:0.55,op:0.50,sq:0.58,mood:0.58,str:0.60,tru:0.40,eco:0.60,em:"🧑‍🔧",back:"Came from Oaxaca at 18, worked his way up from laborer to foreman. Proud of his story. Conflicted by immigration debates — grateful for his path but troubled by lawlessness. Votes on character, not party."}),
    mkP({n:"Kayla Chen",pop:4,age:27,g:"Female",c:"United States",city:"Megacity / Metro",eth:"Chinese / Han",rel:"Agnostic",lang:"English, Mandarin",inc:"Upper-middle class",edu:"Master's degree",occ:"Technology / Engineering",job:"Product Manager",pol:"Left",vals:["Innovation","Equality","Freedom","Environment","Justice"],media:["Social media heavy","Podcasts","Mainstream online news"],O:0.88,C:0.65,E:0.72,A:0.58,N:0.45,cf:0.40,ig:0.35,la:0.38,au:0.22,op:0.78,sq:0.28,mood:0.70,str:0.55,tru:0.45,eco:0.22,em:"👩‍💻",back:"Stanford grad working at a Bay Area tech firm. Politically engaged but increasingly disillusioned. Feels imposter syndrome about her privilege while experiencing model-minority pressure. Climate anxiety is constant."}),
    mkP({n:"Gary Hoffman",pop:42,age:68,g:"Male",c:"United States",city:"Suburban",eth:"White / Anglo-Saxon",rel:"Protestant",lang:"English",inc:"Middle class",edu:"Bachelor's degree",occ:"Retired",job:"Retired Engineer",emp:"Retired",pol:"Center-right",vals:["Security","Family","Order","Hard work","Tradition"],media:["Mainstream TV news","Print newspapers"],O:0.38,C:0.78,E:0.48,A:0.58,N:0.42,cf:0.60,ig:0.55,la:0.72,au:0.62,op:0.42,sq:0.72,mood:0.60,str:0.48,tru:0.48,eco:0.55,em:"👴",back:"Retired Ohio engineer. Worked hard, built a good life. Worries about Social Security, Medicare costs, and what country he's leaving his grandchildren. Moderate but increasingly alienated by culture wars from both sides."}),
    mkP({n:"Destiny Williams",pop:7,age:22,g:"Female",c:"United States",city:"Urban",eth:"Black / African American",rel:"Spiritual",lang:"English",inc:"Working poor",edu:"Some college",occ:"Service (Retail/Food/Hospitality)",job:"Retail Worker",emp:"Employed part-time",pol:"Left",vals:["Equality","Justice","Freedom","Community"],media:["Social media heavy","Alternative online news"],O:0.72,C:0.48,E:0.70,A:0.62,N:0.62,cf:0.55,ig:0.58,la:0.42,au:0.20,op:0.60,sq:0.22,mood:0.52,str:0.65,tru:0.22,eco:0.75,em:"👩",back:"Dropped out of community college to support her mom. Works two retail jobs. Active on social media and in local organizing. Angry at systemic barriers but energized by collective action movements."}),
    mkP({n:"Priya Nair",pop:3,age:33,g:"Female",c:"United States",city:"Suburban",eth:"South Asian (Indian)",rel:"Hinduism",lang:"English, Tamil",inc:"Upper-middle class",edu:"Master's degree",occ:"Healthcare",job:"Physician",pol:"Center-left",vals:["Family","Education","Achievement","Community","Civic duty"],media:["Mainstream online news","Podcasts"],O:0.68,C:0.88,E:0.55,A:0.70,N:0.38,cf:0.42,ig:0.52,la:0.55,au:0.65,op:0.62,sq:0.48,mood:0.65,str:0.60,tru:0.58,eco:0.25,em:"👩‍⚕️",back:"Second-generation Indian-American physician who grew up under intense parental pressure to succeed. Volunteers in underserved clinics. Balances progressive values with her family's more traditional expectations."}),
  ],
  "China": [
    mkP({n:"Li Wei",pop:50,age:35,g:"Male",c:"China",city:"Megacity / Metro",eth:"Chinese / Han",rel:"Secular / Cultural",lang:"Mandarin",inc:"Middle class",edu:"Bachelor's degree",occ:"Technology / Engineering",job:"Software Engineer",pol:"Apolitical",vals:["Achievement","Security","Family","Status","Hard work"],media:["Social media heavy","Mainstream online news"],O:0.62,C:0.80,E:0.55,A:0.52,N:0.45,cf:0.62,ig:0.68,la:0.55,au:0.65,op:0.60,sq:0.52,mood:0.62,str:0.58,tru:0.55,eco:0.42,em:"👨‍💻",back:"Grew up in Henan, passed gaokao, moved to Beijing for tech work. Navigates the 996 culture pragmatically. Politics is an abstraction he avoids. WeChat and Douyin are his entire media world."}),
    mkP({n:"Zhang Fang",pop:35,age:28,g:"Female",c:"China",city:"Megacity / Metro",eth:"Chinese / Han",rel:"Atheist / Non-religious",lang:"Mandarin",inc:"Lower-middle class",edu:"Bachelor's degree",occ:"Service (Retail/Food/Hospitality)",job:"Coffee Shop Worker",pol:"Apolitical",vals:["Independence","Creativity","Security","Freedom"],media:["Social media heavy","Alternative online news"],O:0.75,C:0.50,E:0.68,A:0.58,N:0.55,cf:0.52,ig:0.58,la:0.42,au:0.50,op:0.65,sq:0.35,mood:0.60,str:0.60,tru:0.45,eco:0.60,em:"👩",back:"Part of the 'lying flat' (tangping) generation. Graduated into a brutal job market. Works in a cafe, creates art at night. Quietly subversive about the hustle culture her parents embodied."}),
    mkP({n:"Chen Jianguo",pop:120,age:58,g:"Male",c:"China",city:"Rural",eth:"Chinese / Han",rel:"Animism / Folk Religion",lang:"Mandarin, local dialect",inc:"Below poverty line",edu:"Primary school",occ:"Agriculture / Farming",job:"Subsistence Farmer",pol:"Apolitical",vals:["Family","Security","Tradition","Hard work"],media:["Mainstream TV news","Low media engagement"],O:0.28,C:0.70,E:0.40,A:0.62,N:0.48,cf:0.68,ig:0.72,la:0.78,au:0.72,op:0.38,sq:0.78,mood:0.45,str:0.62,tru:0.58,eco:0.75,em:"👨‍🌾",back:"Lifelong farmer in Sichuan, sent his son to the city as a migrant worker. Cash income is precarious. State TV is his window to the world. Trusts the Party abstractly but rarely in local practice."}),
    mkP({n:"Wang Mei",pop:45,age:42,g:"Female",c:"China",city:"Urban",eth:"Chinese / Han",rel:"Buddhism",lang:"Mandarin",inc:"Middle class",edu:"Bachelor's degree",occ:"Education / Academia",job:"Primary School Teacher",pol:"Center",vals:["Family","Education","Security","Conformity","Tradition"],media:["Social media occasional","Mainstream TV news"],O:0.50,C:0.82,E:0.50,A:0.72,N:0.40,cf:0.60,ig:0.65,la:0.65,au:0.68,op:0.52,sq:0.65,mood:0.58,str:0.55,tru:0.60,eco:0.45,em:"👩‍🏫",back:"Dedicated teacher in Chengdu, Party member by pragmatic choice. Anxious about her daughter's gaokao performance. Private Buddhist, careful about public expression of any views that might cause friction."}),
    mkP({n:"Zhao Peng",pop:80,age:24,g:"Male",c:"China",city:"Urban",eth:"Chinese / Han",rel:"Atheist / Non-religious",lang:"Mandarin",inc:"Working poor",edu:"Vocational / Trade school",occ:"Manufacturing / Factory",job:"Factory Worker",pol:"Nationalist / Populist",vals:["Nationalism","Hard work","Security","Honor"],media:["Social media heavy","Mainstream online news"],O:0.38,C:0.62,E:0.48,A:0.42,N:0.58,cf:0.68,ig:0.78,la:0.52,au:0.60,op:0.45,sq:0.55,mood:0.48,str:0.65,tru:0.50,eco:0.68,em:"👨‍🏭",back:"Left rural Anhui at 18 for a Shenzhen factory. Lives in a dorm, sends money home. Channels his frustration with the economic ladder into fierce national pride online. Angry at the US and disillusioned."}),
  ],
  "India": [
    mkP({n:"Ramesh Kumar",pop:180,age:45,g:"Male",c:"India",city:"Rural",eth:"South Asian (Indian)",rel:"Hinduism",lang:"Hindi",inc:"Below poverty line",edu:"Primary school",occ:"Agriculture / Farming",job:"Subsistence Farmer",pol:"Nationalist / Populist",vals:["Family","Faith / Religion","Tradition","Hard work","Security"],media:["Mainstream TV news","Word-of-mouth community"],O:0.28,C:0.65,E:0.42,A:0.60,N:0.52,cf:0.72,ig:0.78,la:0.80,au:0.62,op:0.35,sq:0.78,mood:0.42,str:0.72,tru:0.35,eco:0.85,em:"👨‍🌾",back:"Small farmer in eastern UP with under an acre. Two bad monsoons put him in debt. Deep BJP voter. WhatsApp is his primary news source. Hindu identity is central to how he sees the world and its threats."}),
    mkP({n:"Priyanka Sharma",pop:20,age:28,g:"Female",c:"India",city:"Megacity / Metro",eth:"South Asian (Indian)",rel:"Hinduism",lang:"Hindi, English",inc:"Middle class",edu:"Bachelor's degree",occ:"Technology / Engineering",job:"IT Analyst",pol:"Center-left",vals:["Education","Independence","Equality","Achievement"],media:["Social media heavy","Mainstream online news"],O:0.75,C:0.72,E:0.65,A:0.60,N:0.50,cf:0.45,ig:0.52,la:0.45,au:0.38,op:0.68,sq:0.35,mood:0.65,str:0.58,tru:0.42,eco:0.38,em:"👩‍💻",back:"First-generation urban professional from a Rajasthan village, now at a Bengaluru IT firm. Navigating family marriage pressure versus personal ambitions. Growing intersectional awareness about caste and gender privilege."}),
    mkP({n:"Mohammed Iqbal",pop:40,age:40,g:"Male",c:"India",city:"Urban",eth:"South Asian (Indian)",rel:"Islam (Sunni)",lang:"Urdu, Hindi",inc:"Working class",edu:"Middle school",occ:"Service (Retail/Food/Hospitality)",job:"Auto-Rickshaw Driver",pol:"Center-left",vals:["Family","Faith / Religion","Community","Hard work"],media:["Social media occasional","Radio"],O:0.38,C:0.68,E:0.52,A:0.65,N:0.58,cf:0.62,ig:0.68,la:0.70,au:0.52,op:0.42,sq:0.60,mood:0.48,str:0.68,tru:0.28,eco:0.72,em:"🧑",back:"Muslim rickshaw driver in Lucknow. His family is his anchor. Increasingly anxious about mob violence and erosion of Muslim civil rights. Experienced discrimination but remains non-confrontational. His faith is quiet and private."}),
    mkP({n:"Suresh Nadar",pop:60,age:50,g:"Male",c:"India",city:"Rural",eth:"South Asian (Indian)",rel:"Hinduism",lang:"Tamil",inc:"Working poor",edu:"Primary school",occ:"Agriculture / Farming",job:"Agricultural Laborer",pol:"Left",vals:["Equality","Justice","Community","Hard work"],media:["Low media engagement","Word-of-mouth community"],O:0.32,C:0.62,E:0.38,A:0.65,N:0.55,cf:0.62,ig:0.65,la:0.72,au:0.45,op:0.35,sq:0.68,mood:0.38,str:0.75,tru:0.25,eco:0.85,em:"👨‍🌾",back:"Dalit agricultural laborer in rural Tamil Nadu. Has faced caste discrimination his whole life. DMK voter. Wants his children to escape farm labor but sees few pathways out."}),
    mkP({n:"Anjali Patel",pop:18,age:35,g:"Female",c:"India",city:"Urban",eth:"South Asian (Indian)",rel:"Hinduism",lang:"Gujarati, English",inc:"Upper-middle class",edu:"Master's degree",occ:"Business / Finance",job:"Financial Analyst",pol:"Center-right",vals:["Achievement","Family","Security","Tradition","Status"],media:["Mainstream online news","Podcasts"],O:0.62,C:0.85,E:0.60,A:0.55,N:0.38,cf:0.52,ig:0.58,la:0.58,au:0.60,op:0.62,sq:0.55,mood:0.68,str:0.52,tru:0.55,eco:0.30,em:"👩‍💼",back:"From a prosperous Ahmedabad business family, MBA from a top Indian school. Supports Modi economically, worried about polarization socially. Believes India's moment has arrived but is anxious about governance quality."}),
    mkP({n:"Arjun Singh",pop:45,age:22,g:"Male",c:"India",city:"Urban",eth:"South Asian (Indian)",rel:"Hinduism",lang:"Hindi, English",inc:"Lower-middle class",edu:"Some college",occ:"Unemployed",job:"Recent Graduate",emp:"Unemployed",pol:"Nationalist / Populist",vals:["Nationalism","Achievement","Independence","Honor"],media:["Social media heavy","Alternative online news"],O:0.55,C:0.52,E:0.65,A:0.45,N:0.65,cf:0.68,ig:0.75,la:0.42,au:0.45,op:0.50,sq:0.38,mood:0.42,str:0.72,tru:0.28,eco:0.78,em:"👦",back:"BA graduate in Delhi, unable to find work for a year. Part of India's massive unemployed youth cohort. Channels frustration into Hindutva nationalism online. Aspirational but structurally blocked."}),
  ],
  "Indonesia": [
    mkP({n:"Budi Santoso",pop:28,age:42,g:"Male",c:"Indonesia",city:"Rural",eth:"Southeast Asian",rel:"Islam (Sunni)",lang:"Indonesian, Javanese",inc:"Working poor",edu:"Middle school",occ:"Agriculture / Farming",job:"Rice Farmer",pol:"Religious Conservative",vals:["Faith / Religion","Family","Tradition","Hard work","Community"],media:["Social media occasional","Religious media"],O:0.30,C:0.65,E:0.42,A:0.68,N:0.50,cf:0.70,ig:0.72,la:0.78,au:0.65,op:0.32,sq:0.75,mood:0.45,str:0.65,tru:0.40,eco:0.78,em:"👨‍🌾",back:"Javanese rice farmer on his grandfather's land. Mosque is his social world. Has benefited from government rice subsidies. Votes for Islamic parties. Suspicious of Chinese business presence in his area."}),
    mkP({n:"Sari Wulandari",pop:20,age:30,g:"Female",c:"Indonesia",city:"Megacity / Metro",eth:"Southeast Asian",rel:"Islam (Sunni)",lang:"Indonesian",inc:"Lower-middle class",edu:"Bachelor's degree",occ:"Service (Retail/Food/Hospitality)",job:"Bank Teller",pol:"Center",vals:["Family","Security","Education","Faith / Religion"],media:["Social media heavy","Mainstream online news"],O:0.58,C:0.72,E:0.62,A:0.70,N:0.45,cf:0.52,ig:0.58,la:0.60,au:0.58,op:0.55,sq:0.55,mood:0.60,str:0.55,tru:0.50,eco:0.52,em:"🧕",back:"Jakarta bank teller who wears hijab by choice. Navigates modernity with Islamic values intact. Sends money to her East Java family. Dreams of homeownership in a city where prices are impossible."}),
    mkP({n:"Thomas Manurung",pop:5,age:38,g:"Male",c:"Indonesia",city:"Urban",eth:"Southeast Asian",rel:"Protestant",lang:"Indonesian, Batak",inc:"Middle class",edu:"Bachelor's degree",occ:"Business / Finance",job:"Accountant",pol:"Center",vals:["Family","Achievement","Education","Security"],media:["Mainstream online news","Social media occasional"],O:0.58,C:0.80,E:0.52,A:0.65,N:0.40,cf:0.48,ig:0.55,la:0.60,au:0.55,op:0.58,sq:0.52,mood:0.62,str:0.50,tru:0.52,eco:0.40,em:"👨‍💼",back:"Batak Christian accountant in Surabaya. As a religious minority, he's acutely aware of rising Islamist conservatism. Pragmatic voter: anti-corruption above all else."}),
    mkP({n:"Devi Rahayu",pop:15,age:24,g:"Female",c:"Indonesia",city:"Urban",eth:"Southeast Asian",rel:"Islam (Sunni)",lang:"Indonesian",inc:"Working poor",edu:"High school / GED",occ:"Manufacturing / Factory",job:"Garment Worker",pol:"Left",vals:["Justice","Equality","Family","Hard work"],media:["Social media heavy","Alternative online news"],O:0.52,C:0.58,E:0.58,A:0.62,N:0.60,cf:0.55,ig:0.52,la:0.55,au:0.30,op:0.50,sq:0.35,mood:0.45,str:0.68,tru:0.28,eco:0.78,em:"👩‍🏭",back:"Bandung garment worker, union member. Works 12-hour shifts making clothes for Western brands. Participates in wage protests. Follows Indonesian labor rights accounts on TikTok and believes collective action can work."}),
  ],
  "Pakistan": [
    mkP({n:"Khan Abdul",pop:25,age:48,g:"Male",c:"Pakistan",city:"Rural",eth:"South Asian (Indian)",rel:"Islam (Sunni)",lang:"Pashto, Urdu",inc:"Working poor",edu:"Primary school",occ:"Agriculture / Farming",job:"Wheat Farmer",pol:"Religious Conservative",vals:["Faith / Religion","Family","Honor","Tradition","Loyalty"],media:["Radio","Word-of-mouth community","Religious media"],O:0.22,C:0.65,E:0.40,A:0.58,N:0.52,cf:0.78,ig:0.82,la:0.82,au:0.72,op:0.30,sq:0.82,mood:0.42,str:0.70,tru:0.30,eco:0.82,em:"👨‍🌾",back:"Pashtun wheat farmer in KPK near the Afghan border. Extended family (biradari) is the primary social unit. Deep Islamic faith guides every decision. Has seen military operations and Taliban nearby. Distrusts America and India profoundly."}),
    mkP({n:"Fatima Malik",pop:6,age:32,g:"Female",c:"Pakistan",city:"Urban",eth:"South Asian (Indian)",rel:"Islam (Sunni)",lang:"Urdu, English",inc:"Middle class",edu:"Bachelor's degree",occ:"Education / Academia",job:"University Lecturer",pol:"Center-left",vals:["Education","Family","Justice","Equality","Faith / Religion"],media:["Social media heavy","Mainstream online news","Podcasts"],O:0.70,C:0.78,E:0.58,A:0.68,N:0.48,cf:0.48,ig:0.52,la:0.55,au:0.40,op:0.60,sq:0.40,mood:0.55,str:0.62,tru:0.32,eco:0.58,em:"🧕",back:"Lahore university lecturer, secular-leaning but practicing Muslim. Frustrated by Pakistan's economic chaos and brain drain. Active on Twitter. Caught between progressive values and family pressure to marry."}),
    mkP({n:"Asif Qureshi",pop:4,age:55,g:"Male",c:"Pakistan",city:"Urban",eth:"South Asian (Indian)",rel:"Islam (Sunni)",lang:"Urdu, Punjabi",inc:"Upper-middle class",edu:"Bachelor's degree",occ:"Business / Finance",job:"Textile Business Owner",emp:"Self-employed",pol:"Center-right",vals:["Wealth","Family","Order","Security","Tradition"],media:["Mainstream TV news","Social media occasional"],O:0.38,C:0.80,E:0.50,A:0.48,N:0.40,cf:0.62,ig:0.68,la:0.72,au:0.62,op:0.48,sq:0.68,mood:0.55,str:0.55,tru:0.32,eco:0.55,em:"👨‍💼",back:"Faisalabad textile exporter furious about currency collapse and power outages hurting his business. Wants stability above ideology. Has sent his children abroad. Nostalgic for Musharraf-era economic growth."}),
    mkP({n:"Zainab Shah",pop:10,age:19,g:"Female",c:"Pakistan",city:"Urban",eth:"South Asian (Indian)",rel:"Islam (Sunni)",lang:"Urdu",inc:"Lower-middle class",edu:"High school / GED",occ:"Student",job:"University Student",emp:"Student",pol:"Left",vals:["Education","Freedom","Equality","Justice","Independence"],media:["Social media heavy","Alternative online news"],O:0.78,C:0.55,E:0.68,A:0.62,N:0.60,cf:0.52,ig:0.48,la:0.38,au:0.22,op:0.68,sq:0.25,mood:0.55,str:0.65,tru:0.22,eco:0.65,em:"👩",back:"First-year Karachi university student, part of the feminist aurat march movement. Shares content secretly on TikTok. Struggles against family pressure, street harassment, and economic uncertainty simultaneously."}),
  ],
  "Brazil": [
    mkP({n:"Marcos Oliveira",pop:18,age:35,g:"Male",c:"Brazil",city:"Urban",eth:"Black / Afro-Caribbean",rel:"Evangelical / Pentecostal",lang:"Portuguese",inc:"Working poor",edu:"High school / GED",occ:"Service (Retail/Food/Hospitality)",job:"Delivery App Driver",emp:"Gig / informal economy",pol:"Center-right",vals:["Family","Faith / Religion","Hard work","Security"],media:["Social media heavy","Religious media"],O:0.45,C:0.62,E:0.62,A:0.65,N:0.58,cf:0.60,ig:0.62,la:0.68,au:0.52,op:0.45,sq:0.55,mood:0.48,str:0.68,tru:0.28,eco:0.80,em:"🧑",back:"São Paulo delivery driver from a favela. Evangelical church is his community anchor. Voted Bolsonaro prioritizing order and faith over identity politics. Has no safety net and works 70-hour weeks to survive."}),
    mkP({n:"Ana Souza",pop:8,age:42,g:"Female",c:"Brazil",city:"Megacity / Metro",eth:"Mixed / Multiracial",rel:"Agnostic",lang:"Portuguese",inc:"Middle class",edu:"Master's degree",occ:"Education / Academia",job:"University Professor",pol:"Left",vals:["Justice","Education","Equality","Environment","Freedom"],media:["Social media heavy","Mainstream online news","Podcasts"],O:0.85,C:0.72,E:0.68,A:0.62,N:0.50,cf:0.42,ig:0.38,la:0.48,au:0.30,op:0.68,sq:0.28,mood:0.58,str:0.62,tru:0.38,eco:0.42,em:"👩‍🏫",back:"Rio social science professor and Lula voter. Studies racial inequality. Hopeful about democratic renewal but deeply anxious about Bolsonarismo as a permanent political force. Passionate Amazon advocate."}),
    mkP({n:"João Ferreira",pop:22,age:58,g:"Male",c:"Brazil",city:"Rural",eth:"Mixed / Multiracial",rel:"Catholic",lang:"Portuguese",inc:"Working class",edu:"Primary school",occ:"Agriculture / Farming",job:"Sugarcane Worker",pol:"Nationalist / Populist",vals:["Tradition","Family","Hard work","Faith / Religion","Security"],media:["Mainstream TV news","Word-of-mouth community"],O:0.28,C:0.70,E:0.42,A:0.60,N:0.50,cf:0.70,ig:0.65,la:0.78,au:0.62,op:0.35,sq:0.72,mood:0.45,str:0.68,tru:0.30,eco:0.75,em:"👷",back:"Nordeste sugarcane cutter. Deep Catholic faith. Has followed rural-to-urban migration waves and back. Feels completely invisible to the political class from both left and right."}),
    mkP({n:"Isabella Costa",pop:6,age:26,g:"Female",c:"Brazil",city:"Megacity / Metro",eth:"White / Southern European",rel:"Catholic",lang:"Portuguese, English",inc:"Upper-middle class",edu:"Bachelor's degree",occ:"Business / Finance",job:"Marketing Executive",pol:"Center-right",vals:["Achievement","Status","Security","Freedom","Wealth"],media:["Social media heavy","Mainstream online news"],O:0.65,C:0.75,E:0.78,A:0.52,N:0.42,cf:0.50,ig:0.52,la:0.55,au:0.48,op:0.70,sq:0.48,mood:0.68,str:0.50,tru:0.48,eco:0.28,em:"👩",back:"São Paulo marketing professional. Frustrated by Brazil's inequality while benefiting from it. Supports fiscal responsibility and fears economic mismanagement from the left. Sends work abroad when possible."}),
  ],
  "Nigeria": [
    mkP({n:"Musa Ibrahim",pop:12,age:45,g:"Male",c:"Nigeria",city:"Rural",eth:"West African",rel:"Islam (Sunni)",lang:"Hausa, Fulfulde",inc:"Below poverty line",edu:"Primary school",occ:"Agriculture / Farming",job:"Cattle Herder",pol:"Nationalist / Populist",vals:["Faith / Religion","Family","Tradition","Honor","Loyalty"],media:["Radio","Word-of-mouth community","Religious media"],O:0.25,C:0.62,E:0.42,A:0.60,N:0.52,cf:0.75,ig:0.82,la:0.80,au:0.68,op:0.30,sq:0.80,mood:0.40,str:0.72,tru:0.22,eco:0.85,em:"👨‍🌾",back:"Fulani herder in Kaduna. Constant land conflicts with farming communities are a source of existential fear. BBC Hausa radio is his world. Sees the Nigerian state as fundamentally hostile to his people."}),
    mkP({n:"Chioma Okafor",pop:8,age:32,g:"Female",c:"Nigeria",city:"Megacity / Metro",eth:"West African",rel:"Evangelical / Pentecostal",lang:"Igbo, English",inc:"Middle class",edu:"Bachelor's degree",occ:"Business / Finance",job:"Bank Manager",pol:"Center",vals:["Achievement","Family","Community","Education","Status"],media:["Social media heavy","Mainstream online news"],O:0.68,C:0.82,E:0.72,A:0.60,N:0.45,cf:0.48,ig:0.60,la:0.60,au:0.50,op:0.65,sq:0.45,mood:0.62,str:0.58,tru:0.38,eco:0.48,em:"👩‍💼",back:"Igbo bank manager in Lagos. The hustle is her philosophy. Sends money back to Enugu. Furious about corruption. Evangelical church every Sunday. Deeply proud of her self-made success."}),
    mkP({n:"Emeka Eze",pop:14,age:25,g:"Male",c:"Nigeria",city:"Megacity / Metro",eth:"West African",rel:"Evangelical / Pentecostal",lang:"Yoruba, English",inc:"Working poor",edu:"Some college",occ:"Informal Economy",job:"Motorcycle Taxi Rider",emp:"Self-employed",pol:"Left",vals:["Justice","Freedom","Independence","Equality"],media:["Social media heavy","Alternative online news"],O:0.62,C:0.50,E:0.70,A:0.55,N:0.65,cf:0.52,ig:0.58,la:0.48,au:0.18,op:0.55,sq:0.22,mood:0.45,str:0.72,tru:0.15,eco:0.85,em:"🧑",back:"Lagos okada rider with a Higher National Diploma but no formal work. Participated in #EndSARS protests. Part of the Japa generation desperately trying to emigrate. Deeply cynical about the entire political class."}),
    mkP({n:"Grace Adeyemi",pop:18,age:55,g:"Female",c:"Nigeria",city:"Urban",eth:"West African",rel:"Evangelical / Pentecostal",lang:"Yoruba, English",inc:"Lower-middle class",edu:"High school / GED",occ:"Service (Retail/Food/Hospitality)",job:"Market Trader",emp:"Self-employed",pol:"Center",vals:["Family","Faith / Religion","Hard work","Community","Security"],media:["Mainstream TV news","Radio","Social media occasional"],O:0.35,C:0.72,E:0.65,A:0.72,N:0.48,cf:0.62,ig:0.65,la:0.72,au:0.58,op:0.40,sq:0.65,mood:0.52,str:0.65,tru:0.28,eco:0.72,em:"👩",back:"Ibadan market trader who raised four children on petty trading income. Church is her social network. Votes on whether a politician has visibly built something. Inflation has been catastrophic to her small savings."}),
  ],
  "Russia": [
    mkP({n:"Sergei Volkov",pop:10,age:55,g:"Male",c:"Russia",city:"Small town",eth:"Russian / East Slavic",rel:"Eastern Orthodox",lang:"Russian",inc:"Working class",edu:"Vocational / Trade school",occ:"Manufacturing / Factory",job:"Factory Worker",pol:"Nationalist / Populist",vals:["Nationalism","Tradition","Security","Order","Loyalty"],media:["Mainstream TV news","Social media occasional"],O:0.28,C:0.72,E:0.42,A:0.50,N:0.52,cf:0.75,ig:0.78,la:0.78,au:0.70,op:0.38,sq:0.75,mood:0.45,str:0.62,tru:0.45,eco:0.65,em:"👷",back:"Ural factory worker who sees NATO expansion as the true cause of the Ukraine war. Proud of Russia's resurgence. His son is at the front — a source of immense private anxiety he buries under public patriotism."}),
    mkP({n:"Natasha Ivanova",pop:6,age:35,g:"Female",c:"Russia",city:"Megacity / Metro",eth:"Russian / East Slavic",rel:"Secular / Cultural",lang:"Russian, English",inc:"Upper-middle class",edu:"Master's degree",occ:"Technology / Engineering",job:"Software Developer",pol:"Center-left",vals:["Freedom","Independence","Education","Creativity"],media:["Social media heavy","Alternative online news","International media"],O:0.80,C:0.72,E:0.58,A:0.60,N:0.48,cf:0.42,ig:0.38,la:0.48,au:0.22,op:0.70,sq:0.25,mood:0.45,str:0.62,tru:0.18,eco:0.40,em:"👩‍💻",back:"Moscow tech worker who uses a VPN to follow independent journalism. Considered emigrating after the invasion but stayed for her aging parents. Deeply conflicted — grieving her country's path in silence out of necessity."}),
    mkP({n:"Viktor Morozov",pop:12,age:65,g:"Male",c:"Russia",city:"Rural",eth:"Russian / East Slavic",rel:"Eastern Orthodox",lang:"Russian",inc:"Below poverty line",edu:"Primary school",occ:"Agriculture / Farming",job:"Village Farmer",emp:"Self-employed",pol:"Nationalist / Populist",vals:["Tradition","Faith / Religion","Nationalism","Security","Family"],media:["Mainstream TV news","Low media engagement"],O:0.22,C:0.65,E:0.38,A:0.58,N:0.45,cf:0.80,ig:0.82,la:0.80,au:0.75,op:0.28,sq:0.82,mood:0.42,str:0.60,tru:0.55,eco:0.72,em:"👴",back:"Rural Pskov pensioner for whom state television is reality. Sincerely believes in Putin's leadership and the Orthodox Church's moral authority. Has lived through Soviet collapse and NATO's eastward march. The war feels righteous."}),
    mkP({n:"Alexei Nikitin",pop:5,age:28,g:"Male",c:"Russia",city:"Urban",eth:"Russian / East Slavic",rel:"Agnostic",lang:"Russian",inc:"Lower-middle class",edu:"Bachelor's degree",occ:"Service (Retail/Food/Hospitality)",job:"Barista",pol:"Left",vals:["Freedom","Justice","Independence","Equality"],media:["Alternative online news","Social media heavy","International media"],O:0.75,C:0.52,E:0.65,A:0.58,N:0.60,cf:0.40,ig:0.35,la:0.42,au:0.18,op:0.62,sq:0.22,mood:0.38,str:0.72,tru:0.12,eco:0.65,em:"🧑",back:"St. Petersburg barista who attended anti-war protests until they became too dangerous. Follows Telegram channels for real news. Feels trapped — can't afford to emigrate, terrified of conscription, simmering with rage."}),
  ],
  "Ethiopia": [
    mkP({n:"Bekele Tadesse",pop:20,age:40,g:"Male",c:"Ethiopia",city:"Remote rural",eth:"Somali / East African",rel:"Eastern Orthodox",lang:"Amharic",inc:"Extreme poverty",edu:"Primary school",occ:"Agriculture / Farming",job:"Subsistence Farmer",emp:"Self-employed",pol:"Apolitical",vals:["Family","Faith / Religion","Tradition","Survival","Community"],media:["Radio","Word-of-mouth community"],O:0.28,C:0.62,E:0.38,A:0.70,N:0.50,cf:0.70,ig:0.80,la:0.82,au:0.68,op:0.32,sq:0.80,mood:0.40,str:0.72,tru:0.32,eco:0.90,em:"👨‍🌾",back:"Tigray Orthodox farmer who survived the recent civil war and its famine aftermath. The church is the center of social life. Federal government trust is near zero after the conflict. Every harvest determines survival."}),
    mkP({n:"Selamawit Girma",pop:4,age:28,g:"Female",c:"Ethiopia",city:"Urban",eth:"Somali / East African",rel:"Eastern Orthodox",lang:"Amharic, English",inc:"Lower-middle class",edu:"Bachelor's degree",occ:"Healthcare",job:"Nurse",pol:"Center",vals:["Community","Education","Family","Civic duty","Equality"],media:["Social media occasional","Mainstream online news"],O:0.62,C:0.75,E:0.55,A:0.72,N:0.48,cf:0.50,ig:0.58,la:0.60,au:0.52,op:0.55,sq:0.48,mood:0.55,str:0.62,tru:0.38,eco:0.62,em:"👩‍⚕️",back:"Addis Ababa nurse from a rural background who earned a scholarship out. Witnesses immense health inequality daily. Cautiously optimistic about Ethiopia's future but deeply worried about ethnic conflict fragmenting everything."}),
    mkP({n:"Omar Hassan",pop:5,age:35,g:"Male",c:"Ethiopia",city:"Rural",eth:"Somali / East African",rel:"Islam (Sunni)",lang:"Somali, Amharic",inc:"Working poor",edu:"Middle school",occ:"Transportation / Logistics",job:"Truck Driver",emp:"Self-employed",pol:"Apolitical",vals:["Family","Faith / Religion","Community","Hard work"],media:["Radio","Word-of-mouth community"],O:0.35,C:0.65,E:0.52,A:0.65,N:0.52,cf:0.65,ig:0.75,la:0.72,au:0.55,op:0.40,sq:0.70,mood:0.45,str:0.65,tru:0.28,eco:0.78,em:"🧑",back:"Ethnic Somali truck driver in the Ogaden region. Primary identity is Somali-Muslim, secondarily Ethiopian. Lives in a zone of historic ethnic tension. The central government is a foreign entity, not a protector."}),
  ],
  "Mexico": [
    mkP({n:"Rosa Hernández",pop:12,age:48,g:"Female",c:"Mexico",city:"Rural",eth:"Hispanic / Latino",rel:"Catholic",lang:"Spanish, Nahuatl",inc:"Below poverty line",edu:"Primary school",occ:"Agriculture / Farming",job:"Subsistence Farmer",emp:"Self-employed",pol:"Left",vals:["Family","Tradition","Faith / Religion","Community","Hard work"],media:["Mainstream TV news","Word-of-mouth community"],O:0.30,C:0.65,E:0.45,A:0.72,N:0.52,cf:0.68,ig:0.72,la:0.78,au:0.58,op:0.38,sq:0.75,mood:0.42,str:0.68,tru:0.30,eco:0.85,em:"👩‍🌾",back:"Indigenous Nahuatl woman in Oaxaca growing corn on communal ejido land. Her son sends remittances from the US. Voted AMLO. Deep attachment to traditional practices. The cartels are a background fact of life, unavoidable."}),
    mkP({n:"Carlos Ramírez",pop:8,age:38,g:"Male",c:"Mexico",city:"Megacity / Metro",eth:"Hispanic / Latino",rel:"Secular / Cultural",lang:"Spanish",inc:"Middle class",edu:"Bachelor's degree",occ:"Business / Finance",job:"Accountant",pol:"Center-right",vals:["Security","Achievement","Family","Order","Wealth"],media:["Mainstream online news","Social media occasional"],O:0.48,C:0.82,E:0.52,A:0.55,N:0.42,cf:0.55,ig:0.58,la:0.68,au:0.58,op:0.52,sq:0.62,mood:0.58,str:0.58,tru:0.35,eco:0.50,em:"👨‍💼",back:"Mexico City accountant tired of AMLO's populism and worried about rule of law. His children attend private school. Nostalgic for the pre-cartel Mexico of his childhood. Fiscal conservative, social moderate."}),
    mkP({n:"Luis Torres",pop:10,age:25,g:"Male",c:"Mexico",city:"Small town",eth:"Hispanic / Latino",rel:"Evangelical / Pentecostal",lang:"Spanish",inc:"Working poor",edu:"High school / GED",occ:"Manual Labor / Construction",job:"Construction Worker",pol:"Center",vals:["Family","Hard work","Faith / Religion","Security","Loyalty"],media:["Social media heavy","Mainstream TV news"],O:0.38,C:0.65,E:0.55,A:0.65,N:0.60,cf:0.62,ig:0.65,la:0.72,au:0.55,op:0.42,sq:0.65,mood:0.50,str:0.65,tru:0.28,eco:0.78,em:"👷",back:"Guanajuato construction worker seriously considering migrating to the US through a dangerous crossing. Recently converted from Catholicism to Evangelical faith. Sees cartel recruitment of young men as an inevitable gravity."}),
    mkP({n:"Valeria Morales",pop:3,age:30,g:"Female",c:"Mexico",city:"Urban",eth:"Hispanic / Latino",rel:"Agnostic",lang:"Spanish, English",inc:"Upper-middle class",edu:"Master's degree",occ:"Arts / Media / Creative",job:"Investigative Journalist",pol:"Left",vals:["Justice","Freedom","Equality","Truth","Environment"],media:["Social media heavy","Mainstream online news","International media"],O:0.85,C:0.68,E:0.70,A:0.58,N:0.55,cf:0.38,ig:0.35,la:0.42,au:0.20,op:0.70,sq:0.22,mood:0.50,str:0.68,tru:0.22,eco:0.38,em:"👩",back:"Monterrey investigative journalist covering cartel-government corruption. Has received death threats. Feminist activist. Furious at Mexico's femicide rates. Her work is both vital and existentially dangerous."}),
  ],
  "Japan": [
    mkP({n:"Tanaka Hiroshi",pop:18,age:48,g:"Male",c:"Japan",city:"Urban",eth:"Japanese",rel:"Secular / Cultural",lang:"Japanese",inc:"Middle class",edu:"Bachelor's degree",occ:"Business / Finance",job:"Company Salaryman",pol:"Center-right",vals:["Conformity","Security","Hard work","Loyalty","Order"],media:["Print newspapers","Mainstream TV news"],O:0.38,C:0.88,E:0.42,A:0.68,N:0.42,cf:0.60,ig:0.70,la:0.68,au:0.72,op:0.42,sq:0.75,mood:0.50,str:0.65,tru:0.58,eco:0.48,em:"👨‍💼",back:"LDP-voting Tokyo salaryman at a trading company. Works 60-hour weeks out of duty and shame about leaving early. Pension worries him. Uncomfortable with immigration as a demographic solution but won't say so publicly."}),
    mkP({n:"Yamamoto Yuki",pop:8,age:26,g:"Female",c:"Japan",city:"Megacity / Metro",eth:"Japanese",rel:"Agnostic",lang:"Japanese, English",inc:"Lower-middle class",edu:"Bachelor's degree",occ:"Service (Retail/Food/Hospitality)",job:"Precarious Service Worker",emp:"Employed part-time",pol:"Center-left",vals:["Freedom","Equality","Creativity","Independence"],media:["Social media heavy","Mainstream online news"],O:0.78,C:0.55,E:0.60,A:0.62,N:0.62,cf:0.45,ig:0.50,la:0.45,au:0.30,op:0.58,sq:0.30,mood:0.48,str:0.65,tru:0.35,eco:0.68,em:"👩",back:"Tokyo irregular worker who didn't fit the salaryman track. Struggles with karoshi culture and rising loneliness. Part of Japan's growing feminist consciousness. Anxious about aging alone and the cost of being alive."}),
    mkP({n:"Sato Kenji",pop:12,age:72,g:"Male",c:"Japan",city:"Rural",eth:"Japanese",rel:"Spiritual",lang:"Japanese",inc:"Middle class",edu:"High school / GED",occ:"Retired",job:"Retired Factory Worker",emp:"Retired",pol:"Center-right",vals:["Tradition","Family","Security","Order","Hard work"],media:["Mainstream TV news","Print newspapers"],O:0.28,C:0.80,E:0.40,A:0.65,N:0.38,cf:0.68,ig:0.78,la:0.72,au:0.72,op:0.35,sq:0.80,mood:0.55,str:0.45,tru:0.65,eco:0.40,em:"👴",back:"Retired factory worker in depopulating rural Akita. His children moved to Tokyo. Maintains a Shinto home altar. Reads the newspaper daily. Deeply worried about China's rising power and proud of Abe's legacy."}),
    mkP({n:"Kimura Emi",pop:6,age:35,g:"Female",c:"Japan",city:"Urban",eth:"Japanese",rel:"Secular / Cultural",lang:"Japanese, English",inc:"Upper-middle class",edu:"Master's degree",occ:"Technology / Engineering",job:"UX Designer",pol:"Center-left",vals:["Creativity","Independence","Equality","Family"],media:["Social media occasional","Mainstream online news","Podcasts"],O:0.80,C:0.68,E:0.62,A:0.65,N:0.48,cf:0.42,ig:0.48,la:0.50,au:0.38,op:0.65,sq:0.38,mood:0.60,str:0.55,tru:0.48,eco:0.35,em:"👩‍💻",back:"Tokyo startup UX designer who postponed marriage and children. Japan's gender expectations feel suffocating. Advocates for gender equality through her design work. Cautiously hopeful that things might slowly change."}),
  ],
  "Germany": [
    mkP({n:"Klaus Schneider",pop:5,age:58,g:"Male",c:"Germany",city:"Small town",eth:"White / Eastern European",rel:"Secular / Cultural",lang:"German",inc:"Working class",edu:"Vocational / Trade school",occ:"Manufacturing / Factory",job:"Auto Plant Worker",pol:"Nationalist / Populist",vals:["Security","Tradition","Order","Nationalism","Family"],media:["Mainstream TV news","Partisan TV news","Social media occasional"],O:0.28,C:0.75,E:0.45,A:0.50,N:0.55,cf:0.72,ig:0.75,la:0.78,au:0.55,op:0.35,sq:0.75,mood:0.42,str:0.65,tru:0.28,eco:0.68,em:"👷",back:"Former DDR citizen in Saxony voting AfD. Feels West Germany colonized the East after reunification. Furious about energy prices and migrant numbers. His VW plant is threatening EV-related layoffs."}),
    mkP({n:"Sophie Müller",pop:7,age:32,g:"Female",c:"Germany",city:"Megacity / Metro",eth:"White / Northern European",rel:"Agnostic",lang:"German, English",inc:"Middle class",edu:"Master's degree",occ:"Arts / Media / Creative",job:"Journalist",pol:"Green / Eco-socialist",vals:["Environment","Justice","Equality","Freedom","Community"],media:["Social media heavy","Mainstream online news","Podcasts"],O:0.88,C:0.68,E:0.68,A:0.65,N:0.48,cf:0.38,ig:0.32,la:0.42,au:0.28,op:0.72,sq:0.22,mood:0.60,str:0.55,tru:0.48,eco:0.28,em:"👩",back:"Berlin Green party journalist. Cycles everywhere, no meat, deep climate anxiety. Horrified by AfD's rise — sees echoes of Weimar. Active in climate and anti-fascist movements. Worries about the soul of German democracy."}),
    mkP({n:"Ahmed Özturk",pop:4,age:42,g:"Male",c:"Germany",city:"Urban",eth:"Turkish",rel:"Islam (Sunni)",lang:"German, Turkish",inc:"Lower-middle class",edu:"High school / GED",occ:"Service (Retail/Food/Hospitality)",job:"Restaurant Owner",emp:"Self-employed",pol:"Center",vals:["Family","Hard work","Community","Loyalty","Security"],media:["Social media occasional","Mainstream TV news"],O:0.42,C:0.78,E:0.58,A:0.65,N:0.48,cf:0.58,ig:0.62,la:0.68,au:0.55,op:0.45,sq:0.58,mood:0.55,str:0.58,tru:0.40,eco:0.55,em:"🧑‍🍳",back:"Third-generation Turkish-German döner restaurant owner in Cologne. Identifies as both German and Turkish. Caught between AfD racism and expectations from Turkey. His kids are fully German. He navigates between worlds daily."}),
    mkP({n:"Friedrich Weber",pop:3,age:65,g:"Male",c:"Germany",city:"Urban",eth:"White / Northern European",rel:"Protestant",lang:"German",inc:"Upper-middle class",edu:"Doctorate / PhD",occ:"Education / Academia",job:"Retired Professor",emp:"Retired",pol:"Center-left",vals:["Education","Justice","Democracy","Community","Order"],media:["Print newspapers","Mainstream online news"],O:0.75,C:0.82,E:0.50,A:0.65,N:0.38,cf:0.45,ig:0.38,la:0.55,au:0.65,op:0.52,sq:0.55,mood:0.62,str:0.45,tru:0.60,eco:0.25,em:"👨‍🏫",back:"Munich retired political science professor who is a committed believer in postwar German democracy and European integration. Horrified by the AfD. Fully supports Ukraine. Worrying about whether German institutions are resilient enough."}),
  ],
  "United Kingdom": [
    mkP({n:"Dave Thompson",pop:8,age:52,g:"Male",c:"United Kingdom",city:"Small town",eth:"White / Anglo-Saxon",rel:"Secular / Cultural",lang:"English",inc:"Working class",edu:"High school / GED",occ:"Manual Labor / Construction",job:"Builder",pol:"Right",vals:["Tradition","Security","Nationalism","Family","Loyalty"],media:["Mainstream TV news","Social media occasional","Word-of-mouth community"],O:0.28,C:0.72,E:0.50,A:0.52,N:0.52,cf:0.68,ig:0.70,la:0.75,au:0.55,op:0.38,sq:0.72,mood:0.45,str:0.62,tru:0.28,eco:0.68,em:"👷",back:"Stoke-on-Trent builder who voted Leave and means it. Was Labour for 30 years before switching. Reads the Sun. Furious about immigration levels and the cost of living. 'Take Back Control' still resonates deeply."}),
    mkP({n:"Amara Johnson",pop:5,age:30,g:"Female",c:"United Kingdom",city:"Megacity / Metro",eth:"Black / Afro-Caribbean",rel:"Secular / Cultural",lang:"English",inc:"Middle class",edu:"Master's degree",occ:"Arts / Media / Creative",job:"Marketing Manager",pol:"Left",vals:["Equality","Justice","Creativity","Community","Freedom"],media:["Social media heavy","Mainstream online news","Podcasts"],O:0.82,C:0.70,E:0.72,A:0.60,N:0.50,cf:0.42,ig:0.52,la:0.45,au:0.25,op:0.68,sq:0.28,mood:0.58,str:0.60,tru:0.32,eco:0.42,em:"👩",back:"British-Caribbean woman in London. Passionate about Black British history and community organizing. Experienced hiring discrimination. Labour voter frustrated by slow institutional change. Active in decolonization discourse."}),
    mkP({n:"Fiona Macleod",pop:4,age:45,g:"Female",c:"United Kingdom",city:"Urban",eth:"White / Northern European",rel:"Secular / Cultural",lang:"English, Scottish Gaelic",inc:"Middle class",edu:"Bachelor's degree",occ:"Government / Public Service",job:"NHS Administrator",pol:"Center-left",vals:["Community","Civic duty","Justice","Security","Education"],media:["Mainstream online news","Radio"],O:0.60,C:0.78,E:0.55,A:0.68,N:0.42,cf:0.48,ig:0.50,la:0.60,au:0.52,op:0.58,sq:0.50,mood:0.58,str:0.58,tru:0.45,eco:0.45,em:"👩",back:"Edinburgh NHS administrator and SNP voter. Pro-independence, pro-EU. The NHS is her passion and daily crisis — underfunding is breaking it. Sees Brexit as an English project imposed on Scotland against its will."}),
    mkP({n:"Tariq Rahman",pop:3,age:38,g:"Male",c:"United Kingdom",city:"Urban",eth:"South Asian (Indian)",rel:"Islam (Sunni)",lang:"English, Urdu",inc:"Lower-middle class",edu:"Bachelor's degree",occ:"Service (Retail/Food/Hospitality)",job:"Corner Shop Owner",emp:"Self-employed",pol:"Center",vals:["Family","Hard work","Community","Faith / Religion","Security"],media:["Social media occasional","Mainstream online news"],O:0.45,C:0.78,E:0.58,A:0.65,N:0.45,cf:0.55,ig:0.60,la:0.65,au:0.55,op:0.50,sq:0.58,mood:0.55,str:0.58,tru:0.40,eco:0.55,em:"🧑",back:"Pakistani-British second-generation Bradford shop owner. Balances being British, Muslim, and Pakistani simultaneously. Worried about Islamophobia and knife crime. Labour voter who increasingly feels taken for granted."}),
  ],
  "France": [
    mkP({n:"Jean-Pierre Martin",pop:5,age:55,g:"Male",c:"France",city:"Rural",eth:"White / Southern European",rel:"Catholic",lang:"French",inc:"Working class",edu:"Vocational / Trade school",occ:"Agriculture / Farming",job:"Wheat Farmer",emp:"Self-employed",pol:"Nationalist / Populist",vals:["Tradition","Nationalism","Security","Family","Order"],media:["Mainstream TV news","Partisan TV news"],O:0.28,C:0.72,E:0.45,A:0.52,N:0.52,cf:0.72,ig:0.72,la:0.78,au:0.58,op:0.35,sq:0.75,mood:0.42,str:0.65,tru:0.22,eco:0.72,em:"👨‍🌾",back:"Gilets Jaunes participant from Creuse, RN voter. Rural France feels abandoned by Paris. His farm faces bankruptcy from EU regulations and cheap imports. Intensely patriotic, Eurosceptic, blames immigration for social breakdown."}),
    mkP({n:"Fatou Diallo",pop:3,age:25,g:"Female",c:"France",city:"Urban",eth:"West African",rel:"Islam (Sunni)",lang:"French, Wolof",inc:"Below poverty line",edu:"High school / GED",occ:"Service (Retail/Food/Hospitality)",job:"Retail Worker",pol:"Left",vals:["Equality","Justice","Community","Freedom","Education"],media:["Social media heavy","Alternative online news"],O:0.68,C:0.55,E:0.68,A:0.65,N:0.65,cf:0.50,ig:0.62,la:0.45,au:0.18,op:0.60,sq:0.25,mood:0.45,str:0.72,tru:0.18,eco:0.78,em:"🧕",back:"Second-generation Senegalese woman from a Paris banlieue wearing hijab and facing job discrimination. France Insoumise voter. Deeply frustrated by laïcité being weaponized specifically against Muslims."}),
    mkP({n:"Isabelle Dupont",pop:6,age:44,g:"Female",c:"France",city:"Urban",eth:"White / Northern European",rel:"Agnostic",lang:"French, English",inc:"Upper-middle class",edu:"Master's degree",occ:"Business / Finance",job:"Senior Manager",pol:"Center",vals:["Achievement","Security","Family","Order","Status"],media:["Print newspapers","Mainstream online news"],O:0.58,C:0.82,E:0.60,A:0.55,N:0.38,cf:0.52,ig:0.50,la:0.60,au:0.58,op:0.55,sq:0.58,mood:0.62,str:0.52,tru:0.48,eco:0.30,em:"👩‍💼",back:"Lyon corporate manager and Macron voter. Pragmatic centrist who values stability and the European project. Uncomfortable with both extremes but sees no other viable option. Worried about French competitiveness."}),
    mkP({n:"Antoine Bernard",pop:4,age:22,g:"Male",c:"France",city:"Megacity / Metro",eth:"White / Northern European",rel:"Atheist / Non-religious",lang:"French",inc:"Working poor",edu:"Some college",occ:"Unemployed",job:"Unemployed Graduate",emp:"Unemployed",pol:"Left",vals:["Justice","Freedom","Equality","Creativity","Environment"],media:["Social media heavy","Alternative online news"],O:0.78,C:0.48,E:0.65,A:0.58,N:0.65,cf:0.48,ig:0.38,la:0.38,au:0.18,op:0.60,sq:0.20,mood:0.40,str:0.72,tru:0.15,eco:0.75,em:"🧑",back:"Paris film grad who can't find work. Participated in pension reform protests. France Insoumise voter. Feels his generation was economically betrayed. Consumes anti-establishment media as a form of identity."}),
  ],
  "South Africa": [
    mkP({n:"Sipho Dlamini",pop:8,age:35,g:"Male",c:"South Africa",city:"Urban",eth:"Black / African",rel:"Evangelical / Pentecostal",lang:"Zulu, English",inc:"Working poor",edu:"High school / GED",occ:"Informal Economy",job:"Street Vendor",emp:"Self-employed",pol:"Left",vals:["Community","Justice","Family","Survival","Hard work"],media:["Social media heavy","Mainstream TV news"],O:0.50,C:0.58,E:0.62,A:0.65,N:0.65,cf:0.55,ig:0.65,la:0.65,au:0.28,op:0.48,sq:0.32,mood:0.38,str:0.78,tru:0.15,eco:0.88,em:"🧑",back:"Johannesburg Soweto street vendor. ANC voter by default but deeply disillusioned. Load shedding and unemployment dominate every day. Angry that land was not redistributed 30 years after democracy. Taps running dry."}),
    mkP({n:"Nomsa Khumalo",pop:6,age:45,g:"Female",c:"South Africa",city:"Urban",eth:"Black / African",rel:"Eastern Orthodox",lang:"Xhosa, English",inc:"Middle class",edu:"Bachelor's degree",occ:"Government / Public Service",job:"Government Administrator",pol:"Center-left",vals:["Community","Justice","Family","Security","Civic duty"],media:["Mainstream online news","Social media occasional"],O:0.58,C:0.78,E:0.55,A:0.68,N:0.48,cf:0.50,ig:0.60,la:0.62,au:0.55,op:0.52,sq:0.52,mood:0.52,str:0.60,tru:0.32,eco:0.55,em:"👩",back:"Cape Town civil servant — the Black middle class democracy built. Frustrated by government corruption but still believes in the ANC's historical mission. Navigates her community's poverty and her own relative security with guilt."}),
    mkP({n:"Pieter Van Der Berg",pop:3,age:55,g:"Male",c:"South Africa",city:"Rural",eth:"White / Eastern European",rel:"Protestant",lang:"Afrikaans, English",inc:"Upper-middle class",edu:"Bachelor's degree",occ:"Agriculture / Farming",job:"Commercial Farmer",emp:"Self-employed",pol:"Right",vals:["Tradition","Security","Family","Order","Nationalism"],media:["Mainstream TV news","Word-of-mouth community"],O:0.28,C:0.78,E:0.45,A:0.48,N:0.52,cf:0.72,ig:0.80,la:0.80,au:0.62,op:0.35,sq:0.78,mood:0.42,str:0.65,tru:0.22,eco:0.55,em:"👨‍🌾",back:"Afrikaner Free State wheat farmer. Fears land expropriation daily. Farm burgled three times. Votes DA. Sees himself as African but feels increasingly unwelcome. Children already emigrating to Australia."}),
    mkP({n:"Lerato Molefe",pop:5,age:23,g:"Female",c:"South Africa",city:"Megacity / Metro",eth:"Black / African",rel:"Spiritual",lang:"Sotho, English",inc:"Below poverty line",edu:"High school / GED",occ:"Unemployed",job:"Job Seeker",emp:"Unemployed",pol:"Left",vals:["Equality","Justice","Freedom","Creativity","Independence"],media:["Social media heavy","Alternative online news"],O:0.70,C:0.48,E:0.68,A:0.60,N:0.72,cf:0.50,ig:0.60,la:0.42,au:0.18,op:0.52,sq:0.20,mood:0.38,str:0.80,tru:0.12,eco:0.90,em:"👩",back:"Johannesburg young woman with matric, job-searching for 2 years at 50% youth unemployment. Follows EFF's Julius Malema. Growing rage at a system that promised freedom and delivered structural unemployment."}),
  ],
  "South Korea": [
    mkP({n:"Kim Jun-seo",pop:6,age:48,g:"Male",c:"South Korea",city:"Megacity / Metro",eth:"Korean",rel:"Protestant",lang:"Korean",inc:"Middle class",edu:"Bachelor's degree",occ:"Business / Finance",job:"Corporate Manager",pol:"Center-right",vals:["Achievement","Security","Family","Status","Hard work"],media:["Mainstream online news","Mainstream TV news"],O:0.42,C:0.85,E:0.50,A:0.52,N:0.48,cf:0.60,ig:0.70,la:0.68,au:0.65,op:0.45,sq:0.65,mood:0.52,str:0.65,tru:0.48,eco:0.52,em:"👨‍💼",back:"Seoul corporate manager working 60-hour weeks. Bought his apartment when prices were half what they are now. Conservative voter worried about North Korea and China. His church is his primary social network."}),
    mkP({n:"Park Jiyoung",pop:5,age:27,g:"Female",c:"South Korea",city:"Megacity / Metro",eth:"Korean",rel:"Agnostic",lang:"Korean, English",inc:"Lower-middle class",edu:"Bachelor's degree",occ:"Service (Retail/Food/Hospitality)",job:"Service Worker",emp:"Employed part-time",pol:"Left",vals:["Equality","Freedom","Justice","Independence"],media:["Social media heavy","Mainstream online news"],O:0.75,C:0.55,E:0.65,A:0.60,N:0.65,cf:0.42,ig:0.45,la:0.42,au:0.22,op:0.65,sq:0.25,mood:0.42,str:0.72,tru:0.28,eco:0.72,em:"👩",back:"Sampo generation — gave up on marriage, children, homeownership. Works gig jobs despite her degree. Feminist, extremely online, deeply alienated from Korea's corporate-military conservative culture."}),
    mkP({n:"Oh Sung-jin",pop:4,age:68,g:"Male",c:"South Korea",city:"Rural",eth:"Korean",rel:"Buddhism",lang:"Korean",inc:"Below poverty line",edu:"Middle school",occ:"Agriculture / Farming",job:"Vegetable Farmer",emp:"Self-employed",pol:"Center-right",vals:["Tradition","Security","Family","Hard work","Order"],media:["Mainstream TV news","Low media engagement"],O:0.28,C:0.72,E:0.38,A:0.65,N:0.40,cf:0.68,ig:0.75,la:0.72,au:0.70,op:0.35,sq:0.78,mood:0.48,str:0.52,tru:0.58,eco:0.68,em:"👴",back:"Elderly Jeolla province farmer. Economic miracle generation. Remembers real poverty, sees current problems as manageable. Conservative voter because they protected Korea from communism. Deeply proud of Korea's transformation."}),
  ],
  "Egypt": [
    mkP({n:"Ahmed Hassan",pop:25,age:45,g:"Male",c:"Egypt",city:"Rural",eth:"Arab / Middle Eastern",rel:"Islam (Sunni)",lang:"Arabic",inc:"Below poverty line",edu:"Primary school",occ:"Agriculture / Farming",job:"Subsistence Farmer",emp:"Self-employed",pol:"Apolitical",vals:["Family","Faith / Religion","Tradition","Hard work","Security"],media:["Mainstream TV news","Low media engagement"],O:0.25,C:0.65,E:0.40,A:0.68,N:0.50,cf:0.72,ig:0.75,la:0.80,au:0.65,op:0.30,sq:0.80,mood:0.40,str:0.70,tru:0.35,eco:0.85,em:"👨‍🌾",back:"Upper Egypt fellahin farmer. The Nile is his life; Ethiopia's dam threatens everything. Deep Islamic faith. Sees el-Sisi as a strong man maintaining order. Inflation has decimated whatever savings he had."}),
    mkP({n:"Layla Ibrahim",pop:12,age:30,g:"Female",c:"Egypt",city:"Megacity / Metro",eth:"Arab / Middle Eastern",rel:"Islam (Sunni)",lang:"Arabic, English",inc:"Middle class",edu:"Bachelor's degree",occ:"Education / Academia",job:"University Teacher",pol:"Center",vals:["Education","Family","Justice","Faith / Religion","Equality"],media:["Social media heavy","Mainstream online news"],O:0.65,C:0.75,E:0.60,A:0.68,N:0.52,cf:0.50,ig:0.55,la:0.58,au:0.45,op:0.58,sq:0.48,mood:0.52,str:0.62,tru:0.30,eco:0.58,em:"🧕",back:"Cairo university teacher who was at Tahrir Square and saw hopes crushed. Has adapted to surviving under el-Sisi. Carefully self-censors. Uses a VPN to follow independent journalism. Quietly defiant in small ways."}),
    mkP({n:"Youssef Mansour",pop:18,age:22,g:"Male",c:"Egypt",city:"Urban",eth:"Arab / Middle Eastern",rel:"Islam (Sunni)",lang:"Arabic",inc:"Working poor",edu:"High school / GED",occ:"Unemployed",job:"Unemployed Youth",emp:"Unemployed",pol:"Apolitical",vals:["Independence","Survival","Hard work","Justice"],media:["Social media heavy","Alternative online news"],O:0.52,C:0.48,E:0.62,A:0.52,N:0.72,cf:0.58,ig:0.60,la:0.45,au:0.18,op:0.45,sq:0.28,mood:0.35,str:0.80,tru:0.12,eco:0.90,em:"👦",back:"Cairo dropout unable to find work in a collapsing economy. 40% of Egyptians live below the poverty line. His generation has no memory of Tahrir's hope — only the repression that followed. Considers Libya or Europe constantly."}),
  ],
  "Colombia": [
    mkP({n:"Hernando Ríos",pop:3,age:55,g:"Male",c:"Colombia",city:"Rural",eth:"Hispanic / Latino",rel:"Catholic",lang:"Spanish",inc:"Working poor",edu:"Primary school",occ:"Agriculture / Farming",job:"Coca Farmer",emp:"Self-employed",pol:"Apolitical",vals:["Family","Survival","Tradition","Community","Security"],media:["Radio","Word-of-mouth community"],O:0.30,C:0.62,E:0.40,A:0.65,N:0.55,cf:0.68,ig:0.72,la:0.80,au:0.42,op:0.32,sq:0.72,mood:0.38,str:0.78,tru:0.15,eco:0.88,em:"👨‍🌾",back:"Cauca department coca farmer caught between FARC remnants, government eradication, and poverty. Grows coca because it's the only viable cash crop. Displaced twice by violence. Doesn't vote — it changes nothing."}),
    mkP({n:"Valentina Gómez",pop:2,age:30,g:"Female",c:"Colombia",city:"Megacity / Metro",eth:"Hispanic / Latino",rel:"Agnostic",lang:"Spanish, English",inc:"Middle class",edu:"Master's degree",occ:"Legal",job:"Human Rights Lawyer",pol:"Left",vals:["Justice","Equality","Freedom","Civic duty","Community"],media:["Social media heavy","Mainstream online news","Podcasts"],O:0.85,C:0.72,E:0.68,A:0.62,N:0.52,cf:0.38,ig:0.35,la:0.42,au:0.22,op:0.68,sq:0.22,mood:0.50,str:0.65,tru:0.25,eco:0.38,em:"👩‍⚖️",back:"Bogotá human rights lawyer who has received death threats for defending activists. Voted Petro. Passionate about ending paramilitary impunity. Struggles with the gap between what Colombia claims to be and what it is."}),
    mkP({n:"Alejandro Pérez",pop:3,age:40,g:"Male",c:"Colombia",city:"Urban",eth:"Hispanic / Latino",rel:"Catholic",lang:"Spanish",inc:"Upper-middle class",edu:"Bachelor's degree",occ:"Business / Finance",job:"Business Owner",emp:"Self-employed",pol:"Center-right",vals:["Wealth","Security","Order","Achievement","Family"],media:["Mainstream online news","Social media occasional"],O:0.42,C:0.80,E:0.58,A:0.50,N:0.40,cf:0.58,ig:0.60,la:0.68,au:0.60,op:0.52,sq:0.65,mood:0.55,str:0.55,tru:0.32,eco:0.45,em:"👨‍💼",back:"Medellín business owner who fears Petro will destroy the economy. His city transformed from cartel capital to innovation hub — and he believes business did that, not left politics. Children in bilingual private schools."}),
  ],
  "Ukraine": [
    mkP({n:"Oleksiy Kovalenko",pop:4,age:38,g:"Male",c:"Ukraine",city:"Urban",eth:"White / Eastern European",rel:"Eastern Orthodox",lang:"Ukrainian",inc:"Middle class",edu:"Bachelor's degree",occ:"Technology / Engineering",job:"IT Professional",pol:"Center-right",vals:["Freedom","Nationalism","Justice","Security","Democracy"],media:["Social media heavy","Mainstream online news","International media"],O:0.70,C:0.78,E:0.58,A:0.58,N:0.55,cf:0.48,ig:0.62,la:0.58,au:0.38,op:0.55,sq:0.38,mood:0.45,str:0.75,tru:0.48,eco:0.58,em:"👨‍💻",back:"Kyiv IT professional whose office moved to Lviv after the 2022 invasion. Works remotely for a European company. Deeply proud Ukrainian nationalist. Sees Russia's war as existential. Mobilization anxiety is constant."}),
    mkP({n:"Natalia Petrenko",pop:5,age:55,g:"Female",c:"Ukraine",city:"Small town",eth:"White / Eastern European",rel:"Eastern Orthodox",lang:"Ukrainian, Russian",inc:"Working class",edu:"Vocational / Trade school",occ:"Healthcare",job:"Nurse",pol:"Center",vals:["Family","Security","Community","Faith / Religion","Tradition"],media:["Mainstream TV news","Social media occasional"],O:0.40,C:0.80,E:0.48,A:0.72,N:0.50,cf:0.55,ig:0.58,la:0.68,au:0.58,op:0.42,sq:0.60,mood:0.38,str:0.78,tru:0.45,eco:0.70,em:"👩‍⚕️",back:"Ukrainian nurse in a small city who has worked through bombings, blackouts, and staff shortages. Her son is at the front. Daily question: will there be power and water. Deeply faithful. Endures because endurance is survival."}),
    mkP({n:"Ivan Kravchuk",pop:3,age:60,g:"Male",c:"Ukraine",city:"Rural",eth:"White / Eastern European",rel:"Eastern Orthodox",lang:"Ukrainian, Russian",inc:"Working poor",edu:"Middle school",occ:"Agriculture / Farming",job:"Sunflower Farmer",emp:"Self-employed",pol:"Apolitical",vals:["Family","Tradition","Security","Survival","Faith / Religion"],media:["Mainstream TV news","Low media engagement"],O:0.28,C:0.68,E:0.38,A:0.65,N:0.50,cf:0.65,ig:0.68,la:0.78,au:0.60,op:0.35,sq:0.75,mood:0.35,str:0.80,tru:0.35,eco:0.82,em:"👨‍🌾",back:"Zaporizhzhia elderly farmer in a partially occupied region. Has lived through Soviet collapse, independence, Maidan, and now this war. His land is mined. Exhausted beyond politics. Just wants the guns to stop."}),
  ],
  "Kenya": [
    mkP({n:"James Mwangi",pop:8,age:40,g:"Male",c:"Kenya",city:"Rural",eth:"Black / African",rel:"Protestant",lang:"Swahili, Kikuyu",inc:"Below poverty line",edu:"Primary school",occ:"Agriculture / Farming",job:"Subsistence Farmer",emp:"Self-employed",pol:"Center",vals:["Family","Faith / Religion","Community","Hard work","Tradition"],media:["Radio","Word-of-mouth community"],O:0.32,C:0.65,E:0.45,A:0.68,N:0.52,cf:0.65,ig:0.72,la:0.78,au:0.58,op:0.38,sq:0.75,mood:0.42,str:0.68,tru:0.28,eco:0.82,em:"👨‍🌾",back:"Kikuyu farmer in Central Kenya. Grows maize and vegetables. Climate shocks have made harvests dangerously unpredictable. Tribal loyalty heavily shapes who he votes for. Church community is his most important institution."}),
    mkP({n:"Aisha Omar",pop:4,age:28,g:"Female",c:"Kenya",city:"Urban",eth:"Somali / East African",rel:"Islam (Sunni)",lang:"Swahili, Somali, English",inc:"Lower-middle class",edu:"Bachelor's degree",occ:"Business / Finance",job:"Mobile Money Agent",emp:"Self-employed",pol:"Center-left",vals:["Community","Faith / Religion","Education","Family","Innovation"],media:["Social media heavy","Mainstream online news"],O:0.65,C:0.72,E:0.62,A:0.68,N:0.48,cf:0.50,ig:0.62,la:0.60,au:0.48,op:0.60,sq:0.45,mood:0.58,str:0.55,tru:0.38,eco:0.52,em:"🧕",back:"Somali Kenyan woman running an M-Pesa booth in Nairobi's Eastleigh. Bridge between formal and informal economy. Experienced anti-Somali discrimination post-Westgate attacks. Proud Kenyan and proud Muslim simultaneously."}),
    mkP({n:"Brian Odhiambo",pop:6,age:22,g:"Male",c:"Kenya",city:"Urban",eth:"Black / African",rel:"Protestant",lang:"Swahili, Luo, English",inc:"Working poor",edu:"Some college",occ:"Informal Economy",job:"Motorcycle Taxi Rider",emp:"Self-employed",pol:"Left",vals:["Justice","Freedom","Equality","Independence"],media:["Social media heavy","Alternative online news"],O:0.62,C:0.50,E:0.68,A:0.58,N:0.65,cf:0.50,ig:0.60,la:0.45,au:0.18,op:0.52,sq:0.25,mood:0.45,str:0.70,tru:0.15,eco:0.82,em:"🧑",back:"Nairobi boda-boda rider who dropped out of university when fees ran out. Participated in 2024 Gen-Z anti-corruption protests. Angry about nepotism and political wealth while his generation hustles in structural poverty."}),
  ],
};

const LIBRARY_PERSONAS = Object.values(RAW_LIBRARY).flat();

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT WORLD
// ─────────────────────────────────────────────────────────────────────────────
// No default personas — users start with a clean slate
const DEFAULTS = [];
const EARTH_IMG = "data:image/jpeg;base64,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";



// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────
function uid() { return `p_${Date.now()}_${Math.random().toString(36).slice(2,7)}`; }
function clamp(v, lo=0, hi=1) { return Math.max(lo, Math.min(hi, v)); }
function nextColor(ps) {
  const used = new Set(ps.map(p => p.color));
  return PERSONA_COLORS.find(c => !used.has(c)) || PERSONA_COLORS[ps.length % PERSONA_COLORS.length];
}

// ─── PERSONA SANITISER ────────────────────────────────────────────────────────
// Cleans every persona before it enters the app — guards against blank fields,
// wrong types, and out-of-range values from AI or manual entry.
function sanitisePersona(raw, colorHint) {
  const clampF = function(v) { return typeof v === 'number' && isFinite(v) ? Math.max(0, Math.min(1, v)) : 0.5; };
  const strOr = function(v, fb) { return (typeof v === 'string' && v.trim()) ? v.trim() : (fb || ''); };
  const arrOf = function(v) { return Array.isArray(v) ? v.filter(function(x){ return typeof x === 'string'; }) : []; };

  const name = strOr(raw.name, '');
  if (!name) return null; // reject blanks — caller must filter nulls

  return {
    id:               raw.id || uid(),
    name,
    age:              (typeof raw.age === 'number' && raw.age > 0 && raw.age < 120) ? Math.round(raw.age) : 30,
    gender:           strOr(raw.gender, 'Other'),
    country:          strOr(raw.country, 'Unknown'),
    cityType:         strOr(raw.cityType, 'Urban'),
    ethnicity:        strOr(raw.ethnicity, ''),
    religion:         strOr(raw.religion, ''),
    language:         strOr(raw.language, 'English'),
    income:           strOr(raw.income, 'Middle class'),
    education:        strOr(raw.education, 'High school / GED'),
    occupationCategory: strOr(raw.occupationCategory, 'Service (Retail/Food/Hospitality)'),
    occupation:       strOr(raw.occupation, ''),
    employmentStatus: strOr(raw.employmentStatus, 'Employed full-time'),
    political:        strOr(raw.political, 'Center'),
    values:           arrOf(raw.values),
    mediaHabits:      arrOf(raw.mediaHabits),
    personality: {
      O: clampF(raw.personality && raw.personality.O),
      C: clampF(raw.personality && raw.personality.C),
      E: clampF(raw.personality && raw.personality.E),
      A: clampF(raw.personality && raw.personality.A),
      N: clampF(raw.personality && raw.personality.N),
    },
    biases: {
      confirmation: clampF(raw.biases && raw.biases.confirmation),
      ingroup:      clampF(raw.biases && raw.biases.ingroup),
      lossAversion: clampF(raw.biases && raw.biases.lossAversion),
      authority:    clampF(raw.biases && raw.biases.authority),
      optimism:     clampF(raw.biases && raw.biases.optimism),
      statusQuo:    clampF(raw.biases && raw.biases.statusQuo),
    },
    mood:             clampF(raw.mood !== undefined ? raw.mood : 0.60),
    stress:           clampF(raw.stress !== undefined ? raw.stress : 0.40),
    trust:            clampF(raw.trust !== undefined ? raw.trust : 0.50),
    economicAnxiety:  clampF(raw.economicAnxiety !== undefined ? raw.economicAnxiety : 0.40),
    group:            strOr(raw.group, ''),
    relations:        Array.isArray(raw.relations) ? raw.relations : [],
    backstory:        strOr(raw.backstory, ''),
    emoji:            strOr(raw.emoji, '👤'),
    pop:              (typeof raw.pop === 'number' && raw.pop > 0) ? raw.pop : 1,
    color:            strOr(raw.color, colorHint || '#38bdf8'),
  };
}

function newDraft(ps=[]) {
  return { id:null, name:"", age:30, gender:"Male", country:"United States", cityType:"Urban", ethnicity:"", religion:"", language:"", income:"Middle class", education:"Bachelor's degree", occupationCategory:"Service (Retail/Food/Hospitality)", occupation:"", employmentStatus:"Employed full-time", political:"Center", values:[], mediaHabits:[], personality:{O:0.5,C:0.5,E:0.5,A:0.5,N:0.5}, biases:{confirmation:0.5,ingroup:0.5,lossAversion:0.5,authority:0.5,optimism:0.5,statusQuo:0.5}, mood:0.60, stress:0.40, trust:0.50, economicAnxiety:0.40, group:"", relations:[], backstory:"", color:nextColor(ps), emoji:"👤" };
}

function buildPrompt(p) {
  // Compressed prompt: ~200 tokens vs ~480 previously. Same psychological fidelity.
  const O=p.personality.O,C=p.personality.C,E=p.personality.E,A=p.personality.A,N=p.personality.N;
  const cf=p.biases.confirmation,ig=p.biases.ingroup,la=p.biases.lossAversion,au=p.biases.authority;
  const mood=Math.round(p.mood*100),stress=Math.round(p.stress*100),trust=Math.round(p.trust*100),econ=Math.round(p.economicAnxiety*100);
  return "PERSONA:" + p.name + "|" + p.age + "y " + p.gender + "|" + p.country + " " + p.cityType
    + "\nIDENTITY:" + (p.ethnicity||"") + "|" + (p.religion||"none") + "|" + p.language
    + "\nECON:" + p.income + "|" + (p.occupation||p.occupationCategory) + "|" + p.political
    + "\nVALUES:" + (p.values||[]).slice(0,4).join(",")
    + "\nMEDIA:" + (p.mediaHabits||[]).slice(0,2).join(",")
    + "\nOCEAN:" + O.toFixed(2) + "," + C.toFixed(2) + "," + E.toFixed(2) + "," + A.toFixed(2) + "," + N.toFixed(2)
    + "\nBIAS:cf=" + cf.toFixed(2) + " ig=" + ig.toFixed(2) + " la=" + la.toFixed(2) + " au=" + au.toFixed(2)
    + "\nSTATE:mood=" + mood + "% stress=" + stress + "% trust=" + trust + "% econ=" + econ + "%"
    + (p.backstory ? "\nBACKSTORY:" + p.backstory.slice(0,120) : "")
    + "\nBEHAVIOR: stress→gut; ingroup→us-vs-them; econ→threats; N→emotional. Be irrational."
    + "\nYOU ARE: " + p.name + ". React now.";
}

// Maps compact keys (e,m,s,t,ec) to full names for backward compat
function normaliseDeltas(d) {
  if (!d) return null;
  return {
    emotion:      d.emotion      || d.e  || "",
    mood_delta:   d.mood_delta   !== undefined ? d.mood_delta   : (d.m  !== undefined ? d.m  : 0),
    stress_delta: d.stress_delta !== undefined ? d.stress_delta : (d.s  !== undefined ? d.s  : 0),
    trust_delta:  d.trust_delta  !== undefined ? d.trust_delta  : (d.t  !== undefined ? d.t  : 0),
    econ_delta:   d.econ_delta   !== undefined ? d.econ_delta   : (d.ec !== undefined ? d.ec : 0),
  };
}

// Maps compact section labels (R/I/A/E) to full display names
const SECTION_MAP = { R:"IMMEDIATE REACTION", I:"MY INTERPRETATION", A:"WHAT I WILL DO", E:"EFFECT ON MY STATE" };

function parseResponse(raw) {
  const text = raw.trim();
  const lastNewline = text.lastIndexOf("\n");
  const lastLine = lastNewline >= 0 ? text.substring(lastNewline + 1).trim() : "";
  let deltas = null;
  let narrative = text;
  if (lastLine.startsWith("{")) {
    try {
      const parsed = JSON.parse(lastLine);
      deltas = normaliseDeltas(parsed);
      narrative = text.substring(0, lastNewline).trim();
      // Expand compact section labels in narrative
      narrative = narrative
        .replace(/^R:/mg, "IMMEDIATE REACTION:")
        .replace(/^I:/mg, "MY INTERPRETATION:")
        .replace(/^A:/mg, "WHAT I WILL DO:")
        .replace(/^E:/mg, "EFFECT ON MY STATE:");
    } catch {}
  }
  if (!deltas) {
    const m = text.match(/\{[^}]*(emotion|"e":)[^}]*\}/);
    if (m) try { deltas = normaliseDeltas(JSON.parse(m[0])); } catch {}
  }
  return { narrative, deltas };
}

// ─── RATE-LIMIT-SAFE API LAYER ───────────────────────────────────────────────
// Enforces a mandatory gap between requests and exponentially backs off on limits.
// This fires regardless of user-chosen batch size — the queue handles pacing.
function sleep(ms) { return new Promise(function(r){ setTimeout(r, ms); }); }

const ApiQueue = {
  // Rate limits on this artifact: ~50 RPM Haiku, ~20 RPM Sonnet
  // Haiku: stagger starts by 600ms so 5 agents = 2.5s stagger window, no burst
  // Sonnet: 4s gap prevents hitting RPM limit on batch generation
  lastHaikuTime: 0,
  lastSonnetTime: 0,
  haikuGapMs: 600,     // 600ms stagger between Haiku STARTS — prevents RPM burst
  sonnetGapMs: 4000,   // 4s between Sonnet calls
  backoffMs: 0,
  consecutiveHits: 0,

  async wait(isHaiku) {
    const now = Date.now();
    if (isHaiku) {
      const gap = now - this.lastHaikuTime;
      const delay = Math.max(0, this.haikuGapMs - gap) + this.backoffMs;
      if (delay > 0) await sleep(delay);
      this.lastHaikuTime = Date.now();
    } else {
      const gap = now - this.lastSonnetTime;
      const delay = Math.max(0, this.sonnetGapMs - gap) + this.backoffMs;
      if (delay > 0) await sleep(delay);
      this.lastSonnetTime = Date.now();
    }
  },

  onRateLimit() {
    this.consecutiveHits++;
    // First hit: add 8s. Second: 16s. Third: 32s. Max 90s.
    const base = isHaiku => isHaiku ? 6000 : 12000;
    this.backoffMs = Math.min(8000 * this.consecutiveHits, 90000);
    // Also double the gap temporarily to self-throttle
    this.haikuGapMs = Math.min(this.haikuGapMs * 2, 3000);
    this.sonnetGapMs = Math.min(this.sonnetGapMs * 1.5, 12000);
  },

  onSuccess() {
    this.consecutiveHits = 0;
    // Gradually relax gaps back to normal after sustained success
    if (this.backoffMs > 0) this.backoffMs = Math.max(0, this.backoffMs - 2000);
    if (this.haikuGapMs > 600) this.haikuGapMs = Math.max(600, this.haikuGapMs - 200);
    if (this.sonnetGapMs > 4000) this.sonnetGapMs = Math.max(4000, this.sonnetGapMs - 500);
  }
};

async function callClaude(messages, system, maxTokens) {
  const model = maxTokens && maxTokens <= 600 ? "claude-haiku-4-5-20251001" : "claude-sonnet-4-20250514";
  const body = { model:model, max_tokens:maxTokens||600, messages:messages };
  if (system) body.system = system;

  // Up to 5 retries with the queue enforcing safe pacing
  for (let attempt = 0; attempt < 3; attempt++) {
    await ApiQueue.wait(model === "claude-haiku-4-5-20251001");
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)
    });
    const data = await res.json();
    if (!data || typeof data !== "object") throw new Error("No response from API.");

    const str = JSON.stringify(data);
    const isRateLimit = data.type === "exceeded_limit"
      || str.includes("exceeded_limit")
      || (data.error && (data.error.type === "rate_limit_error" || data.error.type === "tokens_exceeded"));

    if (isRateLimit) {
      ApiQueue.onRateLimit();
      // Silently retry — the stagger gap in ApiQueue.wait() handles the delay
      // User sees the agent as still "processing" — which is true
      continue;
    }

    if (data.error) {
      if (data.error.type === "overloaded_error") {
        ApiQueue.backoffMs = Math.max(ApiQueue.backoffMs, 8000);
        continue;
      }
      throw new Error(data.error.message || "API error.");
    }

    if (!data.content || !Array.isArray(data.content)) throw new Error("Unexpected API response.");
    ApiQueue.onSuccess();
    return data.content.map(function(b){ return b.text || ""; }).join("");
  }
  throw new Error("API unavailable after 3 attempts. Please wait 30 seconds and try again.");
}

async function aiGeneratePersona(description, existingPersonas) {
  // Use system prompt with schema for caching — only description changes per call
  const userMsg = "Create persona: " + description
    + "\nReturn ONLY JSON object with fields: name,age,gender,country,cityType,ethnicity,religion,language,income,education,occupationCategory,occupation,employmentStatus,political,values(array),mediaHabits(array),personality({O,C,E,A,N}),biases({confirmation,ingroup,lossAversion,authority,optimism,statusQuo}),mood,stress,trust,economicAnxiety,group,backstory,emoji,pop(millions)";
  const raw = await callClaude([{role:"user", content:userMsg}], PERSONA_SCHEMA_SYSTEM, 550);
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AI did not return valid JSON");
  const parsed = JSON.parse(match[0]);
  const clean = sanitisePersona(Object.assign({}, parsed, { color: nextColor(existingPersonas), relations:[] }));
  if (!clean) throw new Error("AI returned a persona with no name. Please try again.");
  return clean;
}

// ─── POPULATION MATH MODEL ────────────────────────────────────────────────────
// For any N people, generate K archetypes each with pop=N/K.
// K = min(max(5, floor(sqrt(N))), 50) — enough diversity, never > 50 API calls.
// A 5,000-person village = 20 archetypes (pop=250 each).
// A 1M-person city = 50 archetypes (pop=20,000 each).
// Simulation treats each archetype as a weighted representative agent.
function archetypeCount(N) {
  if (!N || N <= 8)    return Math.max(1, N || 4);
  if (N <= 50)   return 8;
  if (N <= 500)  return 12;
  if (N <= 5000) return 20;
  if (N <= 50000) return 30;
  if (N <= 500000) return 40;
  return 50;
}

async function aiGenerateGroup(groupType, country, description, existingPersonas, totalPopulation) {
  const totalPop = totalPopulation || 1;
  // Always generate exactly 6 personas using proven individual Haiku calls.
  // The `pop` field carries the population weight for the archetype model.
  // No large-group path — it caused silent partial failures and rate-limit hangs.
  const groupName = (description ? description.slice(0,40) + " — " : "") + country + " " + groupType.charAt(0).toUpperCase() + groupType.slice(1);
  const count = 6;

  const ROLES = {
    "family": [
      "father or grandfather (45-70), head of household",
      "mother or grandmother (42-68), homemaker or working",
      "young adult son or daughter (18-30)",
      "teenager (13-17)",
      "uncle/aunt or relative (35-55)",
      "young child described by parent"
    ],
    "friend group": [
      "social connector, outgoing, different background to others",
      "intellectual, politically opposite to group average",
      "working class friend, practical, grounded",
      "religious or conservative member",
      "artist or creative, unconventional",
      "recent addition to friend group, different ethnicity"
    ],
    "workplace team": [
      "team manager (38-52), experienced, pragmatic",
      "senior specialist (30-45), expert in their field",
      "mid-level generalist (28-38), ambitious",
      "junior staff (22-28), new to career",
      "contractor or freelancer, outsider perspective",
      "older long-serving employee (50-60), institutional memory"
    ],
    "neighborhood": [
      "long-term resident (60+), knows everyone",
      "young family with children",
      "single professional (25-35)",
      "recent immigrant or newcomer",
      "small business owner",
      "elderly person living alone"
    ],
    "village": [
      "village elder or community leader (55-75)",
      "farmer or primary occupation worker (35-55)",
      "young adult considering leaving for city (20-28)",
      "woman with family responsibilities (30-45)",
      "religious or traditional authority figure",
      "child or teenager (12-17)"
    ],
    "city": [
      "urban professional (28-40)",
      "working class city resident (30-50)",
      "recent rural migrant (22-32)",
      "middle class family parent (38-52)",
      "street vendor or informal economy worker",
      "student or young adult (18-25)"
    ],
    "town": [
      "local business owner or shopkeeper (40-60)",
      "factory or manual worker (30-50)",
      "young person weighing staying vs leaving (18-28)",
      "teacher or civil servant (35-55)",
      "elderly long-term resident (60+)",
      "single parent or struggling family (30-45)"
    ],
    "state/region": [
      "urban middle-class professional (30-45)",
      "rural agricultural worker (35-55)",
      "urban working-class resident (25-40)",
      "educated youth in a major city (20-30)",
      "small town business owner (40-58)",
      "elderly rural resident (60+)"
    ]
  };

  const roles = ROLES[groupType] || ROLES["neighborhood"];
  const baseDesc = (description ? description + ". " : "")
    + "From " + country + ". Part of a " + groupType + ".";

  const members = [];
  const errors = [];
  for (let i = 0; i < count; i++) {
    const roleHint = roles[i] || ("community member " + (i + 1));
    const desc = baseDesc + " This person is: " + roleHint + ".";
    try {
      const p = await aiGeneratePersona(desc, existingPersonas);
      if (p) members.push(p);
    } catch(e) {
      errors.push(roleHint.split(" ")[0]);
      console.warn("Group member " + (i+1) + " failed:", e.message);
    }
  }

  if (!members.length) {
    throw new Error("All 6 members failed to generate. This is usually a rate limit — wait 30 seconds and try again.");
  }
  if (errors.length > 0) {
    // Partial success — note which roles failed (caller shows warning)
    console.info("Generated " + members.length + "/6, failed: " + errors.join(", "));
  }

  const ids = members.map(function() { return uid(); });
  return members.map(function(p, i) {
    return Object.assign({}, p, {
      id: ids[i],
      color: PERSONA_COLORS[(existingPersonas.length + i) % PERSONA_COLORS.length],
      group: groupName,
      pop: Math.max(1, Math.round(totalPop / members.length)),
      relations: ids.filter(function(_, j) { return j !== i; }).slice(0, 2).map(function(id) {
        const relType = groupType === "family" ? "family"
          : groupType === "friend group" ? "close friend"
          : groupType === "workplace team" ? "colleague" : "neighbor";
        return { to: id, type: relType };
      }),
    });
  });
}





// ─── COUNTRY CENSUS DATA ─────────────────────────────────────────────────────
// Key demographic facts per country used to ground AI generation
const COUNTRY_CENSUS = {
  "Afghanistan":{pop:43,gini:28,urban:26,medAge:18,gdpPPP:2000,religions:"Islam Sunni 85%, Islam Shia 15%",ethnicities:"Pashtun 42%, Tajik 27%, Hazara 9%, Uzbek 9%",keyIssues:"Taliban rule, extreme poverty, drought, US sanctions, women's rights rollback, opium economy"},
  "Algeria":{pop:46,gini:27,urban:74,medAge:29,gdpPPP:11000,religions:"Islam Sunni 99%",ethnicities:"Arab-Berber 99%",keyIssues:"youth unemployment, hydrocarbon dependence, authoritarian politics, Amazigh identity, housing shortage"},
  "Angola":{pop:36,gini:51,urban:68,medAge:16,gdpPPP:7000,religions:"Catholic 41%, Protestant 38%, Animism 12%",ethnicities:"Ovimbundu 37%, Kimbundu 25%, Bakongo 13%",keyIssues:"post-war inequality, oil wealth concentration, rural poverty, infrastructure collapse, corruption"},
  "Argentina":{pop:46,gini:42,urban:93,medAge:32,gdpPPP:22000,religions:"Catholic 62%, Agnostic 19%, Evangelical 7%",ethnicities:"White European 65%, Mestizo 25%, Indigenous 3%",keyIssues:"hyperinflation, Milei austerity, Peronism vs liberalism, youth unemployment, cartoneros, gender movement"},
  "Australia":{pop:26,gini:34,urban:87,medAge:38,gdpPPP:55000,religions:"Secular/None 39%, Catholic 20%, Anglican 9%",ethnicities:"Anglo-Celtic 67%, European 18%, Asian 15%",keyIssues:"housing unaffordability, indigenous reconciliation, climate change, immigration debate, cost of living"},
  "Bangladesh":{pop:172,gini:32,urban:40,medAge:27,gdpPPP:7000,religions:"Islam Sunni 90%, Hindu 9%",ethnicities:"Bengali 98%",keyIssues:"garment industry exploitation, climate vulnerability, flooding, political instability, women's rights"},
  "Bolivia":{pop:12,gini:42,urban:71,medAge:26,gdpPPP:8500,religions:"Catholic 70%, Evangelical 17%, Indigenous beliefs 3%",ethnicities:"Indigenous 41%, Mestizo 31%, White 15%",keyIssues:"resource nationalism, lithium economy, MAS politics, coca legalization, urban-rural divide"},
  "Brazil":{pop:215,gini:52,urban:87,medAge:34,gdpPPP:15000,religions:"Catholic 50%, Evangelical 31%, Spiritual 3%",ethnicities:"White 43%, Mixed 46%, Black 10%",keyIssues:"record inequality, Amazon destruction, Lula vs Bolsonarismo, favela violence, racial injustice, corruption"},
  "Cameroon":{pop:28,gini:46,urban:58,medAge:18,gdpPPP:3900,religions:"Christian 70%, Muslim 20%, Animist 6%",ethnicities:"Cameroon Highlanders 31%, Equatorial Bantu 19%, Fulani 10%",keyIssues:"Anglophone separatism, Boko Haram, Biya's 40yr rule, oil dependence, youth unemployment"},
  "Canada":{pop:38,gini:33,urban:82,medAge:41,gdpPPP:52000,religions:"Catholic 29%, Protestant 18%, Secular 34%",ethnicities:"European 73%, Asian 18%, Indigenous 5%",keyIssues:"housing crisis, indigenous reconciliation, healthcare wait times, immigration levels, Quebec sovereignty"},
  "Chile":{pop:19,gini:44,urban:88,medAge:36,gdpPPP:25000,religions:"Catholic 45%, Evangelical 18%, Agnostic 25%",ethnicities:"White/Mestizo 88%, Mapuche 9%",keyIssues:"copper wealth inequality, 2019 uprising legacy, constitutional failures, Mapuche rights, pension crisis"},
  "China":{pop:1411,gini:38,urban:65,medAge:39,gdpPPP:18000,religions:"Folk/Buddhist 22%, Unaffiliated 52%, Christian 5%",ethnicities:"Han 92%, Zhuang 1.3%, others 6.7%",keyIssues:"Xi's consolidation, zero-COVID legacy, property crisis, youth unemployment, Taiwan, Uyghur repression, US tech war"},
  "Colombia":{pop:51,gini:55,urban:81,medAge:31,gdpPPP:14000,religions:"Catholic 79%, Evangelical 13%",ethnicities:"Mestizo 49%, White 37%, Afro-Colombian 11%",keyIssues:"Petro government, FARC remnants, coca economy, femicide, urban inequality, Afro-Colombian exclusion"},
  "Congo DRC":{pop:100,gini:43,urban:46,medAge:17,gdpPPP:1100,religions:"Catholic 30%, Protestant 25%, Evangelical 20%",ethnicities:"Kongo 16%, Luba 14%, Mongo 13%",keyIssues:"eastern conflict, mineral exploitation, extreme poverty, rape as weapon of war, Kinshasa megacity chaos"},
  "Cuba":{pop:11,gini:38,urban:77,medAge:42,gdpPPP:10000,religions:"Catholic 59%, Secular 23%, Afro-Cuban 17%",ethnicities:"White 64%, Mulato 27%, Black 9%",keyIssues:"economic collapse, US embargo, mass emigration, 2021 protests, rationing, state control, ideological exhaustion"},
  "Czech Republic":{pop:10,gini:26,urban:74,medAge:43,gdpPPP:40000,religions:"Secular 66%, Catholic 10%, Protestant 3%",ethnicities:"Czech 64%, Moravian 5%, Slovak 2%",keyIssues:"cost of living, corruption, pro-Ukraine but anti-NATO fringe, Roma discrimination, brain drain to West"},
  "Ecuador":{pop:18,gini:47,urban:64,medAge:28,gdpPPP:11000,religions:"Catholic 80%, Evangelical 11%",ethnicities:"Mestizo 72%, Indigenous 7%, Afroecuadorian 7%",keyIssues:"cartel violence, narco-state fears, dollarized economy, oil vs environment, indigenous rights, femicide"},
  "Egypt":{pop:105,gini:31,urban:43,medAge:24,gdpPPP:13000,religions:"Islam Sunni 90%, Christian Coptic 9%",ethnicities:"Egyptian Arab 99%",keyIssues:"el-Sisi authoritarianism, economic collapse, 40% poverty, Ethiopia dam, Sinai insurgency, Coptic persecution"},
  "Ethiopia":{pop:126,gini:35,urban:21,medAge:19,gdpPPP:2400,religions:"Orthodox Christian 44%, Islam 34%, Protestant 19%",ethnicities:"Oromo 35%, Amhara 27%, Somali 6%, Tigrinya 6%",keyIssues:"Tigray war aftermath, ethnic federalism tensions, famine, Abiy Ahmed's consolidation, Nile dam dispute"},
  "France":{pop:68,gini:32,urban:81,medAge:42,gdpPPP:47000,religions:"Secular 40%, Catholic 29%, Islam 9%",ethnicities:"French 89%, North African 7%, Sub-Saharan 3%",keyIssues:"RN far-right surge, banlieue inequality, laïcité debates, pension reform protests, immigration, EU leadership"},
  "Germany":{pop:84,gini:31,urban:77,medAge:46,gdpPPP:52000,religions:"Secular 40%, Catholic 24%, Protestant 22%",ethnicities:"German 87%, Turkish 4%, other EU 4%",keyIssues:"AfD rise, deindustrialization, energy transition, Ukraine support, immigration backlash, East-West divide"},
  "Ghana":{pop:33,gini:43,urban:58,medAge:21,gdpPPP:6000,religions:"Christian 71%, Muslim 20%, Traditional 3%",ethnicities:"Akan 47%, Mole-Dagbon 17%, Ewe 14%",keyIssues:"debt crisis/IMF bailout, cocoa dependency, youth unemployment, democratic stability, galamsey mining damage"},
  "Greece":{pop:10,gini:33,urban:80,medAge:45,gdpPPP:30000,religions:"Orthodox Christian 90%",ethnicities:"Greek 91%",keyIssues:"austerity legacy, brain drain, refugee crisis, youth unemployment, Turkey tensions, demographic collapse"},
  "Guatemala":{pop:18,gini:48,urban:53,medAge:22,gdpPPP:8500,religions:"Catholic 50%, Evangelical 40%",ethnicities:"Mestizo 56%, Maya 42%",keyIssues:"gang violence/MS-13, mass migration to US, corruption, Maya rights, femicide, agrarian inequality"},
  "Haiti":{pop:11,gini:41,urban:59,medAge:23,gdpPPP:2900,religions:"Catholic 55%, Protestant 28%, Vodou 50% (dual practice)",ethnicities:"Black 95%, Mulatto 5%",keyIssues:"gang state collapse, no functioning government, kidnappings, cholera, US deportations, earthquake reconstruction failure"},
  "Hungary":{pop:10,gini:30,urban:72,medAge:43,gdpPPP:33000,religions:"Catholic 37%, Calvinist 11%, Lutheran 3%, Secular 40%",ethnicities:"Hungarian 85%, Roma 3%",keyIssues:"Orbán's illiberal democracy, anti-LGBTQ laws, media capture, EU tensions, Roma discrimination, emigration of young"},
  "India":{pop:1441,gini:36,urban:35,medAge:28,gdpPPP:8400,religions:"Hindu 80%, Muslim 14%, Christian 2%",ethnicities:"Indo-Aryan 72%, Dravidian 25%",keyIssues:"Modi nationalism, Muslim persecution, caste discrimination, Dalit rights, farmer protests, youth unemployment, climate vulnerability"},
  "Indonesia":{pop:278,gini:38,urban:58,medAge:30,gdpPPP:12000,religions:"Islam Sunni 87%, Protestant 7%, Catholic 3%",ethnicities:"Javanese 40%, Sundanese 15%, Batak 3%, Chinese 1%",keyIssues:"rising Islamism, Jokowi legacy, Papua separatism, deforestation, Batam wage disputes, women's rights erosion"},
  "Iran":{pop:87,gini:42,urban:76,medAge:33,gdpPPP:13000,religions:"Islam Shia 90%, Islam Sunni 9%",ethnicities:"Persian 61%, Azeri 16%, Kurd 10%",keyIssues:"Mahsa Amini revolution, women's rights, US sanctions, regime repression, youth disillusionment, brain drain"},
  "Iraq":{pop:42,gini:29,urban:72,medAge:21,gdpPPP:9000,religions:"Islam Shia 65%, Islam Sunni 30%",ethnicities:"Arab 77%, Kurdish 15%",keyIssues:"sectarian politics, oil dependency, ISIS legacy, Iran influence, youth unemployment, water scarcity, corruption"},
  "Israel":{pop:9,gini:39,urban:93,medAge:30,gdpPPP:44000,religions:"Jewish 74%, Muslim 18%, Christian 2%",ethnicities:"Jewish 74% (Ashkenazi/Sephardi/Ethiopian), Arab 21%",keyIssues:"Gaza war/genocide accusation, occupation, judicial coup attempt, ultra-Orthodox exemptions, settler violence, Arab citizens' rights"},
  "Italy":{pop:59,gini:35,urban:71,medAge:47,gdpPPP:40000,religions:"Catholic 66%, Secular 20%",ethnicities:"Italian 92%, Romanian 3%",keyIssues:"Meloni far-right government, birth rate collapse, South poverty, mafia, migration from Africa, pension burden, youth emigration"},
  "Japan":{pop:124,gini:32,urban:92,medAge:49,gdpPPP:42000,religions:"Secular/Shinto/Buddhist 52%, Buddhist 35%",ethnicities:"Japanese 98%",keyIssues:"demographic collapse, karoshi, gender gap, immigration resistance, China-US caught between, pension crisis, rural depopulation"},
  "Jordan":{pop:10,gini:34,urban:92,medAge:23,gdpPPP:9500,religions:"Islam Sunni 95%, Christian 4%",ethnicities:"Arab 98% (Jordanian-Palestinian split)",keyIssues:"Palestinian refugee hosting, youth unemployment, water scarcity, US-Israel alignment pressure, economic stagnation"},
  "Kenya":{pop:55,gini:40,urban:28,medAge:19,gdpPPP:5000,religions:"Protestant 47%, Catholic 23%, Islam 11%",ethnicities:"Kikuyu 17%, Luhya 14%, Luo 11%, Kalenjin 13%",keyIssues:"Gen-Z protests 2024, ethnic political mobilization, corruption, climate drought, youth unemployment, M-Pesa digital economy"},
  "Malaysia":{pop:33,gini:41,urban:77,medAge:30,gdpPPP:28000,religions:"Islam Sunni 63%, Buddhist 19%, Hindu 6%",ethnicities:"Malay 69%, Chinese 23%, Indian 7%",keyIssues:"bumiputera racial preferences, Islamization pressure, Chinese minority rights, political instability, palm oil deforestation"},
  "Mexico":{pop:128,gini:46,urban:80,medAge:29,gdpPPP:20000,religions:"Catholic 77%, Evangelical 10%, Secular 8%",ethnicities:"Mestizo 62%, Indigenous 21%, White 13%",keyIssues:"cartel state, femicide, Claudia Sheinbaum, AMLO legacy, US-Mexico migration, maquiladora labor, indigenous land rights"},
  "Morocco":{pop:37,gini:40,urban:64,medAge:29,gdpPPP:9000,religions:"Islam Sunni 99%",ethnicities:"Arab-Berber 99%",keyIssues:"Amazigh rights, Western Sahara conflict, youth unemployment, migration to Europe, monarchy's limits, women's rights progress"},
  "Myanmar":{pop:54,gini:30,urban:32,medAge:29,gdpPPP:5000,religions:"Buddhist 88%, Christian 6%, Islam 4%",ethnicities:"Bamar 68%, Shan 9%, Karen 7%",keyIssues:"military coup/civil war, Rohingya genocide legacy, ethnic resistance, economic collapse, Chinese influence"},
  "Nepal":{pop:30,gini:33,urban:21,medAge:25,gdpPPP:3400,religions:"Hindu 81%, Buddhist 9%, Islam 4%",ethnicities:"Chhettri 17%, Brahman-Hill 12%, Magar 7%, Tamang 5%",keyIssues:"political instability (PM changes), caste discrimination, earthquake recovery, labor migration to Gulf, water potential"},
  "Netherlands":{pop:18,gini:29,urban:94,medAge:43,gdpPPP:58000,religions:"Secular 54%, Catholic 20%, Protestant 15%",ethnicities:"Dutch 78%, EU migrant 10%, Turkish/Moroccan 7%",keyIssues:"Wilders far-right in government, housing crisis, nitrogen crisis/farmer protests, Surinamese reparations, tax haven role"},
  "New Zealand":{pop:5,gini:33,urban:87,medAge:38,gdpPPP:46000,religions:"Secular 49%, Christian 37%",ethnicities:"European 64%, Maori 17%, Asian 15%",keyIssues:"housing unaffordability, Maori co-governance, mental health crisis, cost of living, Pacific relationship"},
  "Nigeria":{pop:220,gini:43,urban:52,medAge:18,gdpPPP:5000,religions:"Islam Sunni 53%, Christian Evangelical 25%, Catholic 10%",ethnicities:"Hausa-Fulani 29%, Yoruba 21%, Igbo 18%",keyIssues:"Tinubu presidency, naira collapse, Boko Haram, Fulani-farmer conflict, Japa emigration wave, oil theft, youth bulge"},
  "Pakistan":{pop:235,gini:30,urban:37,medAge:21,gdpPPP:6000,religions:"Islam Sunni 85%, Islam Shia 12%",ethnicities:"Punjabi 45%, Pashtun 15%, Sindhi 14%, Saraiki 9%",keyIssues:"IMF bailout, Imran Khan imprisonment, military dominance, Taliban influence, women's rights, energy crisis, climate floods"},
  "Peru":{pop:33,gini:43,urban:79,medAge:31,gdpPPP:13000,religions:"Catholic 74%, Evangelical 14%",ethnicities:"Mestizo 60%, Quechua 26%, Aymara 3%",keyIssues:"political instability (6 presidents in 7 years), mining vs indigenous rights, coca economy, Boluarte crackdown, poverty"},
  "Philippines":{pop:115,gini:41,urban:48,medAge:25,gdpPPP:8500,religions:"Catholic 79%, Evangelical 11%, Islam 6%",ethnicities:"Tagalog 28%, Cebuano 13%, Ilocano 9%",keyIssues:"Marcos Jr return, Duterte legacy/ICC, OFW remittance dependency, drug war deaths, South China Sea, typhoon vulnerability"},
  "Poland":{pop:38,gini:30,urban:60,medAge:41,gdpPPP:36000,religions:"Catholic 72%, Secular 18%",ethnicities:"Polish 97%",keyIssues:"Tusk vs PiS judiciary battle, abortion ban, Ukraine border, LGBTQ rights, EU money, demographic decline"},
  "Portugal":{pop:10,gini:33,urban:68,medAge:46,gdpPPP:33000,religions:"Catholic 70%, Secular 20%",ethnicities:"Portuguese 95%, Cape Verdean 1%",keyIssues:"housing crisis/digital nomad gentrification, emigration of young, colonial reckoning, far-right Chega rise, tourism overdependence"},
  "Romania":{pop:19,gini:35,urban:54,medAge:42,gdpPPP:28000,religions:"Orthodox Christian 81%, Catholic 5%",ethnicities:"Romanian 83%, Hungarian 6%, Roma 3%",keyIssues:"brain drain to Western Europe, corruption, Roma marginalization, Soviet infrastructure decay, NATO frontier role"},
  "Russia":{pop:146,gini:37,urban:75,medAge:40,gdpPPP:27000,religions:"Orthodox Christian 41%, Secular 37%, Islam 10%",ethnicities:"Russian 78%, Tatar 4%, Ukrainian 1%",keyIssues:"Ukraine war and mobilization, Putin's consolidation, sanctions economy, anti-war underground, ethnic minority soldiers, propaganda"},
  "Saudi Arabia":{pop:35,gini:46,urban:84,medAge:30,gdpPPP:54000,religions:"Islam Sunni 87%, Islam Shia 12%",ethnicities:"Arab 90%, South Asian expat 7%",keyIssues:"Vision 2030, MBS consolidation, oil dependency, gender reforms (limited), Yemen war guilt, migrant worker abuse, radicalization"},
  "Senegal":{pop:18,gini:38,urban:48,medAge:19,gdpPPP:3800,religions:"Islam 96%, Christian 3%",ethnicities:"Wolof 38%, Pular 26%, Serer 15%",keyIssues:"Sonko/Faye political crisis, offshore oil hopes, irregular migration to Europe, French neocolonialism, youth bulge"},
  "South Africa":{pop:60,gini:63,urban:68,medAge:27,gdpPPP:13000,religions:"Protestant 27%, Catholic 11%, Zionist 11%",ethnicities:"Black African 81%, Coloured 9%, White 8%, Indian 3%",keyIssues:"world's highest inequality, ANC corruption, load shedding, unemployment 33%, land reform, xenophobia, crime crisis"},
  "South Korea":{pop:52,gini:31,urban:82,medAge:43,gdpPPP:42000,religions:"Secular 56%, Protestant 20%, Buddhist 16%",ethnicities:"Korean 99%",keyIssues:"sampo generation, gender war, Yoon impeachment, birth rate 0.72 (world's lowest), North Korea, chaebol dominance"},
  "Spain":{pop:47,gini:33,urban:81,medAge:44,gdpPPP:38000,religions:"Catholic 58%, Secular 27%",ethnicities:"Spanish 86%, Catalan 17%, Basque 7%",keyIssues:"Catalan independence, youth unemployment, housing crisis, Vox far-right, coalition instability, water scarcity, immigration"},
  "Sri Lanka":{pop:22,gini:38,urban:19,medAge:33,gdpPPP:12000,religions:"Buddhist 70%, Hindu 13%, Islam 10%",ethnicities:"Sinhalese 75%, Tamil 11%, Sri Lankan Moor 9%",keyIssues:"economic collapse recovery, Rajapaksa legacy, Tamil reconciliation, IMF restructuring, political instability, brain drain"},
  "Sudan":{pop:46,gini:35,urban:36,medAge:20,gdpPPP:4000,religions:"Islam Sunni 97%",ethnicities:"Arab 40%, Nubian 6%, Beja 6%, Fur 6%",keyIssues:"SAF-RSF civil war, mass atrocity, 10M displaced, Darfur genocide repeat, oil economy disrupted, famine"},
  "Sweden":{pop:10,gini:28,urban:88,medAge:41,gdpPPP:55000,religions:"Lutheran 57%, Secular 25%",ethnicities:"Swedish 80%, Finnish 5%, Middle Eastern 4%",keyIssues:"gang violence in immigrant suburbs, SD far-right in government, welfare state strain, NATO membership, housing shortage"},
  "Switzerland":{pop:9,gini:33,urban:74,medAge:43,gdpPPP:70000,religions:"Catholic 33%, Protestant 22%, Secular 30%",ethnicities:"Swiss German 63%, Swiss French 23%, Italian 8%",keyIssues:"banking secrecy reform, immigration referenda, EU bilateral deal, high cost of living, pharmaceutical industry power"},
  "Syria":{pop:21,gini:36,urban:57,medAge:25,gdpPPP:2900,religions:"Islam Sunni 67%, Alawite 11%, Christian 10%",ethnicities:"Arab 90%, Kurd 9%",keyIssues:"Assad fall 2024, post-war reconstruction, 6M refugees, HTS governance, Turkish-Kurdish conflict, war crimes accountability"},
  "Tanzania":{pop:63,gini:38,urban:37,medAge:18,gdpPPP:2800,religions:"Christian 64%, Muslim 35%",ethnicities:"120+ Bantu ethnic groups, largest Sukuma 16%",keyIssues:"Magufuli's authoritarian legacy, Zanzibar tensions, gold mining benefits concentration, climate drought, Maasai land rights"},
  "Thailand":{pop:71,gini:36,urban:52,medAge:39,gdpPPP:19000,religions:"Buddhist 95%, Islam 4%",ethnicities:"Thai 75%, Lao 8%, Chinese 14%",keyIssues:"2023 coup, Prayuth legacy, monarchy critique taboo, deep south Muslim insurgency, Myanmar refugee crisis, tourism overdependence"},
  "Turkey":{pop:85,gini:42,urban:76,medAge:32,gdpPPP:29000,religions:"Islam Sunni 80%, Islam Alevi 17%",ethnicities:"Turkish 70%, Kurdish 19%",keyIssues:"Erdogan third term, currency collapse, Kurdish conflict, refugee hosting 3.5M, press crackdown, feminist movement"},
  "Uganda":{pop:48,gini:43,urban:26,medAge:16,gdpPPP:2300,religions:"Catholic 39%, Protestant 32%, Islam 14%",ethnicities:"Baganda 16%, Banyankore 10%, Basoga 9%",keyIssues:"Museveni's 37yr rule, anti-LGBTQ law, oil development, youthful population pressure, Lord's Resistance Army legacy"},
  "Ukraine":{pop:44,gini:26,urban:70,medAge:41,gdpPPP:13000,religions:"Orthodox Christian 74%, Greek Catholic 8%",ethnicities:"Ukrainian 78%, Russian 17%",keyIssues:"Russian invasion, 6M refugees, mobilization, infrastructure destruction, corruption reform, post-war reconstruction, identity"},
  "United Kingdom":{pop:67,gini:35,urban:84,medAge:40,gdpPPP:46000,religions:"Secular 52%, Christian 46%",ethnicities:"White British 80%, Asian 9%, Black 4%",keyIssues:"Brexit consequences, NHS crisis, housing unaffordability, Starmer Labour government, Scotland independence, knife crime, class divide"},
  "United States":{pop:335,gini:41,urban:83,medAge:38,gdpPPP:65000,religions:"Protestant 40%, Catholic 21%, Secular 26%",ethnicities:"White 59%, Hispanic 19%, Black 13%, Asian 6%",keyIssues:"Trump return, immigration, gun violence, abortion, student debt, healthcare costs, racial injustice, tech monopoly, climate denial"},
  "Venezuela":{pop:29,gini:39,urban:88,medAge:30,gdpPPP:17000,religions:"Catholic 70%, Evangelical 17%",ethnicities:"Mestizo 51%, White 43%, Black 4%",keyIssues:"Maduro authoritarianism, 7M emigrated, hyperinflation legacy, oil dependency, political prisoners, US sanctions, 2024 election fraud"},
  "Vietnam":{pop:98,gini:36,urban:38,medAge:31,gdpPPP:11000,religions:"Folk/ancestor 46%, Buddhist 12%, Catholic 7%",ethnicities:"Kinh 86%, Tay 2%, Thai 1%",keyIssues:"CPV one-party control, rapid export-led growth, US-China strategic positioning, land rights seizures, press freedom zero"},
  "Yemen":{pop:34,gini:37,urban:38,medAge:19,gdpPPP:2500,religions:"Islam Sunni 65%, Islam Shia/Zaidi 35%",ethnicities:"Arab 99%",keyIssues:"Saudi-Houthi war, world's worst humanitarian crisis, cholera, famine, water scarcity, tribal fragmentation, children soldiers"},
  "Zimbabwe":{pop:16,gini:44,urban:32,medAge:19,gdpPPP:2700,religions:"Protestant 75%, Catholic 8%",ethnicities:"Shona 80%, Ndebele 14%",keyIssues:"Mnangagwa regime, hyperinflation return, land reform legacy, diamond money, Mugabe's shadow, youth emigration"},
};

// Fill missing countries with generic data
COUNTRIES.forEach(c => {
  if (!COUNTRY_CENSUS[c]) {
    COUNTRY_CENSUS[c] = {pop:10,gini:40,urban:55,medAge:28,gdpPPP:8000,religions:"Mixed",ethnicities:"Mixed",keyIssues:"economic development, inequality, political stability"};
  }
});

// ─── COUNTRY BATCH GENERATOR ─────────────────────────────────────────────────
// Persona schema — kept as constant so it's clear what we're asking for
// Using system prompt for schema = Anthropic caches it after first call (~50% input token savings)
const PERSONA_SCHEMA_SYSTEM = 'Output ONLY a valid JSON array. No prose, no markdown. Each object has exactly these fields:'
  + ' name,age(int),gender(Male/Female/Non-binary),country,cityType(Remote rural/Rural/Small town/Suburban/Urban/Megacity / Metro),'
  + ' ethnicity,religion,language,income(9 levels: Extreme poverty→Ultra-wealthy),'
  + ' education(11 levels: No formal education→Doctorate / PhD),'
  + ' occupationCategory(19 types incl Agriculture,Healthcare,Tech,Service,Unemployed,Retired etc),'
  + ' occupation,employmentStatus(Full-time/Part-time/Self-employed/Unemployed/Gig/Student/Retired/Homemaker),'
  + ' political(Far-left/Left/Center-left/Center/Center-right/Right/Far-right/Nationalist / Populist/Socialist/Religious Conservative/Theocratic/Apolitical/Libertarian),'
  + ' values(array 3-5 from: Achievement,Adventure,Benevolence,Civic duty,Community,Compassion,Conformity,Creativity,Education,Equality,Environment,Family,Faith / Religion,Freedom,Hard work,Honor,Independence,Innovation,Justice,Loyalty,Nationalism,Order,Power,Security,Spirituality,Status,Tradition,Wealth),'
  + ' mediaHabits(array 1-3: Social media heavy,Social media occasional,TV news,Partisan TV,Online news,Alternative news,Print,Radio,Podcasts,Distrusts all media,Word-of-mouth,International media,Low engagement,Religious media),'
  + ' personality({O,C,E,A,N} 0.0-1.0),biases({confirmation,ingroup,lossAversion,authority,optimism,statusQuo} 0.0-1.0),'
  + ' mood,stress,trust,economicAnxiety(all 0.0-1.0),emoji,backstory(2-3 sentences),pop(float millions represented).'
  + ' Psychology rules — MUST follow: poverty→stress>0.7,econ>0.7,trust<0.3; rural+conservative→ingroup>0.7,statusQuo>0.7; high edu→confirmation<0.5; devout→authority>0.7; young urban→statusQuo<0.4,optimism>0.6; high N→emotional reactions; high stress→gut over reason.';

// Simulation system prompt — cached by Anthropic, not resent per-call
const SIM_SYSTEM_PROMPT = 'You are a synthetic human responding to a scenario. Respond ONLY in this exact format:\nR:[1-2 sentence gut reaction]\nI:[2-3 sentences through your lens/biases]\nA:[1-2 sentence action]\nE:[1 sentence emotional effect]\n{"e":"word","m":0.00,"s":0.00,"t":0.00,"ec":0.00}\nm=mood_delta(-0.2 to 0.2) s=stress_delta(-0.2 to 0.25) t=trust_delta(-0.15 to 0.15) ec=econ_delta(-0.15 to 0.15)';

async function aiGenerateCountryBatch(country, batchSize, existingNames, offset, locationContext) {
  const cd = COUNTRY_CENSUS[country] || COUNTRY_CENSUS["United States"];
  const isOffset = offset > 0;

  // Compact user message — schema is in system prompt (cached by Anthropic)
  const locationHint = locationContext ? " Location context: " + locationContext + "." : "";
  const userMsg = "Generate " + batchSize + " census-accurate personas for " + country + "." + locationHint
    + "\nStats: pop=" + cd.pop + "M gini=" + cd.gini + " urban=" + cd.urban + "% medAge=" + cd.medAge + " gdpPPP=$" + cd.gdpPPP
    + "\nReligions: " + cd.religions
    + "\nEthnicities: " + cd.ethnicities
    + "\nIssues: " + cd.keyIssues
    + "\nRequire: spread of ages(15-80), genders, rural+urban, income levels per Gini " + cd.gini + ", religions+ethnicities per above proportions."
    + (isOffset ? "\nBatch " + (Math.floor(offset/batchSize)+1) + " — must be DIFFERENT people, regions, occupations from prior batches." : "")
    + (existingNames.length > 0 ? "\nAvoid names: " + existingNames.slice(0,15).join(", ") : "")
    + "\nReturn JSON array of " + batchSize + " objects only.";

  // Right-size tokens: each persona ~220 tokens, add 30% buffer
  const batchTokens = Math.min(8000, batchSize * 300 + 200);
  const raw = await callClaude([{role:"user", content:userMsg}], PERSONA_SCHEMA_SYSTEM, batchTokens);
  // Extract JSON array (handle truncated responses)
  const startBracket = raw.indexOf('[');
  if (startBracket < 0) throw new Error("AI did not return JSON. Try batch size 10.");
  let jsonStr = raw.slice(startBracket);
  // Repair truncated JSON: remove incomplete last object
  if (!jsonStr.trimEnd().endsWith(']')) {
    const lastComma = jsonStr.lastIndexOf('},');
    if (lastComma > 0) jsonStr = jsonStr.slice(0, lastComma + 1) + ']';
    else { const lb = jsonStr.lastIndexOf('}'); if (lb > 0) jsonStr = jsonStr.slice(0, lb+1) + ']'; else throw new Error('Response truncated. Try batch size 10.'); }
  }
  try { return JSON.parse(jsonStr); }
  catch(e) {
    const objs = jsonStr.match(/{(?:[^}{]|{[^}{]*})*}/g) || [];
    const valid = []; objs.forEach(function(s){ try{ valid.push(JSON.parse(s)); }catch(e2){} });
    if (valid.length > 0) return valid;
    throw new Error('JSON parse failed: ' + e.message.slice(0,60) + '. Try batch size 10.');
  }
}

function computeLayout(personas) {
  if (!personas.length) return [];
  const groups = {};
  personas.forEach(p => {
    const g = p.group || "Ungrouped";
    if (!groups[g]) groups[g] = [];
    groups[g].push(p);
  });
  const groupNames = Object.keys(groups);
  const G = groupNames.length;
  const positions = {};
  groupNames.forEach((gname, gi) => {
    const angle = G === 1 ? -Math.PI/2 : (2*Math.PI*gi/G - Math.PI/2);
    const R = G === 1 ? 0 : G <= 2 ? 0.20 : 0.28;
    const cx = 0.5 + R * Math.cos(angle);
    const cy = 0.46 + R * Math.sin(angle);
    const members = groups[gname];
    const N = members.length;
    members.forEach((p, pi) => {
      const ma = N === 1 ? 0 : (2*Math.PI*pi/N);
      const mr = N === 1 ? 0 : N <= 3 ? 0.08 : 0.12;
      positions[p.id] = { gx: cx + mr*Math.cos(ma), gy: cy + mr*Math.sin(ma) };
    });
  });
  return personas.map(p => ({ ...p, ...(positions[p.id] || {gx:0.5, gy:0.5}) }));
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────
function downloadFile(content, filename, type="text/plain") {
  try {
    const uri = "data:" + type + ";charset=utf-8," + encodeURIComponent(content);
    const a = document.createElement("a");
    a.setAttribute("href", uri);
    a.setAttribute("download", filename);
    a.style.cssText = "position:fixed;top:-100px;left:-100px;opacity:0;pointer-events:none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { try { document.body.removeChild(a); } catch(e){} }, 3000);
  } catch(err) {
    // Final fallback — open content in new tab
    try {
      const win = window.open("", "_blank");
      if (win) { win.document.write("<pre style='white-space:pre-wrap;font-family:monospace;padding:20px'>" + content.replace(/&/g,"&amp;").replace(/</g,"&lt;") + "</pre>"); win.document.title = filename; }
    } catch(e2) { alert("Download failed. Try copying from the timeline export."); }
  }
}

function exportReport(personas, rounds) {
  const lines = [
    "═══════════════════════════════════════════════════════════════",
    "  MY HUMANITY LAB — WORLD SIMULATION RESEARCH REPORT",
    `  Generated: ${new Date().toLocaleString()}`,
    "═══════════════════════════════════════════════════════════════",
    "",
    `POPULATION: ${personas.length} synthetic agents across ${[...new Set(personas.map(p=>p.country))].length} countries`,
    "",
    "── AGENT PROFILES ─────────────────────────────────────────────",
  ];
  personas.forEach(p => {
    lines.push(`\n▸ ${p.name}  (${p.age}, ${p.gender}, ${p.country})`);
    lines.push(`  Role:      ${p.occupation||p.occupationCategory} · ${p.income} · ${p.employmentStatus}`);
    lines.push(`  Identity:  ${p.ethnicity||"–"} · ${p.religion||"–"} · ${p.language}`);
    lines.push(`  Politics:  ${p.political}`);
    lines.push(`  Values:    ${(p.values||[]).join(", ")||"–"}`);
    lines.push(`  State:     Mood ${Math.round(p.mood*100)}% · Stress ${Math.round(p.stress*100)}% · Trust ${Math.round(p.trust*100)}% · Econ Anxiety ${Math.round(p.economicAnxiety*100)}%`);
    if (p.backstory) lines.push(`  Backstory: ${p.backstory}`);
  });
  lines.push("\n── SIMULATION ROUNDS ──────────────────────────────────────────");
  [...rounds].reverse().forEach((r, ri) => {
    lines.push("\nRound " + (ri+1) + (r.year ? " · Year " + r.year : "") + " — " + r.icon + " " + r.label);
    lines.push(`Scenario: ${r.scenario}`);
    lines.push("");
    r.responses.forEach(resp => {
      const p = personas.find(x => x.id === resp.personaId);
      if (!p) return;
      lines.push(`  [${p.name}] — ${resp.deltas?.emotion || "responded"}`);
      lines.push(`  ${resp.narrative.replace(/\n/g," ").slice(0,400)}`);
      if (resp.deltas) {
        const d = resp.deltas;
        const fmt = v => (v>0?"+":"")+Math.round(v*100);
        lines.push(`  Δmood:${fmt(d.mood_delta||0)}  Δstress:${fmt(d.stress_delta||0)}  Δtrust:${fmt(d.trust_delta||0)}  Δecon:${fmt(d.econ_delta||0)}`);
      }
      lines.push("");
    });
    lines.push("───────────────────────────────────────────────────────────────");
  });
  downloadFile(lines.join("\n"), "my-humanity-lab-report-" + Date.now() + ".txt");
}

function exportJSON(personas, rounds) {
  const data = { exportDate:new Date().toISOString(), software:"SynthSoc v4", agentCount:personas.length, roundCount:rounds.length, personas, rounds };
  downloadFile(JSON.stringify(data, null, 2), "my-humanity-lab-data-" + Date.now() + ".json", "application/json");
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN SYSTEM COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// ─── THEME CSS BUILDER ────────────────────────────────────────────────────────
function buildCss(key) {
  const t = THEMES[key] || THEMES.abyss;
  return "@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');"
    + "*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}"
    + ":root{" + t.vars + "}"
    + "body{" + t.body + "font-family:'DM Sans',sans-serif;transition:background 0.5s,color 0.5s;-webkit-font-smoothing:antialiased;}"
    + "::-webkit-scrollbar{width:3px;height:3px;}"
    + "::-webkit-scrollbar-track{background:transparent;}"
    + "::-webkit-scrollbar-thumb{background:var(--c-border);border-radius:99px;}"
    + "input[type=range]{-webkit-appearance:none;width:100%;height:3px;background:var(--c-border);border-radius:99px;outline:none;cursor:pointer;}"
    + "input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--c-blue);cursor:pointer;border:3px solid var(--c-bg0);box-shadow:0 0 8px var(--c-glow);}"
    + "textarea,input,select{font-family:'DM Sans',sans-serif;box-sizing:border-box;}"
    + "button{-webkit-tap-highlight-color:transparent;}"
    // Keyframes
    + "@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}"
    + "@keyframes fadeInScale{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}"
    + "@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}"
    + "@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"
    + "@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}"
    + "@keyframes splashReveal{0%{opacity:0;letter-spacing:0.6em;filter:blur(6px)}100%{opacity:1;letter-spacing:-0.01em;filter:blur(0)}}"
    + "@keyframes splashSub{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:translateY(0)}}"
    + "@keyframes gridScroll{0%{background-position:0 0}100%{background-position:40px 40px}}"
    + "@keyframes orbitDot{0%{transform:rotate(0deg) translateX(90px) rotate(0deg)}100%{transform:rotate(360deg) translateX(90px) rotate(-360deg)}}"
    + "@keyframes orbitSmall{0%{transform:rotate(0deg) translateX(22px) rotate(0deg)}100%{transform:rotate(360deg) translateX(22px) rotate(-360deg)}}"
    + "@keyframes floatAnim{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}"
    + "@keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 var(--c-glow)}50%{box-shadow:0 0 20px 4px var(--c-glow)}}"
    + "@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}"
    + "@keyframes barGrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}"
    + "@keyframes twinkle{0%,100%{opacity:0.9;transform:scale(1)}40%{opacity:0.25;transform:scale(0.6)}60%{opacity:1;transform:scale(1.15)}}  "
    + "@keyframes twinkleSlow{0%,100%{opacity:0.7}50%{opacity:0.15}}  "
    // Utility classes
    + ".fade-in{animation:fadeIn 0.25s ease both;}"
    + ".slide-up{animation:slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both;}"
    + ".mono{font-family:'JetBrains Mono',monospace;}"
    // Glass card effect (light overlay on bg1)
    + ".glass{background:linear-gradient(135deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.01) 100%);backdrop-filter:blur(12px);}"
    // Hover effects
    + ".btn-ghost{transition:all 0.18s;}"
    + ".btn-ghost:hover{background:var(--c-border)!important;transform:translateY(-1px);}"
    + ".btn-ghost:active{transform:translateY(0);}"
    + ".card-hover{transition:border-color 0.2s,box-shadow 0.2s;}"
    + ".card-hover:hover{border-color:var(--c-borderHi)!important;box-shadow:0 4px 24px var(--c-glow);}"
    // Stagger helpers
    + ".stagger-1{animation-delay:0.05s}.stagger-2{animation-delay:0.10s}.stagger-3{animation-delay:0.15s}.stagger-4{animation-delay:0.20s}.stagger-5{animation-delay:0.25s}";
}

// ─── DESIGN SYSTEM ────────────────────────────────────────────────────────────
function Card({ children, accent, style, hover, glow }) {
  const s = style || {};
  const borderColor = accent ? accent+"44" : T.border;
  const glowColor = accent ? accent+"18" : (glow ? "var(--c-glow)" : "transparent");
  return (
    <div className={"card-hover fade-in"} style={Object.assign({
      background: T.bg1,
      border: "1px solid " + borderColor,
      borderRadius: 14,
      padding: 16,
      boxShadow: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 2px 16px " + glowColor,
      position: "relative",
      overflow: "hidden",
    }, s)}>
      {accent && <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg," + accent + "aa,transparent)", borderRadius:"14px 14px 0 0" }} />}
      {children}
    </div>
  );
}

function Label({ children, color }) {
  return (
    <div style={{ fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", color:color||T.txt2, marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

const inputStyle = { width:"100%", background:T.bg2, border:"1px solid " + T.border, borderRadius:10, padding:"10px 14px", color:T.txt0, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none", transition:"border-color 0.2s, box-shadow 0.2s" };

function Input({ label, value, onChange, placeholder, type }) {
  return (
    <Field label={label}>
      <input type={type||"text"} value={value} onChange={function(e){onChange(e.target.value);}} placeholder={placeholder||""} style={inputStyle} />
    </Field>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <Field label={label}>
      <select value={value} onChange={function(e){onChange(e.target.value);}} style={Object.assign({}, inputStyle, { cursor:"pointer" })}>
        {options.map(function(o){ return <option key={o} value={o}>{o}</option>; })}
      </select>
    </Field>
  );
}

function Textarea({ label, value, onChange, placeholder, rows }) {
  return (
    <Field label={label}>
      <textarea value={value} onChange={function(e){onChange(e.target.value);}} placeholder={placeholder||""} rows={rows||3} style={Object.assign({}, inputStyle, { resize:"vertical" })} />
    </Field>
  );
}

function Slider({ label, value, onChange, color, description }) {
  const pct = Math.round(value * 100);
  const col = color || T.blue;
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4 }}>
        <span style={{ fontSize:12, color:T.txt0 }}>{label}</span>
        <span style={{ fontSize:12, fontWeight:600, color:value > 0.65 ? col : T.txt1 }}>{pct}%</span>
      </div>
      {description && <div style={{ fontSize:11, color:T.txt2, marginBottom:5, lineHeight:1.5 }}>{description}</div>}
      <input type="range" min={0} max={100} value={pct} onChange={function(e){ onChange(+e.target.value / 100); }} style={{ accentColor:col }} />
    </div>
  );
}

function ToggleBtn({ active, onClick, children, small }) {
  return (
    <button onClick={onClick} style={{ padding:small?"4px 12px":"7px 14px", background:active?"var(--c-glow)":T.bg2, border:"1px solid " + (active ? T.blue : T.border), borderRadius:99, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:small?11:12, color:active?T.blue:T.txt1, fontWeight:active?600:400, transition:"all 0.18s", whiteSpace:"nowrap", letterSpacing:active?"0.01em":"0" }}>
      {children}
    </button>
  );
}

function MultiSelect({ label, options, selected, onToggle, max }) {
  const lbl = label + (max ? " (pick up to " + max + ")" : "");
  return (
    <Field label={lbl}>
      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
        {options.map(function(o) {
          const isOn = selected.includes(o);
          const disabled = !isOn && max && selected.length >= max;
          return (
            <button key={o} onClick={function(){ if (!disabled) onToggle(o); }} style={{ padding:"3px 9px", background:isOn?T.blue + "22":T.bg2, border:"1px solid " + (isOn ? T.blue : T.border), borderRadius:99, cursor:disabled?"not-allowed":"pointer", fontFamily:"inherit", fontSize:11, color:isOn?T.blue:disabled?T.txt2:T.txt1, opacity:disabled?0.45:1, transition:"all 0.15s" }}>
              {o}
            </button>
          );
        })}
      </div>
    </Field>
  );
}

function PersonaAvatar({ persona, size, active }) {
  const sz = size || 40;
  return (
    <div style={{ width:sz, height:sz, borderRadius:"50%", flexShrink:0, background:"linear-gradient(135deg," + persona.color + "28," + persona.color + "12)", border:"1.5px solid " + (active ? persona.color : persona.color+"50"), display:"flex", alignItems:"center", justifyContent:"center", fontSize:sz*0.46, transition:"all 0.25s", boxShadow:active ? "0 0 0 3px " + persona.color + "22, 0 0 20px " + persona.color + "33" : "none" }}>
      {persona.emoji}
    </div>
  );
}

function PrimaryBtn({ onClick, disabled, loading, children, color }) {
  const col = color || T.blue;
  return (
    <button onClick={onClick} disabled={disabled} style={{ width:"100%", padding:"13px 20px", borderRadius:12, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:disabled?"not-allowed":"pointer", background:disabled?T.bg2:"linear-gradient(135deg," + col + "1a," + col + "0d)", border:"1px solid " + (disabled?T.border:col+"88"), color:disabled?T.txt2:col, transition:"all 0.2s", opacity:loading?0.7:1, letterSpacing:"0.02em", boxShadow:disabled?"none":"0 0 16px " + col + "15" }}>
      {loading ? <span style={{ animation:"pulse 1.2s ease infinite", display:"inline-block" }}>{"⟳ " + children}</span> : children}
    </button>
  );
}

function StatBar({ label, value, color }) {
  return (
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ fontSize:9, color:T.txt2, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</div>
      <div style={{ height:3, background:T.bg0, borderRadius:99, overflow:"hidden" }}>
        <div style={{ height:"100%", width:(value*100) + "%", background:"linear-gradient(90deg," + color + "cc," + color + ")", borderRadius:99, transition:"width 0.6s cubic-bezier(0.16,1,0.3,1)" }} />
      </div>
      <div style={{ fontSize:10, color:color, marginTop:3, fontWeight:700, fontFamily:"'JetBrains Mono',monospace" }}>{Math.round(value*100)}</div>
    </div>
  );
}

function StepBar({ step, total }) {
  const bars = [];
  for (let i = 0; i < total; i++) {
    bars.push(<div key={i} style={{ flex:1, height:2, borderRadius:99, background: i < step ? T.blue : i === step-1 ? T.blue : T.border, transition:"all 0.4s cubic-bezier(0.16,1,0.3,1)", boxShadow: i < step ? "0 0 6px " + T.blue + "66" : "none" }} />);
  }
  return <div style={{ display:"flex", gap:3, marginBottom:8 }}>{bars}</div>;
}

// ─── WIZARD STEPS ─────────────────────────────────────────────────────────────
function Step1({ d, update }) {
  return (
    <div>
      <StepBar step={1} total={4} />
      <div style={{ fontSize:11, color:T.txt2, marginBottom:3 }}>STEP 1 OF 4</div>
      <h2 style={{ fontSize:18, fontWeight:700, color:T.txt0, marginBottom:4 }}>Identity & Location</h2>
      <p style={{ fontSize:12, color:T.txt1, marginBottom:18, lineHeight:1.6 }}>Who is this person and where do they live?</p>
      <Input label="Full Name *" value={d.name} onChange={function(v){ update("name", v); }} placeholder="e.g. Amara Okafor, Wei Chen, Carlos Reyes..." />
      <div style={{ display:"flex", gap:10 }}>
        <div style={{ flex:1 }}><SelectField label="Gender" value={d.gender} onChange={function(v){ update("gender", v); }} options={["Male","Female","Non-binary","Other"]} /></div>
        <div style={{ width:80 }}><Input label="Age" value={d.age} onChange={function(v){ update("age", parseInt(v)||0); }} type="number" /></div>
      </div>
      <SelectField label="Country" value={d.country} onChange={function(v){ update("country", v); }} options={COUNTRIES} />
      <SelectField label="Settlement Type" value={d.cityType} onChange={function(v){ update("cityType", v); }} options={CITIES} />
      <SelectField label="Ethnicity" value={d.ethnicity} onChange={function(v){ update("ethnicity", v); }} options={ETHNICITIES} />
      <SelectField label="Religion" value={d.religion} onChange={function(v){ update("religion", v); }} options={RELIGIONS} />
      <Input label="Language(s)" value={d.language} onChange={function(v){ update("language", v); }} placeholder="e.g. English, Mandarin, Spanish" />
      <Field label="Emoji">
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {EMOJIS.map(function(e) {
            return <button key={e} onClick={function(){ update("emoji", e); }} style={{ width:36, height:36, fontSize:20, background:d.emoji===e?T.blue + "22":T.bg0, border:"1px solid " + (d.emoji===e?T.blue:T.border), borderRadius:8, cursor:"pointer" }}>{e}</button>;
          })}
        </div>
      </Field>
    </div>
  );
}

function Step2({ d, update }) {
  return (
    <div>
      <StepBar step={2} total={4} />
      <div style={{ fontSize:11, color:T.txt2, marginBottom:3 }}>STEP 2 OF 4</div>
      <h2 style={{ fontSize:18, fontWeight:700, color:T.txt0, marginBottom:4 }}>Socioeconomics</h2>
      <p style={{ fontSize:12, color:T.txt1, marginBottom:18, lineHeight:1.6 }}>Economic and professional circumstances.</p>
      <SelectField label="Income Level" value={d.income} onChange={function(v){ update("income", v); }} options={INCOMES} />
      <SelectField label="Education" value={d.education} onChange={function(v){ update("education", v); }} options={EDUS} />
      <SelectField label="Occupation Category" value={d.occupationCategory} onChange={function(v){ update("occupationCategory", v); }} options={OCC_CATS} />
      <Input label="Job Title" value={d.occupation} onChange={function(v){ update("occupation", v); }} placeholder="e.g. Factory worker, Teacher, Software engineer" />
      <SelectField label="Employment Status" value={d.employmentStatus} onChange={function(v){ update("employmentStatus", v); }} options={EMPLOY} />
      <SelectField label="Political Orientation" value={d.political} onChange={function(v){ update("political", v); }} options={POL_OPTS} />
      <MultiSelect label="Core Values" options={VALUES_ALL} selected={d.values} onToggle={function(v){ update("values", d.values.includes(v) ? d.values.filter(function(x){ return x!==v; }) : [...d.values, v]); }} max={6} />
      <MultiSelect label="Media Habits" options={MEDIA_ALL} selected={d.mediaHabits} onToggle={function(v){ update("mediaHabits", d.mediaHabits.includes(v) ? d.mediaHabits.filter(function(x){ return x!==v; }) : [...d.mediaHabits, v]); }} max={4} />
      <Field label={"Population represented (millions)"}>
        <input type="number" value={d.pop||1} min={0} onChange={function(e){ update("pop", parseFloat(e.target.value)||1); }} style={inputStyle} />
      </Field>
    </div>
  );
}

function Step3({ d, update }) {
  const traits = [
    { key:"O", label:"Openness", lo:"Conventional", hi:"Creative/Curious" },
    { key:"C", label:"Conscientiousness", lo:"Spontaneous", hi:"Disciplined" },
    { key:"E", label:"Extraversion", lo:"Introverted", hi:"Extraverted" },
    { key:"A", label:"Agreeableness", lo:"Competitive", hi:"Cooperative" },
    { key:"N", label:"Neuroticism", lo:"Stable", hi:"Anxious" },
  ];
  const biasItems = [
    { key:"confirmation", label:"Confirmation Bias", desc:"Seeks info confirming existing beliefs" },
    { key:"ingroup", label:"Ingroup Bias", desc:"Favors their own group, tribe, nation" },
    { key:"lossAversion", label:"Loss Aversion", desc:"Fears losses more than values equivalent gains" },
    { key:"authority", label:"Authority Bias", desc:"Defers to experts, officials, institutions" },
    { key:"optimism", label:"Optimism Bias", desc:"Overestimates positive personal outcomes" },
    { key:"statusQuo", label:"Status Quo Bias", desc:"Prefers keeping things as they are" },
  ];
  return (
    <div>
      <StepBar step={3} total={4} />
      <div style={{ fontSize:11, color:T.txt2, marginBottom:3 }}>STEP 3 OF 4</div>
      <h2 style={{ fontSize:18, fontWeight:700, color:T.txt0, marginBottom:4 }}>Psychology</h2>
      <p style={{ fontSize:12, color:T.txt1, marginBottom:18, lineHeight:1.6 }}>Personality traits, biases, and current emotional state.</p>
      <Label>Big Five Personality (OCEAN)</Label>
      {traits.map(function(tr) {
        return (
          <Slider key={tr.key} label={tr.label + " — " + (d.personality[tr.key] > 0.6 ? tr.hi : d.personality[tr.key] < 0.4 ? tr.lo : "Balanced")}
            value={d.personality[tr.key]} onChange={function(v){ update("personality", Object.assign({}, d.personality, { [tr.key]:v })); }} />
        );
      })}
      <Label style={{ marginTop:12 }}>Cognitive Biases</Label>
      {biasItems.map(function(b) {
        return (
          <Slider key={b.key} label={b.label} description={b.desc} value={d.biases[b.key]} onChange={function(v){ update("biases", Object.assign({}, d.biases, { [b.key]:v })); }} color={T.purple} />
        );
      })}
      <Label style={{ marginTop:12 }}>Current Emotional State</Label>
      <Slider label="Mood" value={d.mood} onChange={function(v){ update("mood", v); }} color={T.green} />
      <Slider label="Stress" value={d.stress} onChange={function(v){ update("stress", v); }} color={T.red} />
      <Slider label="Institutional Trust" value={d.trust} onChange={function(v){ update("trust", v); }} color={T.blue} />
      <Slider label="Economic Anxiety" value={d.economicAnxiety} onChange={function(v){ update("economicAnxiety", v); }} color={T.amber} />
    </div>
  );
}

function Step4({ d, update, allPersonas }) {
  return (
    <div>
      <StepBar step={4} total={4} />
      <div style={{ fontSize:11, color:T.txt2, marginBottom:3 }}>STEP 4 OF 4</div>
      <h2 style={{ fontSize:18, fontWeight:700, color:T.txt0, marginBottom:4 }}>Social Context</h2>
      <p style={{ fontSize:12, color:T.txt1, marginBottom:18, lineHeight:1.6 }}>Group belonging, relationships, and backstory.</p>
      <Input label="Social Group" value={d.group} onChange={function(v){ update("group", v); }} placeholder="e.g. Chen Family, Lagos Youth Collective..." />
      <Textarea label="Backstory" value={d.backstory} onChange={function(v){ update("backstory", v); }} placeholder="2-4 sentences about their life, formative experiences, and what drives them..." rows={4} />
      <Field label="Color">
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {PERSONA_COLORS.map(function(c) {
            return (
              <button key={c} onClick={function(){ update("color", c); }} style={{ width:28, height:28, borderRadius:"50%", background:c, border:"3px solid " + (d.color===c?"white":"transparent"), cursor:"pointer" }} />
            );
          })}
        </div>
      </Field>
      {allPersonas.length > 0 && (
        <div>
          <Label>Relationships</Label>
          {d.relations.map(function(rel, ri) {
            return (
              <div key={ri} style={{ display:"flex", gap:6, marginBottom:6, alignItems:"center" }}>
                <select value={rel.to} onChange={function(e){ const rs=[...d.relations]; rs[ri]={...rs[ri],to:e.target.value}; update("relations",rs); }} style={Object.assign({},inputStyle,{flex:2,padding:"7px 10px"})}>
                  {allPersonas.filter(function(p){ return p.id!==d.id; }).map(function(p){ return <option key={p.id} value={p.id}>{p.name}</option>; })}
                </select>
                <select value={rel.type} onChange={function(e){ const rs=[...d.relations]; rs[ri]={...rs[ri],type:e.target.value}; update("relations",rs); }} style={Object.assign({},inputStyle,{flex:2,padding:"7px 10px"})}>
                  {REL_TYPES.map(function(r){ return <option key={r} value={r}>{r}</option>; })}
                </select>
                <button onClick={function(){ update("relations", d.relations.filter(function(_,i){ return i!==ri; })); }} style={{ padding:"7px 10px", background:T.bg0, border:"1px solid " + T.red + "44", borderRadius:8, color:T.red, cursor:"pointer", fontFamily:"inherit", fontSize:12 }}>×</button>
              </div>
            );
          })}
          {allPersonas.length > 1 && (
            <button onClick={function(){ update("relations", [...d.relations, { to:allPersonas.find(function(p){ return p.id!==d.id; }).id, type:"close friend" }]); }} style={{ fontSize:11, color:T.blue, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", padding:"4px 0" }}>
              + Add Relationship
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── AI GENERATE PANEL ────────────────────────────────────────────────────────
function AIGeneratePanel({ onFill, allPersonas }) {
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const generate = async function() {
    if (!desc.trim()) return;
    setLoading(true); setErr("");
    try {
      const p = await aiGeneratePersona(desc, allPersonas);
      onFill(p);
    } catch(e) { setErr(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ background:T.bg0, border:"1px solid " + T.purple + "44", borderRadius:12, padding:16, marginBottom:20 }}>
      <Label color={T.purple}>AI Generate</Label>
      <p style={{ fontSize:12, color:T.txt1, marginBottom:12, lineHeight:1.6 }}>Describe anyone — Claude fills all 30+ fields.</p>
      <Textarea label="Description" value={desc} onChange={setDesc} placeholder={'e.g. "60-year-old retired coal miner in West Virginia, Fox News, lost pension, deep religious faith"'} rows={3} />
      {err && <div style={{ fontSize:11, color:T.red, marginBottom:8 }}>{err}</div>}
      <PrimaryBtn onClick={generate} disabled={loading || !desc.trim()} loading={loading} color={T.purple}>
        Generate with AI
      </PrimaryBtn>
    </div>
  );
}

// ─── PERSONA WIZARD ───────────────────────────────────────────────────────────
function PersonaWizard({ allPersonas, onSave, onCancel, editTarget }) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState(function() {
    if (editTarget) return editTarget;
    return { id:null, name:"", age:30, gender:"Male", country:"United States", cityType:"Urban", ethnicity:"", religion:"", language:"English", income:"Middle class", education:"Bachelor's degree", occupationCategory:"Service (Retail/Food/Hospitality)", occupation:"", employmentStatus:"Employed full-time", political:"Center", values:[], mediaHabits:[], personality:{O:0.5,C:0.5,E:0.5,A:0.5,N:0.5}, biases:{confirmation:0.5,ingroup:0.5,lossAversion:0.5,authority:0.5,optimism:0.5,statusQuo:0.5}, mood:0.6, stress:0.4, trust:0.5, economicAnxiety:0.4, group:"", relations:[], backstory:"", color:nextColor(allPersonas), emoji:"👤", pop:1 };
  });

  const update = function(key, val) { setDraft(function(prev){ return Object.assign({}, prev, { [key]:val }); }); };
  const canNext = step === 1 ? draft.name.trim().length > 0 : true;
  const save = function() {
    const id = draft.id || uid();
    onSave(Object.assign({}, draft, { id:id }));
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:T.bg0, fontFamily:"Inter,sans-serif" }}>
      <div style={{ padding:"16px 20px 0", borderBottom:"1px solid " + T.border, flexShrink:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, color:T.blue }}>
            {draft.id ? "Edit Persona" : "New Persona"}
          </div>
          <button onClick={onCancel} style={{ background:"none", border:"none", color:T.txt2, cursor:"pointer", fontSize:20, lineHeight:1 }}>×</button>
        </div>
        <div style={{ display:"flex", gap:0, marginBottom:-1 }}>
          {["Identity","Economics","Psychology","Social"].map(function(lbl, i) {
            const active = step === i+1;
            const done = step > i+1;
            return (
              <button key={i} onClick={function(){ if (done || active) setStep(i+1); }} style={{ padding:"8px 14px", background:"none", border:"none", borderBottom:"2px solid " + (active?T.blue:done?T.green:"transparent"), cursor:"pointer", fontFamily:"inherit", fontSize:11, color:active?T.blue:done?T.green:T.txt2, fontWeight:active?600:400 }}>
                {done ? "✓ " : ""}{lbl}
              </button>
            );
          })}
        </div>
      </div>

      <AIGeneratePanel onFill={function(p){ setDraft(function(prev){ return Object.assign({}, prev, p, { id:prev.id, color:prev.color }); }); setStep(1); }} allPersonas={allPersonas} />

      <div style={{ flex:1, overflowY:"auto", padding:"20px" }}>
        {step === 1 && <Step1 d={draft} update={update} />}
        {step === 2 && <Step2 d={draft} update={update} />}
        {step === 3 && <Step3 d={draft} update={update} />}
        {step === 4 && <Step4 d={draft} update={update} allPersonas={allPersonas} />}
      </div>

      <div style={{ padding:"14px 20px", borderTop:"1px solid " + T.border, display:"flex", gap:8, flexShrink:0 }}>
        {step > 1
          ? <button onClick={function(){ setStep(step-1); }} style={{ flex:1, padding:"11px", background:T.bg2, border:"1px solid " + T.border, borderRadius:10, color:T.txt1, fontFamily:"inherit", fontSize:13, cursor:"pointer" }}>← Back</button>
          : <button onClick={onCancel} style={{ flex:1, padding:"11px", background:T.bg2, border:"1px solid " + T.border, borderRadius:10, color:T.txt1, fontFamily:"inherit", fontSize:13, cursor:"pointer" }}>Cancel</button>
        }
        {step < 4
          ? <button onClick={function(){ setStep(step+1); }} disabled={!canNext} style={{ flex:2, padding:"11px", background:canNext?T.blue + "14":T.bg2, border:"1px solid " + (canNext?T.blue:T.border), borderRadius:10, color:canNext?T.blue:T.txt2, fontFamily:"inherit", fontSize:13, fontWeight:600, cursor:canNext?"pointer":"not-allowed" }}>Next →</button>
          : <button onClick={save} disabled={!draft.name.trim()} style={{ flex:2, padding:"11px", background:T.blue + "14", border:"1px solid " + T.green, borderRadius:10, color:T.green, fontFamily:"inherit", fontSize:13, fontWeight:600, cursor:"pointer" }}>Save Persona ✓</button>
        }
      </div>
    </div>
  );
}

// ─── WORLD VIEW ───────────────────────────────────────────────────────────────

// ─── GROUP HEADER with inline rename ─────────────────────────────────────────
function GroupHeader({ gName, count, personas, onRenameGroup }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(gName);
  const inputRef = useRef(null);

  useEffect(function() { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  const commit = function() {
    setEditing(false);
    onRenameGroup(gName, val);
  };

  return (
    <div style={{ fontSize:9, fontWeight:700, color:T.txt2, textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:10, paddingLeft:2, display:"flex", alignItems:"center", gap:8 }}>
      {editing ? (
        <input
          ref={inputRef}
          value={val}
          onChange={function(e){ setVal(e.target.value); }}
          onBlur={commit}
          onKeyDown={function(e){ if (e.key === "Enter") commit(); if (e.key === "Escape") { setVal(gName); setEditing(false); } }}
          style={{ fontSize:9, fontWeight:700, background:"none", border:"none", borderBottom:"1px solid " + T.blue, color:T.txt0, outline:"none", width:"auto", minWidth:80, maxWidth:160, letterSpacing:"0.14em", textTransform:"uppercase", fontFamily:"inherit", padding:"0 2px" }}
        />
      ) : (
        <span onClick={function(){ setEditing(true); setVal(gName); }} style={{ cursor:"pointer" }} title="Click to rename group">{gName !== "Ungrouped" ? gName : "Ungrouped"}</span>
      )}
      <div style={{ flex:1, height:"1px", background:T.border }} />
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9 }}>{count}</span>
      {gName !== "Ungrouped" && (
        <button onClick={function(){ onRenameGroup(gName, ""); }} title="Ungroup all" style={{ background:"none", border:"none", cursor:"pointer", color:T.txt2, fontSize:9, fontFamily:"inherit", padding:"0 2px", opacity:0.7 }}>ungroup</button>
      )}
    </div>
  );
}


// ─── GROUP EDIT SECTION ───────────────────────────────────────────────────────
function GroupEditSection({ persona: p, personas, setPersonas }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(p.group || "");

  // Sync draft when external group change happens (e.g. group rename from header)
  useEffect(function() {
    setDraft(p.group || "");
  }, [p.group]);

  // All distinct group names across all personas
  const allGroups = Array.from(new Set(
    personas.map(function(x){ return x.group || ""; }).filter(Boolean)
  )).sort();

  const assign = function(groupName) {
    setPersonas(personas.map(function(x){
      return x.id === p.id ? Object.assign({}, x, { group: groupName }) : x;
    }));
    setEditing(false);
    setDraft(groupName);
  };

  const currentGroup = p.group || "";

  return (
    <div style={{ marginBottom:10, background:T.bg0, borderRadius:8, padding:"8px 10px" }}>
      {/* Current group display */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
        <div style={{ fontSize:9, color:T.txt2, textTransform:"uppercase", letterSpacing:"0.08em" }}>Group</div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          {currentGroup ? (
            <>
              <span style={{ fontSize:11, color:T.blue, fontWeight:600 }}>{currentGroup}</span>
              <button onClick={function(){ assign(""); }} style={{ fontSize:9, padding:"2px 6px", background:T.red+"10", border:"1px solid "+T.red+"33", borderRadius:6, color:T.red, cursor:"pointer", fontFamily:"inherit" }}>
                Remove
              </button>
            </>
          ) : (
            <span style={{ fontSize:11, color:T.txt2, fontStyle:"italic" }}>No group</span>
          )}
          <button onClick={function(){ setEditing(!editing); setDraft(currentGroup); }} style={{ fontSize:9, padding:"2px 6px", background:T.bg1, border:"1px solid "+T.border, borderRadius:6, color:T.txt1, cursor:"pointer", fontFamily:"inherit" }}>
            {editing ? "Cancel" : "Change"}
          </button>
        </div>
      </div>

      {editing && (
        <div>
          {/* Existing groups as quick-pick pills */}
          {allGroups.length > 0 && (
            <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:6 }}>
              {allGroups.map(function(g) {
                return (
                  <button key={g} onClick={function(){ assign(g); }}
                    style={{ padding:"3px 9px", background:currentGroup===g ? T.blue+"22" : T.bg1, border:"1px solid "+(currentGroup===g ? T.blue : T.border), borderRadius:99, fontSize:10, color:currentGroup===g ? T.blue : T.txt1, cursor:"pointer", fontFamily:"inherit" }}>
                    {currentGroup === g ? "✓ " : ""}{g}
                  </button>
                );
              })}
            </div>
          )}
          {/* Type a new group name */}
          <div style={{ display:"flex", gap:6 }}>
            <input
              value={draft}
              onChange={function(e){ setDraft(e.target.value); }}
              onKeyDown={function(e){ if (e.key === "Enter" && draft.trim()) assign(draft.trim()); }}
              placeholder="New group name..."
              style={Object.assign({}, inputStyle, { flex:1, fontSize:11, padding:"6px 9px" })}
            />
            <button onClick={function(){ if (draft.trim()) assign(draft.trim()); }}
              disabled={!draft.trim()}
              style={{ padding:"6px 12px", background:T.blue+"22", border:"1px solid "+T.blue, borderRadius:8, color:T.blue, fontSize:11, cursor:draft.trim()?"pointer":"not-allowed", fontFamily:"inherit", fontWeight:600 }}>
              Set
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function WorldView({ personas, setPersonas: setPersonasLocal, selectedIds, setSelectedIds, rounds, setRounds, onEdit, onDelete, onNavigate }) {
  const [expandedId, setExpandedId] = useState(null);
  const [showSim, setShowSim] = useState(false);
  const groups = useMemo(function() {
    const g = {};
    personas.forEach(function(p) {
      const k = p.group || "Ungrouped";
      if (!g[k]) g[k] = [];
      g[k].push(p);
    });
    return g;
  }, [personas]);

  const polCounts = useMemo(function() {
    const c = {};
    personas.forEach(function(p) { c[p.political] = (c[p.political]||0) + 1; });
    return c;
  }, [personas]);

  if (!personas.length) {
    return (
      <div style={{ textAlign:"center", padding:"60px 20px", animation:"fadeIn 0.4s ease both" }}>
        <div style={{ fontSize:52, marginBottom:16, animation:"floatAnim 3s ease-in-out infinite" }}>🌍</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:700, color:T.txt0, marginBottom:8 }}>Your world awaits</div>
        <div style={{ fontSize:13, color:T.txt1, marginBottom:28, lineHeight:1.7, maxWidth:260, margin:"0 auto 28px" }}>Start by generating a population from any country, or add individual personas from the curated library.</div>
        <button onClick={function(){ if(onNavigate) onNavigate("library"); }} style={{ padding:"12px 28px", background:"linear-gradient(135deg," + T.blue + "20," + T.blue + "0c)", border:"1px solid " + T.blue + "66", borderRadius:99, color:T.blue, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", boxShadow:"0 0 20px " + T.blue + "18" }}>Explore Library →</button>
      </div>
    );
  }

  const politicalColors = { "Far-left":T.purple, "Left":T.blue, "Center-left":"#60a5fa", "Center":T.txt1, "Center-right":"#fb923c", "Right":T.orange, "Far-right":T.red, "Nationalist / Populist":T.red, "Religious Conservative":"#f59e0b" };

  return (
    <div>
      <Card style={{ marginBottom:12 }} glow>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <Label>{personas.length} agents · {Object.keys(groups).length} groups</Label>
          <button onClick={function(){ setShowSim(!showSim); }} style={{ padding:"7px 16px", background:showSim ? "linear-gradient(135deg,"+T.blue+"30,"+T.blue+"15)" : "linear-gradient(135deg,"+T.blue+"20,"+T.blue+"0c)", border:"1px solid " + T.blue + (showSim?"99":"66"), borderRadius:99, color:T.blue, fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, cursor:"pointer", letterSpacing:"0.03em", boxShadow:"0 0 12px " + T.blue + "20" }}>
            {showSim ? "▲ Hide Simulation" : "▶ Run Scenario" + (selectedIds && selectedIds.length > 0 ? " · " + selectedIds.length + " agents" : "")}
          </button>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {Object.entries(polCounts).map(function(entry) {
            const pol = entry[0]; const cnt = entry[1];
            const c = politicalColors[pol] || T.txt2;
            return (
              <span key={pol} style={{ fontSize:10, background:c+"18", color:c, padding:"2px 8px", borderRadius:99, border:"1px solid " + c + "33" }}>
                {pol} ({cnt})
              </span>
            );
          })}
        </div>
      </Card>

      {/* Simulation panel — collapsible, embedded directly in World view */}
      {showSim && rounds !== undefined && (
        <div style={{ marginBottom:14 }}>
          <SimulateView
            personas={personas}
            setPersonas={setPersonasLocal}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            rounds={rounds}
            setRounds={setRounds}
          />
        </div>
      )}

      {Object.entries(groups).map(function(entry) {
        const gName = entry[0]; const members = entry[1];
        return (
          <div key={gName} style={{ marginBottom:14 }}>
            <GroupHeader gName={gName} count={members.length} personas={personas} onRenameGroup={function(oldName, newName) {
              const trimmed = newName.trim();
              if (!trimmed || trimmed === oldName) return;
              const updated = personas.map(function(p) { return p.group === oldName ? Object.assign({}, p, { group: trimmed }) : p; });
              setPersonasLocal(updated);
            }} />
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {members.map(function(p) {
                const isExp = expandedId === p.id;
                return (
                  <div key={p.id} style={{ background:T.bg1, border:"1px solid " + (isExp ? p.color + "66" : T.border), borderRadius:10, overflow:"hidden", transition:"border-color 0.2s" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px" }}>
                      {/* Avatar — tap to expand */}
                      <div onClick={function(){ setExpandedId(isExp ? null : p.id); }} style={{ cursor:"pointer", flexShrink:0 }}>
                        <PersonaAvatar persona={p} size={40} active={isExp} />
                      </div>
                      {/* Info — tap to expand */}
                      <div style={{ flex:1, minWidth:0, cursor:"pointer" }} onClick={function(){ setExpandedId(isExp ? null : p.id); }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                          <span style={{ fontSize:13, fontWeight:600, color:T.txt0, fontFamily:"'DM Sans',sans-serif" }}>{p.name}</span>
                          <span style={{ fontSize:11, color:T.txt2 }}>{p.age}y · {p.country}</span>
                        </div>
                        <div style={{ fontSize:11, color:T.txt1, marginTop:1 }}>{p.occupation || p.occupationCategory} · {p.political}</div>
                        {/* Status badges — group + sim */}
                        <div style={{ display:"flex", gap:4, marginTop:5, flexWrap:"wrap" }}>
                          {p.group
                            ? <span style={{ fontSize:9, padding:"2px 7px", background:T.blue+"18", border:"1px solid "+T.blue+"44", borderRadius:99, color:T.blue }}>⬡ {p.group}</span>
                            : <span style={{ fontSize:9, padding:"2px 7px", background:T.bg0, border:"1px solid "+T.border, borderRadius:99, color:T.txt2 }}>No group</span>
                          }
                          {selectedIds && selectedIds.includes(p.id)
                            ? <span style={{ fontSize:9, padding:"2px 7px", background:T.green+"18", border:"1px solid "+T.green+"44", borderRadius:99, color:T.green }}>▶ In simulation</span>
                            : <span style={{ fontSize:9, padding:"2px 7px", background:T.bg0, border:"1px solid "+T.border, borderRadius:99, color:T.txt2 }}>Not simulated</span>
                          }
                        </div>
                      </div>
                      {/* Action buttons — always visible, no expand needed */}
                      <div style={{ display:"flex", flexDirection:"column", gap:4, flexShrink:0 }}>
                        {/* Simulation toggle */}
                        {selectedIds && setSelectedIds && (
                          <button
                            onClick={function(e){ e.stopPropagation(); setSelectedIds(function(prev){ return prev.includes(p.id) ? prev.filter(function(x){ return x!==p.id; }) : prev.concat([p.id]); }); }}
                            title={selectedIds.includes(p.id) ? "Remove from simulation" : "Add to simulation"}
                            style={{ padding:"4px 8px", background:selectedIds.includes(p.id) ? T.green+"18" : T.bg0, border:"1px solid "+(selectedIds.includes(p.id) ? T.green : T.border), borderRadius:7, cursor:"pointer", fontFamily:"inherit", fontSize:10, color:selectedIds.includes(p.id) ? T.green : T.txt2, whiteSpace:"nowrap" }}>
                            {selectedIds.includes(p.id) ? "▶ ✓" : "▶ +"}
                          </button>
                        )}
                        {/* Expand toggle */}
                        <button onClick={function(){ setExpandedId(isExp ? null : p.id); }}
                          style={{ padding:"4px 8px", background:isExp ? T.bg0 : "none", border:"1px solid "+(isExp ? T.border : "transparent"), borderRadius:7, cursor:"pointer", color:T.txt2, fontSize:10, fontFamily:"inherit" }}>
                          {isExp ? "▲" : "▼"}
                        </button>
                      </div>
                    </div>
                    {isExp && (
                      <div style={{ padding:"0 12px 12px", borderTop:"1px solid " + T.border }}>
                        {p.backstory && (
                          <div style={{ fontSize:11, color:T.txt1, fontStyle:"italic", lineHeight:1.7, margin:"10px 0", borderLeft:"2px solid " + p.color + "55", paddingLeft:8 }}>
                            "{p.backstory}"
                          </div>
                        )}
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5, marginBottom:10 }}>
                          {[["Religion", p.religion], ["Ethnicity", p.ethnicity], ["Education", p.education], ["Income", p.income], ["Media", (p.mediaHabits||[]).join(", ")], ["Values", (p.values||[]).slice(0,3).join(", ")]].map(function(item) {
                            if (!item[1]) return null;
                            return (
                              <div key={item[0]} style={{ background:T.bg0, borderRadius:6, padding:"5px 8px" }}>
                                <div style={{ fontSize:9, color:T.txt2 }}>{item[0]}</div>
                                <div style={{ fontSize:10, color:T.txt1, marginTop:1 }}>{item[1]}</div>
                              </div>
                            );
                          })}
                        </div>
                        {/* Group management */}
                        <GroupEditSection persona={p} personas={personas} setPersonas={setPersonasLocal} />
                        {/* Link to another persona */}
                        <div style={{ marginBottom:8 }}>
                          <div style={{ fontSize:9, color:T.txt2, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Link to persona</div>
                          <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                            {personas.filter(function(x){ return x.id !== p.id; }).slice(0, 8).map(function(other) {
                              const existing = (p.relations||[]).find(function(r){ return r.to === other.id; });
                              return (
                                <button key={other.id} onClick={function(){
                                  const newRel = existing
                                    ? (p.relations||[]).filter(function(r){ return r.to !== other.id; })
                                    : (p.relations||[]).concat([{ to: other.id, type: "colleague" }]);
                                  setPersonasLocal(personas.map(function(x){ return x.id === p.id ? Object.assign({}, x, { relations: newRel }) : x; }));
                                }} style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 8px", background:existing ? T.green+"18" : T.bg0, border:"1px solid " + (existing ? T.green : T.border), borderRadius:99, fontSize:9, color:existing ? T.green : T.txt2, cursor:"pointer", fontFamily:"inherit" }}>
                                  <span>{other.emoji}</span>
                                  <span>{other.name.split(" ")[0]}</span>
                                  {existing && <span>({existing.type})</span>}
                                </button>
                              );
                            })}
                          </div>
                          {(p.relations||[]).length > 0 && (
                            <div style={{ marginTop:4, fontSize:9, color:T.txt2 }}>
                              Linked: {(p.relations||[]).map(function(r){ const o = personas.find(function(x){ return x.id===r.to; }); return o ? o.name.split(" ")[0]+"("+r.type+")" : ""; }).filter(Boolean).join(", ")}
                            </div>
                          )}
                        </div>
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={function(){ onEdit(p); }} style={{ flex:1, padding:"8px", background:T.bg0, border:"1px solid " + T.border, borderRadius:8, color:T.txt1, fontSize:11, fontFamily:"inherit", cursor:"pointer" }}>✎ Edit</button>
                          <button onClick={function(){ onDelete(p.id); }} style={{ padding:"8px 12px", background:T.red + "10", border:"1px solid " + T.red + "44", borderRadius:8, color:T.red, fontSize:11, fontFamily:"inherit", cursor:"pointer" }}>Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── PERSONA LIST CARD (top-level — not nested) ───────────────────────────────
const moodColor = function(v) { return v > 0.6 ? T.green : v > 0.4 ? T.amber : T.red; };

function PersonaListCard({ p, col, isAdded, onAdd, selectable, isSelected, onToggle }) {
  const [exp, setExp] = useState(false);
  return (
    <div style={{ background:T.bg1, border:"1px solid " + (isSelected ? T.blue : isAdded ? T.green + "55" : T.border), borderRadius:10, overflow:"hidden", transition:"border-color 0.15s" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px" }}>
        {selectable && (
          <div onClick={function(){ onToggle(p.id); }} style={{ width:18, height:18, borderRadius:4, border:"2px solid " + (isSelected ? T.blue : T.border), background:isSelected?T.blue + "22":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:11, color:T.blue, cursor:"pointer" }}>
            {isSelected ? "✓" : ""}
          </div>
        )}
        {/* Avatar — tap to expand */}
        <div onClick={function(){ if (!selectable) setExp(!exp); }} style={{ width:38, height:38, borderRadius:"50%", background:col+"18", border:"2px solid " + col + "66", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0, cursor:selectable?"default":"pointer" }}>
          {p.emoji || "👤"}
        </div>
        {/* Info — tap to expand */}
        <div style={{ flex:1, minWidth:0, cursor:selectable?"default":"pointer" }} onClick={function(){ if (!selectable) setExp(!exp); }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
            <span style={{ fontSize:13, fontWeight:600, color:T.txt0 }}>{p.name}</span>
            <span style={{ fontSize:10, color:T.txt2 }}>{p.age}y · {p.country}</span>
          </div>
          <div style={{ fontSize:11, color:T.txt1, marginTop:1 }}>{p.occupation || p.occupationCategory} · {p.political}</div>
          <div style={{ fontSize:10, color:T.txt2, marginTop:1 }}>{p.income}{p.cityType ? " · " + p.cityType : ""}</div>
        </div>
        {/* Right side actions */}
        <div style={{ display:"flex", flexDirection:"column", gap:4, flexShrink:0, alignItems:"flex-end" }}>
          {!selectable && onAdd && (
            isAdded
              ? <span style={{ fontSize:10, padding:"3px 8px", background:T.green+"18", border:"1px solid "+T.green+"44", borderRadius:6, color:T.green }}>✓ Added</span>
              : <button onClick={function(e){ e.stopPropagation(); onAdd(); }} style={{ fontSize:10, padding:"3px 8px", background:T.blue+"18", border:"1px solid "+T.blue+"44", borderRadius:6, color:T.blue, cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>+ Add</button>
          )}
          {!selectable && <span style={{ color:T.txt2, fontSize:9, cursor:"pointer" }} onClick={function(){ setExp(!exp); }}>{exp ? "▲" : "▼"}</span>}
        </div>
      </div>
      {exp && !selectable && (
        <div style={{ padding:"0 12px 12px", borderTop:"1px solid " + T.border }}>
          {p.backstory && (
            <div style={{ fontSize:11, color:T.txt1, fontStyle:"italic", lineHeight:1.6, margin:"10px 0 8px", borderLeft:"2px solid " + col + "55", paddingLeft:8 }}>
              "{p.backstory}"
            </div>
          )}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5, marginBottom:8 }}>
            {[["Religion", p.religion], ["Ethnicity", p.ethnicity], ["Education", p.education], ["Language", p.language], ["Settlement", p.cityType], ["Employment", p.employmentStatus]].map(function(item) {
              if (!item[1]) return null;
              return (
                <div key={item[0]} style={{ background:T.bg0, borderRadius:6, padding:"5px 7px" }}>
                  <div style={{ fontSize:9, color:T.txt2 }}>{item[0]}</div>
                  <div style={{ fontSize:10, color:T.txt1, marginTop:1 }}>{item[1]}</div>
                </div>
              );
            })}
          </div>
          {(p.values || []).length > 0 && (
            <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:8 }}>
              {p.values.slice(0,5).map(function(v) {
                return <span key={v} style={{ fontSize:9, background:col+"18", color:col, padding:"2px 6px", borderRadius:99 }}>{v}</span>;
              })}
            </div>
          )}
          <div style={{ display:"flex", gap:5, marginTop:8 }}>
            {[["M", p.mood, moodColor(p.mood)], ["S", p.stress, T.red], ["T", p.trust, T.blue], ["E", p.economicAnxiety, T.amber]].map(function(item) {
              return (
                <div key={item[0]} style={{ flex:1, textAlign:"center" }}>
                  <div style={{ height:3, background:T.bg0, borderRadius:2, marginBottom:2 }}>
                    <div style={{ height:"100%", width:(item[1]*100)+"%", background:item[2], borderRadius:2 }} />
                  </div>
                  <div style={{ fontSize:9, color:T.txt2 }}>{item[0]} {Math.round(item[1]*100)}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {!selectable && (
        <div style={{ padding:"0 12px 10px" }}>
          <button onClick={function(){ if (!isAdded) onAdd(p); }} style={{ width:"100%", padding:"7px", background:isAdded?T.green + "14":T.bg0, border:"1px solid " + (isAdded ? T.green : T.blue) + "55", borderRadius:7, color:isAdded?T.green:T.blue, fontSize:11, fontFamily:"inherit", cursor:isAdded?"default":"pointer", fontWeight:500 }}>
            {isAdded ? "✓ In World" : "+ Add to Simulation"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── LIBRARY VIEW ─────────────────────────────────────────────────────────────
function LibraryView({ onAddPersonas, existingPersonas, onNavigate }) {
  const [libTab, setLibTab] = useState("generate");
  const [genCountry, setGenCountry] = useState("United States");
  const [genBatchSize, setGenBatchSize] = useState(20);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState(null);
  const [genProgress, setGenProgress] = useState({ done:0, total:0 });
  const [genGroupMode, setGenGroupMode] = useState(false);
  const [genGroupType, setGenGroupType] = useState("none");
  const [genGroupName, setGenGroupName] = useState("");
  // Auto-update group name when country changes and geo group is active
  useEffect(function() {
    if (!genGroupMode) return;
    const geoTypes = {country:" Population",region:" Region",city:" City",town:" Town",village:" Village"};
    if (geoTypes[genGroupType]) setGenGroupName(genCountry + geoTypes[genGroupType]);
  }, [genCountry]);
  const [countryCache, setCountryCache] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedForAdd, setSelectedForAdd] = useState(new Set());
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("All");
  const [filterPolitical, setFilterPolitical] = useState("All");
  const [filterIncome, setFilterIncome] = useState("All");
  const [filterAge, setFilterAge] = useState("All");
  const [gbType, setGbType] = useState("family");
  const [gbCountry, setGbCountry] = useState("United States");
  const [gbSubregion, setGbSubregion] = useState("");
  const [gbDesc, setGbDesc] = useState("");
  const [gbPopulation, setGbPopulation] = useState(4);
  const [gbCustomPop, setGbCustomPop] = useState(false);
  const [gbProgress, setGbProgress] = useState({ done:0, total:0 });
  const [gbLoading, setGbLoading] = useState(false);
  const [gbError, setGbError] = useState(null);
  const [gbSuccess, setGbSuccess] = useState("");

  const addedNames = useMemo(function() { return new Set(existingPersonas.map(function(p){ return p.name; })); }, [existingPersonas]);
  const cd = COUNTRY_CENSUS[genCountry] || {};
  const cachedForCountry = countryCache[genCountry] || [];

  const generateBatch = async function(country, size, isMore) {
    setGenLoading(true); setGenError(null);
    const existing = countryCache[country] || [];
    const existingNames = [...addedNames, ...existing.map(function(p){ return p.name; })];
    setGenProgress({ done:0, total:size, status:"Starting..." });
    try {
      // Always use sub-batches of 5 regardless of user choice.
      // ApiQueue enforces 4s gap between calls — rate limits become impossible.
      const SUB_BATCH = 5;
      const batches = Math.ceil(size / SUB_BATCH);
      let allNew = [];

      for (let b = 0; b < batches; b++) {
        const thisBatch = Math.min(SUB_BATCH, size - b * SUB_BATCH);
        const done = b * SUB_BATCH;
        const pct = Math.round((done / size) * 100);
        setGenProgress({
          done: done,
          total: size,
          status: "Generating personas " + (done+1) + "–" + Math.min(done+thisBatch, size) + " of " + size + "..."
        });

        const chunk = await aiGenerateCountryBatch(
          country,
          thisBatch,
          [...existingNames, ...allNew.map(function(p){ return p.name; })],
          isMore ? existing.length + allNew.length : done
        );
        allNew = allNew.concat(chunk);

        // Show results progressively — update cache after each sub-batch
        // sanitisePersona filters blanks, clamps values, ensures all fields present
        const withMetaSoFar = allNew.map(function(p, i) {
          return sanitisePersona(Object.assign({}, p, {
            id: uid(),
            color: PERSONA_COLORS[(existing.length+i) % PERSONA_COLORS.length],
            group: "", relations: [],
          }));
        }).filter(Boolean);
        setCountryCache(function(prev) {
          return Object.assign({}, prev, { [country]: isMore ? existing.concat(withMetaSoFar) : withMetaSoFar });
        });
        setSelectedCountry(country);
      }

      setGenProgress({ done:size, total:size, status:"Done! " + allNew.length + " personas generated." });
      setSelectedForAdd(new Set());
    } catch(e) {
      setGenError(e.message || "Generation failed");
    }
    setGenLoading(false);
  };

  const applyGroup = function(p) {
    return genGroupMode && genGroupName.trim()
      ? Object.assign({}, p, { id:uid(), color:nextColor(existingPersonas), group:genGroupName.trim() })
      : Object.assign({}, p, { id:uid(), color:nextColor(existingPersonas) });
  };

  const addSelected = function() {
    const toAdd = (countryCache[selectedCountry] || []).filter(function(p){ return selectedForAdd.has(p.id) && !addedNames.has(p.name); }).map(applyGroup);
    if (toAdd.length) { onAddPersonas(toAdd); setSelectedForAdd(new Set()); }
  };

  const addAllFromCountry = function() {
    const toAdd = (countryCache[selectedCountry] || []).filter(function(p){ return !addedNames.has(p.name); }).map(applyGroup);
    if (toAdd.length) onAddPersonas(toAdd);
  };

  const toggleSelect = function(id) {
    setSelectedForAdd(function(prev) {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const buildGroup = async function() {
    if (gbLoading) return;
    setGbLoading(true); setGbError(null); setGbSuccess(""); setGbProgress({ done:0, total:0 });
    try {
      const locationDesc = (gbSubregion ? gbSubregion + ", " : "") + (gbDesc || "");
      const k = archetypeCount(gbPopulation);
      setGbProgress({ done:0, total:k });
      setGbSuccess("");
      const group = await aiGenerateGroup(gbType, gbCountry, locationDesc, existingPersonas, gbPopulation);
      if (!group || !group.length) throw new Error("No personas were generated. Please try again.");
      onAddPersonas(group);
      const popNote = gbPopulation > 1
        ? " · each represents ~" + (gbPopulation > 999
            ? (gbPopulation / group.length / 1000).toFixed(1) + "K"
            : Math.round(gbPopulation / group.length)) + " people"
        : "";
      setGbSuccess("✓ " + group.length + " personas added" + popNote);
      setGbDesc(""); setGbSubregion("");
      // Navigate to World tab so user sees the personas immediately
      setTimeout(function() { if (onNavigate) onNavigate("world"); }, 1200);
    } catch(e) { setGbError(e.message || "Generation failed. Please try again."); }
    setGbLoading(false);
  };

  const filtered = useMemo(function() {
    return LIBRARY_PERSONAS.filter(function(p) {
      if (filterCountry !== "All" && p.country !== filterCountry) return false;
      if (filterPolitical !== "All" && p.political !== filterPolitical) return false;
      if (filterIncome !== "All" && p.income !== filterIncome) return false;
      if (filterAge !== "All") {
        const age = p.age || 0;
        if (filterAge === "Under 25" && age >= 25) return false;
        if (filterAge === "25-40" && (age < 25 || age > 40)) return false;
        if (filterAge === "40-60" && (age < 40 || age > 60)) return false;
        if (filterAge === "60+" && age < 60) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const s = [p.name, p.country, p.occupation, p.income, p.political, p.backstory].concat(p.values||[]).join(" ").toLowerCase();
        if (!s.includes(q)) return false;
      }
      return true;
    });
  }, [filterCountry, filterPolitical, filterIncome, filterAge, search]);

  return (
    <div>
      <div style={{ display:"flex", gap:0, marginBottom:14, background:T.bg1, borderRadius:10, padding:4, border:"1px solid " + T.border }}>
        {[["generate","🌍 Generator"], ["browse","👥 Personas"]].map(function(item) {
          return (
            <button key={item[0]} onClick={function(){ setLibTab(item[0]); }} style={{ flex:1, padding:"8px", background:libTab===item[0]?T.blue + "22":"transparent", border:"1px solid " + (libTab===item[0]?T.blue:"transparent"), borderRadius:7, cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:libTab===item[0]?600:400, color:libTab===item[0]?T.blue:T.txt1, transition:"all 0.15s" }}>
              {item[1]}
            </button>
          );
        })}
      </div>

      {libTab === "generate" && (
        <div>
          <Card style={{ marginBottom:12, border:"1px solid " + T.blue + "33" }}>
            <Label color={T.blue}>AI Country Population Generator</Label>
            <p style={{ fontSize:12, color:T.txt1, marginBottom:12, lineHeight:1.6 }}>Generate census-accurate personas for any of 195 countries, weighted to real demographics.</p>
            <SelectField label="Country" value={genCountry} onChange={function(v){ setGenCountry(v); setGenError(null); }} options={COUNTRIES} />
            {cd.pop && (
              <div style={{ background:T.bg0, borderRadius:8, padding:"10px 12px", marginBottom:12, border:"1px solid " + T.border }}>
                <div style={{ fontSize:10, color:T.blue, fontWeight:600, marginBottom:6, textTransform:"uppercase" }}>Census — {genCountry}</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginBottom:8 }}>
                  {[["Population", cd.pop + "M"], ["Median Age", cd.medAge + "y"], ["Urban", cd.urban + "%"], ["Gini", cd.gini], ["GDP/cap", "$" + Math.round(cd.gdpPPP/1000) + "k"], ["Cached", cachedForCountry.length + " personas"]].map(function(item) {
                    return (
                      <div key={item[0]} style={{ background:T.bg1, borderRadius:6, padding:"5px 8px", textAlign:"center" }}>
                        <div style={{ fontSize:13, fontWeight:700, color:T.txt0 }}>{item[1]}</div>
                        <div style={{ fontSize:9, color:T.txt2, marginTop:1 }}>{item[0]}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize:10, color:T.txt2 }}><strong style={{ color:T.txt1 }}>Religions:</strong> {cd.religions}</div>
                <div style={{ fontSize:10, color:T.txt2 }}><strong style={{ color:T.txt1 }}>Key issues:</strong> {cd.keyIssues}</div>
              </div>
            )}
            <div style={{ marginBottom:12 }}>
              <Label>Batch size</Label>
              <div style={{ display:"flex", gap:6 }}>
                {[10, 20, 30, 50].map(function(n) {
                  return <ToggleBtn key={n} active={genBatchSize===n} onClick={function(){ setGenBatchSize(n); }} small>{n}</ToggleBtn>;
                })}
              </div>
            </div>
            {/* Group assignment — always visible */}
            <div style={{ marginBottom:12, padding:"10px 12px", background:T.bg0, borderRadius:10, border:"1px solid " + T.border }}>
              <div style={{ fontSize:11, fontWeight:600, color:T.txt0, marginBottom:10 }}>
                Group assignment
                {genGroupMode && <span style={{ fontSize:10, fontWeight:400, color:T.green, marginLeft:8 }}>● Active — personas will be grouped</span>}
                {!genGroupMode && <span style={{ fontSize:10, fontWeight:400, color:T.txt2, marginLeft:8 }}>Off — tap a type to assign</span>}
              </div>

              <div style={{ fontSize:9, color:T.txt2, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:5 }}>Geographic</div>
              <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:8 }}>
                {[["none","✕ None"],["country","🌍 Country"],["region","🗺️ Region"],["city","🌆 City"],["town","🏙️ Town"],["village","🌾 Village"]].map(function(item){
                  return (
                    <ToggleBtn key={item[0]} active={genGroupType===item[0]} onClick={function(){
                      setGenGroupType(item[0]);
                      const auto = {country:genCountry+" Population",region:genCountry+" Region",city:genCountry+" City",town:genCountry+" Town",village:genCountry+" Village"};
                      setGenGroupName(auto[item[0]] || "");
                      setGenGroupMode(item[0] !== "none");
                    }} small>{item[1]}</ToggleBtn>
                  );
                })}
              </div>

              <div style={{ fontSize:9, color:T.txt2, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:5 }}>Social</div>
              <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:genGroupMode ? 8 : 0 }}>
                {[["family","👨‍👩‍👧‍👦 Family"],["friends","👥 Friends"],["workplace","💼 Workplace"],["community","🏘️ Community"]].map(function(item){
                  return (
                    <ToggleBtn key={item[0]} active={genGroupType===item[0]} onClick={function(){
                      setGenGroupType(item[0]);
                      setGenGroupName(genCountry+" "+item[0].charAt(0).toUpperCase()+item[0].slice(1));
                      setGenGroupMode(true);
                    }} small>{item[1]}</ToggleBtn>
                  );
                })}
              </div>

              {genGroupMode && (
                <input value={genGroupName} onChange={function(e){ setGenGroupName(e.target.value); }}
                  placeholder="Group name..." style={Object.assign({}, inputStyle, { fontSize:12, padding:"7px 10px" })} />
              )}
            </div>

            {genError && (
              <div style={{ fontSize:12, color:T.red, padding:"12px 14px", background:T.red + "10", borderRadius:8, marginBottom:10, border:"1px solid " + T.red + "33", lineHeight:1.6 }}>
                <div style={{ fontWeight:600, marginBottom:4 }}>Generation failed</div>
                <div style={{ fontSize:11, color:"#f87171cc" }}>{genError}</div>
                <div style={{ fontSize:10, color:T.amber, marginTop:8, lineHeight:1.7 }}>
                  {genError.includes("truncat") || genError.includes("JSON") || genError.includes("parse")
                    ? "The response was cut off. Use batch size 10 for most reliable results."
                    : genError.includes("Rate limit") || genError.includes("exceeded")
                    ? "Rate limit hit. The app will auto-retry. If it persists, wait 5 minutes or use batch size 10."
                    : "Try again with a smaller batch size (10)."}
                </div>
              </div>
            )}
            {genLoading && (
              <div style={{ background:T.bg0, borderRadius:8, padding:"12px 14px", marginBottom:10 }}>
                <div style={{ fontSize:11, color:T.blue, fontWeight:600, marginBottom:8 }}>
                  {genProgress.status || ("Generating " + genCountry + " personas...")}
                </div>
                <div style={{ height:5, background:T.border, borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:3, background:"linear-gradient(90deg," + T.blue + "," + T.purple + ")", width:(genProgress.total > 0 ? Math.max(4, (genProgress.done/genProgress.total)*100) : 8) + "%", transition:"width 0.6s ease" }} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:T.txt2, marginTop:4 }}>
                  <span>{genProgress.done} / {genProgress.total} personas</span>
                  <span style={{ color:T.txt2 }}>Pacing automatically to avoid rate limits</span>
                </div>
              </div>
            )}
            <div style={{ display:"grid", gridTemplateColumns:cachedForCountry.length > 0 ? "1fr 1fr" : "1fr", gap:8 }}>
              <PrimaryBtn onClick={function(){ generateBatch(genCountry, genBatchSize, false); }} disabled={genLoading} loading={genLoading}>
                {cachedForCountry.length > 0 ? "Regenerate" : "Generate"}
              </PrimaryBtn>
              {cachedForCountry.length > 0 && (
                <PrimaryBtn onClick={function(){ generateBatch(genCountry, genBatchSize, true); }} disabled={genLoading} color={T.purple}>
                  + Add More
                </PrimaryBtn>
              )}
            </div>
          </Card>

          {Object.keys(countryCache).length > 0 && selectedCountry && countryCache[selectedCountry] && (
            <div>
              {Object.keys(countryCache).length > 1 && (
                <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
                  {Object.keys(countryCache).map(function(c) {
                    return (
                      <button key={c} onClick={function(){ setSelectedCountry(c); }} style={{ padding:"4px 10px", background:selectedCountry===c?T.blue + "22":T.bg2, border:"1px solid " + (selectedCountry===c?T.blue:T.border), borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontSize:11, color:selectedCountry===c?T.blue:T.txt1 }}>
                        {c} ({countryCache[c].length})
                      </button>
                    );
                  })}
                </div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div style={{ fontSize:12, color:T.txt0, fontWeight:600 }}>{selectedCountry} — {countryCache[selectedCountry].length} personas</div>
                <div style={{ display:"flex", gap:6 }}>
                  <button onClick={function(){ setSelectedForAdd(function(prev){ return prev.size===countryCache[selectedCountry].length ? new Set() : new Set(countryCache[selectedCountry].map(function(p){ return p.id; })); }); }} style={{ padding:"5px 10px", background:T.bg2, border:"1px solid " + T.border, borderRadius:7, cursor:"pointer", fontFamily:"inherit", fontSize:11, color:T.txt1 }}>
                    {selectedForAdd.size === countryCache[selectedCountry].length ? "Deselect All" : "Select All"}
                  </button>
                  {selectedForAdd.size > 0 && (
                    <button onClick={addSelected} style={{ padding:"5px 12px", background:T.blue + "14", border:"1px solid " + T.blue, borderRadius:7, cursor:"pointer", fontFamily:"inherit", fontSize:11, color:T.blue, fontWeight:600 }}>
                      + Add {selectedForAdd.size}
                    </button>
                  )}
                  <button onClick={addAllFromCountry} style={{ padding:"5px 12px", background:T.green + "14", border:"1px solid " + T.green, borderRadius:7, cursor:"pointer", fontFamily:"inherit", fontSize:11, color:T.green, fontWeight:600 }}>
                    + All ({(countryCache[selectedCountry] || []).filter(function(p){ return !addedNames.has(p.name); }).length})
                  </button>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {countryCache[selectedCountry].map(function(p, i) {
                  return (
                    <PersonaListCard key={p.id} p={p} col={p.color || PERSONA_COLORS[i % PERSONA_COLORS.length]}
                      isAdded={addedNames.has(p.name)} selectable={true} isSelected={selectedForAdd.has(p.id)}
                      onToggle={toggleSelect}
                      onAdd={function(){ onAddPersonas([applyGroup(p)]); }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {!genLoading && Object.keys(countryCache).length === 0 && (
            <div style={{ textAlign:"center", padding:"40px 20px", color:T.txt2, fontSize:12, lineHeight:2 }}>
              <div style={{ fontSize:32, marginBottom:10 }}>🌍</div>
              <div style={{ color:T.txt1, fontWeight:600, fontSize:13 }}>Select a country and generate</div>
              <div>Census-weighted · All 195 countries · Up to 200 personas</div>
            </div>
          )}
        </div>
      )}

      {libTab === "browse" && (
        <div>
          <Card style={{ marginBottom:12 }}>
            <Label>Persona Library — {LIBRARY_PERSONAS.length} personas</Label>
            <input value={search} onChange={function(e){ setSearch(e.target.value); }} placeholder="Search name, country, occupation, income, values..." style={Object.assign({}, inputStyle, { marginBottom:8 })} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:6 }}>
              <select value={filterCountry} onChange={function(e){ setFilterCountry(e.target.value); }} style={Object.assign({}, inputStyle, { padding:"7px 10px", fontSize:11 })}>
                <option value="All">All countries</option>
                {Object.keys(RAW_LIBRARY).sort().map(function(c){ return <option key={c} value={c}>{c}</option>; })}
              </select>
              <select value={filterPolitical} onChange={function(e){ setFilterPolitical(e.target.value); }} style={Object.assign({}, inputStyle, { padding:"7px 10px", fontSize:11 })}>
                <option value="All">All politics</option>
                {POL_OPTS.map(function(p){ return <option key={p} value={p}>{p}</option>; })}
              </select>
              <select value={filterIncome} onChange={function(e){ setFilterIncome(e.target.value); }} style={Object.assign({}, inputStyle, { padding:"7px 10px", fontSize:11 })}>
                <option value="All">All income levels</option>
                {INCOMES.map(function(v){ return <option key={v} value={v}>{v}</option>; })}
              </select>
              <select value={filterAge} onChange={function(e){ setFilterAge(e.target.value); }} style={Object.assign({}, inputStyle, { padding:"7px 10px", fontSize:11 })}>
                {["All","Under 25","25-40","40-60","60+"].map(function(v){ return <option key={v} value={v}>{v === "All" ? "All ages" : v}</option>; })}
              </select>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:11, color:T.txt2 }}>{filtered.length} personas</span>
              {(filterCountry !== "All" || filterPolitical !== "All" || filterIncome !== "All" || filterAge !== "All" || search) && (
                <button onClick={function(){ setFilterCountry("All"); setFilterPolitical("All"); setFilterIncome("All"); setFilterAge("All"); setSearch(""); }}
                  style={{ fontSize:10, color:T.blue, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>
                  Clear filters
                </button>
              )}
            </div>
          </Card>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {filtered.map(function(p, i) {
              return (
                <PersonaListCard key={i} p={p} col={PERSONA_COLORS[i % PERSONA_COLORS.length]}
                  isAdded={addedNames.has(p.name)} selectable={false}
                  onAdd={function(){ onAddPersonas([Object.assign({}, p, { id:uid(), color:nextColor(existingPersonas), relations:[] })]); }}
                />
              );
            })}
          </div>
        </div>
      )}


    </div>
  );
}

// ─── NETWORK GRAPH ────────────────────────────────────────────────────────────
function NetworkGraph({ personas, activeIds }) {
  const W = 560; const H = 280;
  if (!personas || !personas.length) return null;
  const laid = computeLayout(personas);
  const edges = [];
  personas.forEach(function(p) {
    (p.relations || []).forEach(function(r) {
      if (p.id < r.to) edges.push({ from:p.id, to:r.to, type:r.type });
    });
  });
  return (
    <svg width="100%" viewBox={"0 0 " + W + " " + H} style={{ display:"block" }}>
      <defs>
        {laid.map(function(p) {
          return (
            <radialGradient key={p.id} id={"glow_" + p.id}>
              <stop offset="0%" stopColor={p.color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={p.color} stopOpacity="0" />
            </radialGradient>
          );
        })}
      </defs>
      {edges.map(function(e) {
        const a = laid.find(function(p){ return p.id===e.from; });
        const b = laid.find(function(p){ return p.id===e.to; });
        if (!a || !b) return null;
        return (
          <line key={e.from + "-" + e.to} x1={a.gx*W} y1={a.gy*H} x2={b.gx*W} y2={b.gy*H} stroke={T.border} strokeWidth={1} strokeDasharray="3,3" opacity={0.5} />
        );
      })}
      {laid.map(function(p) {
        const isActive = activeIds && activeIds.includes(p.id);
        return (
          <g key={p.id} transform={"translate(" + (p.gx*W) + "," + (p.gy*H) + ")"}>
            {isActive && <circle r={22} fill={"url(#glow_" + p.id + ")"} />}
            <circle r={14} fill={p.color + "22"} stroke={p.color} strokeWidth={isActive ? 2.5 : 1.5} />
            <text textAnchor="middle" dominantBaseline="central" fontSize={11}>{p.emoji}</text>
            <text y={22} textAnchor="middle" fontSize={7} fill={T.txt2}>{p.name.split(" ")[0]}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── RESPONSE CARD ────────────────────────────────────────────────────────────
const SECTION_LABELS = ["IMMEDIATE REACTION", "MY INTERPRETATION", "WHAT I WILL DO", "EFFECT ON MY STATE"];
const SECTION_COLORS = { "IMMEDIATE REACTION":T.red, "MY INTERPRETATION":T.blue, "WHAT I WILL DO":T.green, "EFFECT ON MY STATE":T.amber };
const EMOTION_COLORS = { anxious:T.amber, angry:T.red, fearful:T.red, sad:T.txt2, hopeful:T.green, energized:T.green, relieved:T.green, conflicted:T.purple, determined:T.blue, resigned:T.txt1 };

function parseNarrative(text) {
  const sections = [];
  let remaining = text;
  SECTION_LABELS.forEach(function(lbl) {
    const idx = remaining.toUpperCase().indexOf(lbl + ":");
    if (idx >= 0) {
      const start = idx + lbl.length + 1;
      const nextIdx = SECTION_LABELS.reduce(function(best, l2) {
        if (l2 === lbl) return best;
        const i = remaining.toUpperCase().indexOf(l2 + ":", start);
        return (i > start && (best === -1 || i < best)) ? i : best;
      }, -1);
      const content = remaining.slice(start, nextIdx > 0 ? nextIdx : undefined).trim();
      sections.push({ label:lbl, content:content });
    }
  });
  return sections.length ? sections : [{ label:"RESPONSE", content:text }];
}

function ResponseCard({ persona, response, index }) {
  const [expanded, setExpanded] = useState(true);
  const sections = parseNarrative(response.narrative || "");
  const d = response.deltas;
  const fmt = function(v) { return (v > 0 ? "+" : "") + Math.round(v*100); };
  const em = (d && d.emotion) ? d.emotion.toLowerCase() : "";
  const ec = EMOTION_COLORS[em] || T.txt1;

  return (
    <div style={{ background:T.bg1, border:"1px solid " + persona.color + "44", borderRadius:12, overflow:"hidden", animation:"fadeIn 0.4s ease both", animationDelay:(index*0.05)+"s" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", cursor:"pointer" }} onClick={function(){ setExpanded(!expanded); }}>
        <PersonaAvatar persona={persona} size={38} active={true} />
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:600, color:T.txt0 }}>{persona.name}</div>
          <div style={{ fontSize:11, color:T.txt1, marginTop:1 }}>{persona.occupation || persona.occupationCategory}</div>
        </div>
        {em && (
          <span style={{ fontSize:11, color:ec, background:ec+"18", padding:"3px 10px", borderRadius:99, border:"1px solid " + ec + "33", fontWeight:500 }}>
            {em}
          </span>
        )}
        {d && (
          <div style={{ display:"flex", gap:8, fontSize:10 }}>
            {d.mood_delta !== undefined && <span style={{ color:d.mood_delta >= 0 ? T.green : T.red }}>{fmt(d.mood_delta)}% mood</span>}
            {d.stress_delta !== undefined && <span style={{ color:d.stress_delta >= 0 ? T.red : T.green }}>{fmt(d.stress_delta)}% stress</span>}
          </div>
        )}
        <span style={{ color:T.txt2, fontSize:10 }}>{expanded ? "▲" : "▼"}</span>
      </div>
      {expanded && (
        <div style={{ padding:"0 14px 14px", borderTop:"1px solid " + T.border }}>
          {sections.map(function(s) {
            const col = SECTION_COLORS[s.label] || T.txt1;
            return (
              <div key={s.label} style={{ marginTop:12 }}>
                <div style={{ fontSize:9, fontWeight:600, color:col, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:5 }}>{s.label}</div>
                <div style={{ fontSize:12, color:T.txt0, lineHeight:1.8 }}>{s.content}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SIMULATE VIEW ────────────────────────────────────────────────────────────
function SimulateView({ personas, setPersonas, selectedIds, setSelectedIds, rounds, setRounds }) {
  const [pickedScenario, setPickedScenario] = useState(null);
  const [customText, setCustomText] = useState("");
  const [activeCat, setActiveCat] = useState(null);
  const [year, setYear] = useState(2025);
  const [multiRounds, setMultiRounds] = useState(1);
  const [running, setRunning] = useState(false);
  const [loadingIds, setLoadingIds] = useState(new Set());
  const [doneIds, setDoneIds] = useState(new Set());
  const [error, setError] = useState(null);

  const targets = useMemo(function() { return personas.filter(function(p){ return selectedIds.includes(p.id); }); }, [personas, selectedIds]);
  // Auto-deselect IDs that no longer exist (e.g. after delete)
  useEffect(function() {
    const validIds = personas.map(function(p){ return p.id; });
    setSelectedIds(function(prev){ return prev.filter(function(id){ return validIds.includes(id); }); });
  }, [personas]);
  const currentRound = rounds[0] || null;
  const scenarioText = customText.trim() || (pickedScenario ? pickedScenario.text : "");

  const runSimulation = async function(scenarioOverride, yearOverride) {
    const text = scenarioOverride || scenarioText;
    if (!text || running || !targets.length) return;
    const yr = yearOverride || year;
    const roundId = uid();
    const label = pickedScenario ? pickedScenario.label : "Custom";
    const icon = pickedScenario ? (pickedScenario.icon || "📋") : "📋";
    setRounds(function(prev){ return [{ id:roundId, scenario:text, label:label, icon:icon, year:yr, responses:[] }, ...prev]; });
    setRunning(true); setDoneIds(new Set()); setLoadingIds(new Set(targets.map(function(p){ return p.id; }))); setError(null);
    // Trim scenario to 300 chars — diminishing returns beyond that for agent responses
    const trimmedText = text.length > 300 ? text.slice(0, 297) + "..." : text;
    const contextual = "[Year:" + yr + "] " + trimmedText;

    // ── Parallel with concurrency cap of 3 ──────────────────────────────────
    // Runs 3 agents simultaneously, starts next as soon as one finishes.
    // With ApiQueue's 4s gap this means ~3 agents fire in ~4s windows vs sequential.
    const CONCURRENCY = 3; // 3 workers + 600ms stagger = safe RPM, fast completion
    let idx = 0;

    const runOne = async function(p) {
      try {
        // 600 max_tokens → routes to Haiku (fast + cheap)
        const raw = await callClaude([{ role:"user", content:buildPrompt(p) + "\nSCENARIO: " + contextual }], SIM_SYSTEM_PROMPT, 380);
        const parsed = parseResponse(raw);
        const d = parsed.deltas;
        if (d) {
          setPersonas(function(prev) {
            return prev.map(function(x) {
              if (x.id !== p.id) return x;
              return Object.assign({}, x, {
                mood: clamp(x.mood + (d.mood_delta||0)),
                stress: clamp(x.stress + (d.stress_delta||0)),
                trust: clamp(x.trust + (d.trust_delta||0)),
                economicAnxiety: clamp(x.economicAnxiety + (d.econ_delta||0))
              });
            });
          });
        }
        setRounds(function(prev) {
          return prev.map(function(r) {
            if (r.id !== roundId) return r;
            return Object.assign({}, r, { responses: r.responses.concat([{ personaId:p.id, narrative:parsed.narrative, deltas:d }]) });
          });
        });
        setDoneIds(function(prev){ const n = new Set(prev); n.add(p.id); return n; });
      } catch(e) {
        setError(p.name + ": " + e.message);
      }
      setLoadingIds(function(prev){ const n = new Set(prev); n.delete(p.id); return n; });

      // Start next agent if any remain
      if (idx < targets.length) {
        const next = targets[idx++];
        return runOne(next);
      }
    };

    // Seed CONCURRENCY workers simultaneously
    const workers = [];
    while (idx < Math.min(CONCURRENCY, targets.length)) {
      workers.push(runOne(targets[idx++]));
    }
    await Promise.all(workers);
    setRunning(false);
  };

  const runPeriod = async function() {
    for (let i = 0; i < multiRounds; i++) {
      await runSimulation(scenarioText, year + i, i === 0);
    }
  };

  const activeCatData = activeCat ? SCENARIO_CATALOG.find(function(c){ return c.id === activeCat; }) : null;

  return (
    <div>
      <Card style={{ marginBottom:12 }}>
        <Label>Year</Label>
        <input type="range" min={1990} max={2040} value={year} onChange={function(e){ setYear(+e.target.value); }} />
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:T.txt2, marginTop:4 }}>
          <span>1990</span><span style={{ color:T.blue, fontWeight:600 }}>{year}</span><span>2040</span>
        </div>
      </Card>

      <Card style={{ marginBottom:12 }}>
        <Label>Scenario — {ALL_SCENARIOS.length} available</Label>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
          <button onClick={function(){ setPickedScenario(null); setCustomText(""); setActiveCat(null); }} style={{ padding:"4px 10px", background:!pickedScenario&&!customText?T.blue + "22":T.bg2, border:"1px solid " + (!pickedScenario&&!customText?T.blue:T.border), borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontSize:11, color:!pickedScenario&&!customText?T.blue:T.txt1 }}>
            Custom
          </button>
          {SCENARIO_CATALOG.map(function(cat) {
            return (
              <button key={cat.id} onClick={function(){ setActiveCat(activeCat===cat.id ? null : cat.id); }} style={{ padding:"4px 10px", background:activeCat===cat.id ? cat.color+"22" : T.bg2, border:"1px solid " + (activeCat===cat.id ? cat.color : T.border), borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontSize:11, color:activeCat===cat.id?cat.color:T.txt1, fontWeight:activeCat===cat.id?600:400, transition:"all 0.15s" }}>
                {cat.icon} {cat.label}
              </button>
            );
          })}
        </div>

        {activeCatData && (
          <div style={{ background:T.bg0, border:"1px solid " + activeCatData.color + "33", borderRadius:10, padding:10, maxHeight:260, overflowY:"auto", marginBottom:10 }}>
            <div style={{ fontSize:10, color:activeCatData.color, fontWeight:600, marginBottom:8, textTransform:"uppercase" }}>
              {activeCatData.icon} {activeCatData.label} — {activeCatData.scenarios.length} scenarios
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
              {activeCatData.scenarios.map(function(sc) {
                const isActive = pickedScenario && pickedScenario.id === sc.id;
                return (
                  <button key={sc.id} onClick={function(){ setPickedScenario(Object.assign({}, sc, { icon:activeCatData.icon, category:activeCatData.label })); setCustomText(""); setActiveCat(null); }} style={{ background:isActive?T.blue + "22":T.bg2, border:"1px solid " + (isActive?T.blue:T.border), borderRadius:7, padding:"7px 9px", cursor:"pointer", textAlign:"left", color:isActive?T.txt0:T.txt1, fontSize:11, fontFamily:"inherit", lineHeight:1.3 }}>
                    <span style={{ display:"block", fontWeight:isActive?600:400 }}>{sc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {pickedScenario && (
          <div style={{ marginBottom:10, padding:"8px 12px", background:T.blue + "14", border:"1px solid " + T.blue + "44", borderRadius:8 }}>
            <div style={{ fontSize:10, color:T.blue, fontWeight:600, marginBottom:3 }}>{pickedScenario.label}</div>
            <div style={{ fontSize:11, color:T.txt1, lineHeight:1.6 }}>{pickedScenario.text}</div>
          </div>
        )}

        <Textarea label="Or write a custom scenario" value={customText} onChange={function(v){ setCustomText(v); setPickedScenario(null); }} placeholder="Describe any global, local, or personal event..." rows={3} />

        <div style={{ background:T.bg0, border:"1px solid " + T.border, borderRadius:10, padding:"12px 14px", marginBottom:12 }}>
          <div style={{ fontSize:12, color:T.purple, fontWeight:600, marginBottom:8 }}>Time-Period Simulation</div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
            <span style={{ fontSize:12, color:T.txt1, flex:1 }}>Rounds (each = +1 year)</span>
            <div style={{ display:"flex", gap:5 }}>
              {[1,3,5,10].map(function(n) { return <ToggleBtn key={n} active={multiRounds===n} onClick={function(){ setMultiRounds(n); }} small>{n}x</ToggleBtn>; })}
            </div>
          </div>
          <div style={{ fontSize:11, color:T.txt2 }}>
            {multiRounds === 1 ? "Single snapshot: year " + year : "Runs " + year + " to " + (year+multiRounds-1) + ", tracking " + multiRounds + "-year psychological drift"}
          </div>
        </div>

        {/* Agent summary — toggle per-card using the ▶ buttons in World view */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, padding:"8px 12px", background:T.bg0, borderRadius:8 }}>
          <span style={{ fontSize:12, color:T.txt1 }}>
            <span style={{ color:T.green, fontWeight:600 }}>{targets.length}</span> of {personas.length} agents selected
          </span>
          <div style={{ display:"flex", gap:5 }}>
            <button onClick={function(){ setSelectedIds(personas.map(function(p){ return p.id; })); }}
              style={{ fontSize:10, padding:"3px 8px", background:T.bg1, border:"1px solid "+T.border, borderRadius:6, cursor:"pointer", fontFamily:"inherit", color:T.txt1 }}>All</button>
            <button onClick={function(){ setSelectedIds([]); }}
              style={{ fontSize:10, padding:"3px 8px", background:T.bg1, border:"1px solid "+T.border, borderRadius:6, cursor:"pointer", fontFamily:"inherit", color:T.txt1 }}>None</button>
            <span style={{ fontSize:10, color:T.txt2, padding:"3px 4px" }}>Toggle ▶ on each card above</span>
          </div>
        </div>

        {error && <div style={{ fontSize:11, color:T.red, marginBottom:8 }}>⚠ {error}</div>}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          <PrimaryBtn onClick={function(){ runSimulation(null, null, true); }} disabled={!scenarioText||running||!targets.length} loading={running}>
            {running ? loadingIds.size + " processing..." : "▶ Run Once"}
          </PrimaryBtn>
          <PrimaryBtn onClick={runPeriod} disabled={!scenarioText||running||multiRounds<2||!targets.length} color={T.purple}>
            Run {multiRounds}x Period
          </PrimaryBtn>
        </div>
      </Card>

      {running && (
        <div style={{ marginBottom:12 }}>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:6 }}>
            {targets.map(function(p) {
              const isLoading = loadingIds.has(p.id);
              const isDone = doneIds.has(p.id);
              return (
                <div key={p.id} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", border:"1px solid " + p.color + "33", borderRadius:99, background:p.color+"14", fontSize:11 }}>
                  <span>{p.emoji}</span>
                  <span style={{ color:isDone?T.green:isLoading?T.amber:T.txt2 }}>{isDone?"✓":isLoading?"⟳":""} {p.name.split(" ")[0]}</span>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize:10, color:T.txt2, letterSpacing:"0.04em" }}>
            {doneIds.size} / {targets.length} complete · Requests staggered to avoid rate limits
          </div>
        </div>
      )}

      {currentRound && currentRound.responses.length > 0 && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:600, color:T.txt0 }}>{currentRound.icon} {currentRound.label} {currentRound.year ? "· " + currentRound.year : ""}</div>
            <div style={{ fontSize:11, color:T.txt2 }}>Round {rounds.length}</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {currentRound.responses.map(function(r, i) {
              const p = personas.find(function(x){ return x.id===r.personaId; });
              return p ? <ResponseCard key={r.personaId} persona={p} response={r} index={i} /> : null;
            })}
          </div>
        </div>
      )}

      {currentRound && currentRound.responses.length === targets.length && targets.length > 0 && (
        <Card style={{ marginTop:12 }}>
          <Label>Updated Psychological States</Label>
          {targets.map(function(p) {
            return (
              <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <span style={{ fontSize:16 }}>{p.emoji}</span>
                <span style={{ fontSize:11, color:T.txt1, width:80, flexShrink:0, fontWeight:500 }}>{p.name.split(" ")[0]}</span>
                <div style={{ flex:1, display:"flex", gap:6 }}>
                  <StatBar label="Mood" value={p.mood} color={p.mood>0.6?T.green:T.red} />
                  <StatBar label="Stress" value={p.stress} color={T.red} />
                  <StatBar label="Trust" value={p.trust} color={T.blue} />
                  <StatBar label="EconAnx" value={p.economicAnxiety} color={T.amber} />
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}

// ─── TIMELINE VIEW ────────────────────────────────────────────────────────────
function TimelineView({ personas, rounds }) {
  if (!rounds.length) {
    return (
      <div style={{ textAlign:"center", padding:"60px 24px" }}>
        <div style={{ fontSize:40, marginBottom:12 }}>◈</div>
        <div style={{ fontSize:14, color:T.txt1, marginBottom:6 }}>No simulation data yet</div>
        <div style={{ fontSize:12, color:T.txt2 }}>Run simulations to see psychological drift over time.</div>
      </div>
    );
  }

  const reversedRounds = [...rounds].reverse();

  return (
    <div>
      <Card style={{ marginBottom:14 }}>
        <Label>Mood Drift — {rounds.length} Rounds</Label>
        <p style={{ fontSize:11, color:T.txt2, marginBottom:14 }}>Each bar shows mood change per round. Green = positive, red = negative.</p>
        {personas.slice(0, 8).map(function(p) {
          return (
            <div key={p.id} style={{ marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <PersonaAvatar persona={p} size={28} />
                <span style={{ fontSize:12, fontWeight:500, color:p.color }}>{p.name}</span>
                <span style={{ fontSize:10, color:T.txt2, marginLeft:"auto" }}>
                  {"mood " + Math.round(p.mood*100) + "% · stress " + Math.round(p.stress*100) + "% · trust " + Math.round(p.trust*100) + "%"}
                </span>
              </div>
              <div style={{ display:"flex", gap:3, alignItems:"flex-end", height:44 }}>
                {reversedRounds.map(function(r, ri) {
                  const resp = r.responses.find(function(x){ return x.personaId === p.id; });
                  const delta = resp && resp.deltas ? resp.deltas.mood_delta : null;
                  if (delta === null || delta === undefined) {
                    return <div key={ri} style={{ width:16, height:4, background:T.bg0, borderRadius:2 }} />;
                  }
                  const h = Math.max(4, Math.abs(delta)*220);
                  const barColor = delta > 0 ? T.green : T.red;
                  const titleStr = "Round " + (ri+1) + (r.year ? " (" + r.year + ")" : "") + ": " + r.label + " | Mood " + (delta > 0 ? "+" : "") + Math.round(delta*100);
                  return (
                    <div key={ri} title={titleStr} style={{ width:16, height:h, background:barColor, borderRadius:2, alignSelf:"flex-end", opacity:0.85 }} />
                  );
                })}
              </div>
            </div>
          );
        })}
      </Card>

      <Card>
        <Label>Round Log</Label>
        {rounds.map(function(r, i) {
          return (
            <div key={r.id} style={{ marginBottom:12, paddingBottom:12, borderBottom:i < rounds.length-1 ? "1px solid " + T.border : "none" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <span style={{ fontSize:13, fontWeight:600, color:T.txt0 }}>{r.icon} {r.label}</span>
                <span style={{ fontSize:11, color:T.txt2 }}>{"Round " + (rounds.length-i) + (r.year ? " · " + r.year : "")}</span>
              </div>
              <div style={{ fontSize:11, color:T.txt2, lineHeight:1.5, marginBottom:8 }}>{r.scenario.slice(0,120)}...</div>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {r.responses.map(function(resp) {
                  const p = personas.find(function(x){ return x.id===resp.personaId; });
                  if (!p) return null;
                  const em = resp.deltas && resp.deltas.emotion ? resp.deltas.emotion.toLowerCase() : "?";
                  const ec = EMOTION_COLORS[em] || T.txt2;
                  return (
                    <div key={resp.personaId} style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 8px", borderRadius:99, background:p.color+"14", border:"1px solid " + p.color + "33", fontSize:11 }}>
                      <span>{p.emoji}</span>
                      <span style={{ color:ec }}>{em}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ─── ICON BUTTON ──────────────────────────────────────────────────────────────
function IconBtn({ onClick, icon, title }) {
  return (
    <button onClick={onClick} title={title} className="btn-ghost" style={{ width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", background:"transparent", border:"1px solid " + T.border, borderRadius:8, cursor:"pointer", color:T.txt2, flexShrink:0, transition:"all 0.18s" }}>
      {icon}
    </button>
  );
}

function UserMenu({ user, onLogout, onClearData, personaCount, roundCount }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const initial = (user.displayName || user.email).charAt(0).toUpperCase();

  const handleClear = function() {
    if (!confirming) { setConfirming(true); return; }
    setOpen(false); setConfirming(false);
    onClearData();
  };

  return (
    <div style={{ position:"relative" }}>
      <button onClick={function(){ setOpen(!open); setConfirming(false); }} style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg," + T.blue + "30," + T.purple + "20)", border:"1.5px solid " + T.blue + "55", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, color:T.blue, flexShrink:0 }}>
        {initial}
      </button>
      {open && (
        <div className="fade-in" style={{ position:"absolute", right:0, top:"calc(100% + 8px)", background:T.bg1, border:"1px solid " + T.border, borderRadius:14, padding:6, minWidth:200, zIndex:100, boxShadow:"0 12px 40px rgba(0,0,0,0.55)" }}>
          {/* User info */}
          <div style={{ padding:"10px 12px 12px", borderBottom:"1px solid " + T.border, marginBottom:4 }}>
            <div style={{ fontSize:13, fontWeight:700, color:T.txt0, fontFamily:"'Syne',sans-serif" }}>{user.displayName || user.email.split("@")[0]}</div>
            <div style={{ fontSize:10, color:T.txt2, marginTop:2 }}>{user.email}</div>
            <div style={{ display:"flex", gap:12, marginTop:8 }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:16, fontWeight:700, color:T.blue, fontFamily:"'JetBrains Mono',monospace" }}>{personaCount}</div>
                <div style={{ fontSize:9, color:T.txt2, textTransform:"uppercase", letterSpacing:"0.06em" }}>Agents</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:16, fontWeight:700, color:T.purple, fontFamily:"'JetBrains Mono',monospace" }}>{roundCount}</div>
                <div style={{ fontSize:9, color:T.txt2, textTransform:"uppercase", letterSpacing:"0.06em" }}>Rounds</div>
              </div>
            </div>
          </div>
          {/* Clear data */}
          <button onClick={handleClear} style={{ width:"100%", padding:"8px 12px", background:confirming ? T.red + "15" : "none", border:"1px solid " + (confirming ? T.red + "44" : "transparent"), borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, color:confirming ? T.red : T.txt1, textAlign:"left", display:"flex", alignItems:"center", gap:8, marginBottom:2, transition:"all 0.15s" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M5 1h2M4 3v7M8 3v7M1 3h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {confirming ? "Tap again to confirm clear" : "Clear all data"}
          </button>
          {/* Sign out */}
          <button onClick={function(){ setOpen(false); onLogout(); }} style={{ width:"100%", padding:"8px 12px", background:"none", border:"1px solid transparent", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, color:T.red, textAlign:"left", display:"flex", alignItems:"center", gap:8 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 6H2M5 3l-3 3 3 3M10 1v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SPLASH SCREEN ────────────────────────────────────────────────────────────

// ─── STAR FIELD (rendered as DOM so CSS animations work) ──────────────────
const STARS = (function() {
  function rng(s) { return ((Math.sin(s*127.1+311.7)*43758.5453)%1+1)%1; }
  const out = [];
  for (let i=0; i<200; i++) {
    const x = rng(i*2.39)*100;
    const y = rng(i*3.71)*100;
    const r = i%11===0?1.6:i%5===0?1.0:0.55;
    const op = 0.30 + rng(i*1.73)*0.55;
    const warm = i%13===0, blue = i%7===0;
    const col = warm ? 'rgba(255,225,185,' : blue ? 'rgba(180,205,255,' : 'rgba(220,230,255,';
    const anim = i%6===0 ? 'twinkle ' + (2.2+rng(i*0.77)*3.5).toFixed(1) + 's ease-in-out ' + (rng(i*2.3)*4).toFixed(1) + 's infinite'
      : i%9===0 ? 'twinkleSlow ' + (3.5+rng(i*0.41)*4).toFixed(1) + 's ease-in-out ' + (rng(i*3.1)*5).toFixed(1) + 's infinite'
      : null;
    out.push({ x, y, r, op, col, anim });
  }
  // Constellation stars with specific twinkle
  const fixed = [
    // Big Dipper bowl
    { x:68.3, y:17.5, r:2.2, op:0.95, col:'rgba(200,215,255,', anim:'twinkle 3.1s ease-in-out 0.5s infinite' },
    { x:71.7, y:15.6, r:2.0, op:0.92, col:'rgba(200,215,255,', anim:null },
    { x:74.6, y:17.5, r:2.3, op:0.95, col:'rgba(200,215,255,', anim:null },
    { x:73.3, y:21.9, r:2.0, op:0.92, col:'rgba(200,215,255,', anim:'twinkle 4.2s ease-in-out 1.2s infinite' },
    { x:69.6, y:21.9, r:1.8, op:0.88, col:'rgba(200,215,255,', anim:null },
    // Handle
    { x:77.5, y:14.8, r:2.1, op:0.92, col:'rgba(200,215,255,', anim:null },
    { x:80.7, y:13.5, r:2.4, op:0.96, col:'rgba(210,225,255,', anim:'twinkle 2.8s ease-in-out 0.3s infinite' },
    { x:83.8, y:15.3, r:2.0, op:0.88, col:'rgba(200,215,255,', anim:null },
    // Polaris
    { x:63.3, y:9.4, r:2.8, op:0.98, col:'rgba(230,235,255,', anim:'twinkle 2.2s ease-in-out 0s infinite' },
    // Orion — Betelgeuse (red)
    { x:15.4, y:28.8, r:3.2, op:0.95, col:'rgba(255,150,80,', anim:'twinkle 3.5s ease-in-out 0.8s infinite' },
    { x:20.0, y:27.5, r:2.2, op:0.92, col:'rgba(180,205,255,', anim:null },
    // Belt
    { x:16.7, y:38.8, r:2.0, op:0.95, col:'rgba(200,220,255,', anim:null },
    { x:17.8, y:38.5, r:2.2, op:0.95, col:'rgba(200,220,255,', anim:null },
    { x:18.8, y:38.8, r:2.0, op:0.95, col:'rgba(200,220,255,', anim:null },
    // Rigel (blue-white, bright)
    { x:20.8, y:49.4, r:3.5, op:0.98, col:'rgba(180,210,255,', anim:'twinkle 2.5s ease-in-out 1.5s infinite' },
    { x:15.4, y:50.0, r:2.0, op:0.88, col:'rgba(185,205,255,', anim:null },
    // Southern Cross
    { x:81.7, y:72.5, r:2.2, op:0.95, col:'rgba(170,200,255,', anim:'twinkle 3.8s ease-in-out 2.1s infinite' },
    { x:81.7, y:80.6, r:1.9, op:0.88, col:'rgba(170,200,255,', anim:null },
    { x:79.0, y:76.6, r:1.7, op:0.85, col:'rgba(170,200,255,', anim:null },
    { x:84.3, y:76.6, r:2.0, op:0.90, col:'rgba(170,200,255,', anim:null },
    // Bright anchors
    { x:6.7, y:11.9, r:2.5, op:0.96, col:'rgba(210,230,255,', anim:'twinkle 2.9s ease-in-out 0.4s infinite' },
    { x:54.2, y:6.9, r:2.0, op:0.90, col:'rgba(255,230,190,', anim:'twinkleSlow 5.1s ease-in-out 1.7s infinite' },
    { x:90.0, y:25.0, r:1.9, op:0.85, col:'rgba(255,210,180,', anim:'twinkleSlow 3.7s ease-in-out 2.8s infinite' },
    { x:90.0, y:60.0, r:2.0, op:0.88, col:'rgba(200,220,255,', anim:'twinkle 3.2s ease-in-out 0.6s infinite' },
  ];
  return { random: out, fixed };
})();

// Constellation line pairs [x1%,y1%,x2%,y2%]
const CONSTELLATION_LINES = [
  // Big Dipper bowl
  [68.3,17.5, 71.7,15.6], [71.7,15.6, 74.6,17.5], [74.6,17.5, 73.3,21.9],
  [73.3,21.9, 69.6,21.9], [69.6,21.9, 68.3,17.5],
  // Handle
  [74.6,17.5, 77.5,14.8], [77.5,14.8, 80.7,13.5], [80.7,13.5, 83.8,15.3],
  // Orion body
  [15.4,28.8, 20.0,27.5], [15.4,28.8, 16.7,38.8], [20.0,27.5, 18.8,38.8],
  [16.7,38.8, 15.4,50.0], [18.8,38.8, 20.8,49.4],
  [15.4,28.8, 12.9,33.1], [20.0,27.5, 22.7,32.3],
  [15.4,28.8, 17.5,24.4], [20.0,27.5, 17.5,24.4],
  // Southern Cross
  [81.7,72.5, 81.7,80.6], [79.0,76.6, 84.3,76.6],
];

function StarField() {
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
      {/* Random stars */}
      {STARS.random.map(function(s, i) {
        return (
          <div key={i} style={{
            position:"absolute",
            left: s.x + "%", top: s.y + "%",
            width: s.r*2 + "px", height: s.r*2 + "px",
            borderRadius:"50%",
            background: s.col + s.op + ")",
            animation: s.anim || "none",
            transform:"translate(-50%,-50%)",
          }} />
        );
      })}
      {/* Fixed constellation stars */}
      {STARS.fixed.map(function(s, i) {
        return (
          <div key={"f"+i} style={{
            position:"absolute",
            left: s.x + "%", top: s.y + "%",
            width: s.r*2 + "px", height: s.r*2 + "px",
            borderRadius:"50%",
            background: s.col + s.op + ")",
            animation: s.anim || "none",
            transform:"translate(-50%,-50%)",
            zIndex:1,
          }} />
        );
      })}
      {/* Constellation lines as SVG overlay */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} viewBox="0 0 100 100" preserveAspectRatio="none">
        {CONSTELLATION_LINES.map(function(l, i) {
          return <line key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} stroke="rgba(140,175,255,0.30)" strokeWidth="0.15"/>;
        })}
      </svg>
    </div>
  );
}

function SplashScreen({ onDone, theme }) {
  const [phase, setPhase] = useState(0);

  useEffect(function() {
    const t1 = setTimeout(function(){ setPhase(1); }, 700);
    const t2 = setTimeout(function(){ setPhase(2); }, 1600);
    return function(){ clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const ac = theme === "terminal" ? "#00ff88" : theme === "sunset" ? "#ff6eb4" : theme === "vapor" ? "#ff44cc" : "#3dd6f5";
  const ap = theme === "vapor" ? "#ff44cc" : theme === "sunset" ? "#cc44ff" : "#9d7bff";

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:"#02040a", overflow:"hidden", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", padding:"20px 24px" }}>
      {/* Star field with twinkling DOM stars */}
      <StarField />

      {/* Vignette */}
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 75% 75% at 50% 35%, transparent 30%, rgba(2,4,10,0.5) 75%, rgba(2,4,10,0.9) 100%)", pointerEvents:"none" }} />

      {/* ── EARTH — upper portion, fully contained ── */}
      <div style={{ position:"relative", zIndex:1, marginBottom:28, animation:"floatAnim 5s ease-in-out infinite", flexShrink:0 }}>
        {/* Ambient bloom */}
        <div style={{ position:"absolute", inset:"-28px", borderRadius:"50%", background:"radial-gradient(circle, rgba(30,90,200,0.16) 0%, rgba(20,60,160,0.08) 50%, transparent 70%)", pointerEvents:"none" }} />
        {/* Earth photo */}
        <img
          src={EARTH_IMG}
          alt="Earth — Artemis II, Reid Wiseman / NASA, April 2026"
          style={{
            width:160, height:160, borderRadius:"50%",
            objectFit:"cover", objectPosition:"center",
            display:"block", border:"none", outline:"none",
            WebkitMaskImage:"radial-gradient(circle at center, black 44%, rgba(0,0,0,0.75) 58%, rgba(0,0,0,0.3) 67%, transparent 76%)",
            maskImage:"radial-gradient(circle at center, black 44%, rgba(0,0,0,0.75) 58%, rgba(0,0,0,0.3) 67%, transparent 76%)",
            filter:"brightness(1.08) contrast(1.06) saturate(1.12)"
          }}
        />
        {/* Atmosphere limb */}
        <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"radial-gradient(circle at center, transparent 50%, rgba(40,140,255,0.20) 63%, rgba(80,190,255,0.12) 70%, transparent 78%)", pointerEvents:"none" }} />
        {/* Orbiting moon */}
        <div style={{ position:"absolute", top:"50%", left:"50%", width:0, height:0, animation:"orbitDot 11s linear infinite" }}>
          <div style={{ position:"absolute", width:13, height:13, borderRadius:"50%", background:"linear-gradient(145deg,#ccc8c0,#8a8880)", boxShadow:"inset -2px -2px 4px rgba(0,0,0,0.6), inset 1px 1px 2px rgba(255,255,255,0.18), 0 0 8px rgba(180,175,160,0.3)", transform:"translate(-6px,-6px)" }}>
            <div style={{ position:"absolute", width:3, height:3, borderRadius:"50%", background:"rgba(0,0,0,0.2)", top:2, left:2 }} />
            <div style={{ position:"absolute", width:2, height:2, borderRadius:"50%", background:"rgba(0,0,0,0.15)", top:6, left:7 }} />
          </div>
        </div>
      </div>

      {/* ── TEXT — below Earth, fully contained ── */}
      <div style={{ position:"relative", zIndex:1, textAlign:"center", width:"100%", maxWidth:520 }}>

        {/* Wordmark — single line, scales down on narrow screens */}
        <div style={{ animation:"splashReveal 1.2s cubic-bezier(0.16,1,0.3,1) both", marginBottom:12 }}>
          {/* Two-word stack: MY HUMANITY / LAB — prevents clipping on any screen */}
          <div style={{ lineHeight:0.92 }}>
            <div style={{
              fontFamily:"'Syne',sans-serif",
              fontSize:"clamp(26px, 6vw, 48px)",
              fontWeight:800,
              letterSpacing:"-0.025em",
              background:"linear-gradient(128deg," + ac + " 0%,#ddeeff 40%,#ffffff 55%," + ap + " 100%)",
              WebkitBackgroundClip:"text",
              WebkitTextFillColor:"transparent",
              backgroundClip:"text",
              filter:"drop-shadow(0 0 22px " + ac + "44)"
            }}>MY HUMANITY</div>
            <div style={{
              fontFamily:"'Syne',sans-serif",
              fontSize:"clamp(26px, 6vw, 48px)",
              fontWeight:800,
              letterSpacing:"-0.025em",
              background:"linear-gradient(128deg," + ap + " 0%,#ddeeff 40%,#ffffff 55%," + ac + " 100%)",
              WebkitBackgroundClip:"text",
              WebkitTextFillColor:"transparent",
              backgroundClip:"text",
              filter:"drop-shadow(0 0 22px " + ap + "44)"
            }}>LAB</div>
          </div>
        </div>

        {/* Byline */}
        {phase >= 1 && (
          <div style={{ animation:"splashSub 0.9s ease both" }}>
            <div style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(150,185,240,0.65)", marginBottom:10 }}>
              195 Countries · Virtual Population · Infinite Possibilities
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", flexWrap:"wrap", gap:"4px 0", marginBottom:24 }}>
              {["Simulate Real Scenarios","AI-Powered Personas","Research-Grade Insights"].map(function(t, i) {
                return (
                  <span key={i} style={{ display:"flex", alignItems:"center" }}>
                    {i > 0 && <span style={{ color:"rgba(80,120,200,0.4)", margin:"0 8px", fontSize:10 }}>·</span>}
                    <span style={{ fontSize:10, color:"rgba(130,165,230,0.7)", letterSpacing:"0.04em" }}>{t}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Enter button */}
        {phase >= 2 && (
          <button onClick={onDone} style={{
            animation:"splashSub 0.8s ease both",
            padding:"11px 44px", borderRadius:99,
            fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600,
            cursor:"pointer", letterSpacing:"0.07em",
            background:"linear-gradient(135deg," + ac + "18," + ap + "10)",
            border:"1px solid " + ac + "44",
            color:"rgba(190,220,255,0.92)",
            boxShadow:"0 0 28px " + ac + "18",
            transition:"all 0.2s"
          }}>
            Enter
          </button>
        )}
      </div>

      <div style={{ position:"absolute", bottom:14, right:18, fontSize:9, color:"rgba(80,110,170,0.38)", letterSpacing:"0.08em" }}>
        myhumanitylab.com
      </div>
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
const ONBOARDING_STEPS = [
  { icon:"🌍", title:"Welcome to Humanity Labs", body:"Build a synthetic population of any size — from a single family to a global cross-section. Every person is a fully modelled psychological agent with biases, emotions, and a backstory." },
  { icon:"⬡", title:"The Library", body:"Browse 90+ hand-crafted census-accurate personas. Or use the Country Generator to create demographically accurate people from any of 195 countries, on demand." },
  { icon:"🤖", title:"AI Persona Creation", body:'Describe anyone in plain language — "60-year-old retired coal miner in West Virginia, Fox News viewer, lost his pension" — and Claude fills in all 30+ psychological and demographic fields.' },
  { icon:"▶", title:"Run Simulations", body:"Choose from 200 global scenarios across 8 categories. Each agent responds through their own biased, emotional lens — gut reactions, interpretations, planned actions." },
  { icon:"◈", title:"Track Drift Over Time", body:"Run scenarios across multiple years and watch mood, stress, trust, and economic anxiety evolve. Export research reports or raw JSON for analysis." },
];

function OnboardingOverlay({ onClose }) {
  const [step, setStep] = useState(0);
  const s = ONBOARDING_STEPS[step];
  const isLast = step === ONBOARDING_STEPS.length - 1;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:8000, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:440, background:T.bg1, border:"1px solid " + T.border, borderRadius:20, padding:32, position:"relative", animation:"splashSub 0.4s ease both" }}>
        <button onClick={onClose} style={{ position:"absolute", top:16, right:16, background:"none", border:"none", cursor:"pointer", color:T.txt2, fontSize:18, lineHeight:1, padding:4 }}>×</button>
        {/* Mini logo in onboarding header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:18 }}>
          <div style={{ position:"relative", width:24, height:24, flexShrink:0 }}>
            <img src={EARTH_IMG} style={{ width:24, height:24, borderRadius:"50%", objectFit:"cover",
              WebkitMaskImage:"radial-gradient(circle at center,black 50%,rgba(0,0,0,0.5) 66%,transparent 78%)",
              maskImage:"radial-gradient(circle at center,black 50%,rgba(0,0,0,0.5) 66%,transparent 78%)",
              filter:"brightness(1.05) saturate(1.1)", display:"block" }} />
            <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"radial-gradient(circle,transparent 52%,rgba(40,140,255,0.2) 66%,transparent 76%)" }} />
          </div>
          <div style={{ lineHeight:0.88 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:11, fontWeight:800, letterSpacing:"-0.01em",
              background:"linear-gradient(120deg,var(--c-blue) 0%,#ddeeff 50%,var(--c-purple) 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>MY HUMANITY LAB</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:6, marginBottom:18, justifyContent:"center" }}>
          {ONBOARDING_STEPS.map(function(_, i) {
            return (
              <div key={i} onClick={function(){ setStep(i); }} style={{ width:i===step?20:7, height:7, borderRadius:99, cursor:"pointer", background:i===step?T.blue:i<step?T.green:T.border, transition:"all 0.3s" }} />
            );
          })}
        </div>
        <div style={{ fontSize:44, textAlign:"center", marginBottom:16, animation:"floatAnim 3s ease-in-out infinite" }}>{s.icon}</div>
        <div style={{ fontSize:18, fontWeight:800, color:T.txt0, textAlign:"center", marginBottom:12, fontFamily:"'Syne',sans-serif", letterSpacing:"-0.01em" }}>{s.title}</div>
        <div style={{ fontSize:13, color:T.txt1, lineHeight:1.8, textAlign:"center", marginBottom:28 }}>{s.body}</div>
        <button onClick={function(){ if (isLast) onClose(); else setStep(step+1); }} style={{ width:"100%", padding:"13px", borderRadius:10, fontFamily:"inherit", fontSize:13, fontWeight:600, cursor:"pointer", background:"linear-gradient(135deg," + T.blue + "22," + T.blue + "11)", border:"1px solid " + T.blue, color:T.blue, transition:"all 0.2s" }}>
          {isLast ? "Let's begin →" : "Next →"}
        </button>
      </div>
    </div>
  );
}

// ─── THEME PICKER ─────────────────────────────────────────────────────────────
function ThemePicker({ current, onChange }) {
  const [open, setOpen] = useState(false);
  const cur = THEMES[current] || THEMES.abyss;
  return (
    <div style={{ position:"relative" }}>
      <button onClick={function(){ setOpen(!open); }} title={"Theme: " + cur.name} className="btn-ghost" style={{ width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", background:"transparent", border:"1px solid " + T.border, borderRadius:8, cursor:"pointer", fontSize:14, flexShrink:0 }}>
        {cur.icon}
      </button>
      {open && (
        <div className="fade-in" style={{ position:"absolute", right:0, top:"calc(100% + 8px)", zIndex:200, background:T.bg1, border:"1px solid " + T.border, borderRadius:14, padding:6, minWidth:165, boxShadow:"0 12px 40px rgba(0,0,0,0.6)" }}>
          <div style={{ padding:"6px 10px 8px", fontSize:9, fontWeight:700, color:T.txt2, textTransform:"uppercase", letterSpacing:"0.1em" }}>Theme</div>
          {Object.entries(THEMES).map(function(entry) {
            const key = entry[0]; const t = entry[1];
            const isActive = current === key;
            return (
              <button key={key} onClick={function(){ onChange(key); setOpen(false); }} style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"9px 10px", background:isActive?"var(--c-glow)":"transparent", border:"1px solid " + (isActive?T.border:"transparent"), borderRadius:9, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, color:isActive?T.txt0:T.txt1, textAlign:"left", transition:"all 0.15s" }}>
                <span style={{ fontSize:16 }}>{t.icon}</span>
                <span style={{ fontWeight:isActive?600:400 }}>{t.name}</span>
                {isActive && <div style={{ marginLeft:"auto", width:6, height:6, borderRadius:"50%", background:T.blue }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────
const STORAGE_KEY = function(email) { return "my-humanity-lab:user:" + email.toLowerCase().trim(); };
const SESSION_KEY = "my-humanity-lab:session";
const INDEX_KEY = "my-humanity-lab:users";

async function saveUserData(email, personas, rounds) {
  try {
    const payload = JSON.stringify({ email:email, personas:personas, rounds:rounds, savedAt:new Date().toISOString() });
    await window.storage.set(STORAGE_KEY(email), payload);
    let index = [];
    try { const r = await window.storage.get(INDEX_KEY); if (r) index = JSON.parse(r.value); } catch(e) {}
    if (!index.includes(email.toLowerCase())) {
      index.push(email.toLowerCase());
      await window.storage.set(INDEX_KEY, JSON.stringify(index));
    }
  } catch(e) { console.warn("Save failed:", e); }
}

async function loadUserData(email) {
  try {
    const r = await window.storage.get(STORAGE_KEY(email));
    if (!r) return null;
    return JSON.parse(r.value);
  } catch(e) { return null; }
}

async function listUsers() {
  try {
    const r = await window.storage.get(INDEX_KEY);
    return r ? JSON.parse(r.value) : [];
  } catch(e) { return []; }
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, themeKey }) {
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [knownUsers, setKnownUsers] = useState([]);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(function() { listUsers().then(setKnownUsers); }, []);

  const isValidEmail = function(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()); };

  const handleSubmit = async function() {
    const trimEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimEmail)) { setError("Please enter a valid email address."); return; }
    setLoading(true); setError("");
    try {
      const existing = await loadUserData(trimEmail);
      if (mode === "login") {
        if (existing) {
          onLogin(trimEmail, existing.personas, existing.rounds, existing.email || trimEmail);
        } else {
          setError("No account found. Sign up first.");
          setMode("signup");
        }
      } else {
        const displayName = name.trim() || trimEmail.split("@")[0];
        await saveUserData(trimEmail, DEFAULTS.map(function(p){ return Object.assign({}, p); }), []);
        onLogin(trimEmail, DEFAULTS.map(function(p){ return Object.assign({}, p); }), [], displayName);
      }
      // Save to localStorage for remember me
      if (rememberMe) {
        try { localStorage.setItem("mhl:remember", trimEmail); } catch(e) {}
      } else {
        try { localStorage.removeItem("mhl:remember"); } catch(e) {}
      }
    } catch(e) { setError("Something went wrong. Try again."); }
    setLoading(false);
  };

  // Check localStorage for remembered email on mount
  useEffect(function() {
    try {
      const saved = localStorage.getItem("mhl:remember");
      if (saved) { setEmail(saved); setRememberMe(true); }
    } catch(e) {}
  }, []);

  return (
    <div style={{ fontFamily:"Inter,sans-serif", background:"var(--c-bg0)", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <style>{buildCss(themeKey)}</style>
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center" }}>
              {/* Earth + moon logo */}
              <div style={{ position:"relative", width:44, height:44, flexShrink:0 }}>
                <img src={EARTH_IMG}
                  style={{ width:44, height:44, borderRadius:"50%", objectFit:"cover", objectPosition:"center",
                    WebkitMaskImage:"radial-gradient(circle at center,black 50%,rgba(0,0,0,0.6) 68%,transparent 80%)",
                    maskImage:"radial-gradient(circle at center,black 50%,rgba(0,0,0,0.6) 68%,transparent 80%)",
                    filter:"brightness(1.05) saturate(1.1)", display:"block" }}
                />
                <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"radial-gradient(circle,transparent 52%,rgba(40,140,255,0.22) 66%,transparent 76%)" }} />
                <div style={{ position:"absolute", top:"50%", left:"50%", width:0, height:0, animation:"orbitSmall 8s linear infinite" }}>
                  <div style={{ position:"absolute", width:7, height:7, borderRadius:"50%",
                    background:"linear-gradient(145deg,#ccc8c0,#8a8880)",
                    boxShadow:"inset -1px -1px 3px rgba(0,0,0,0.55),inset 0.5px 0.5px 2px rgba(255,255,255,0.18)",
                    transform:"translate(-3.5px,-3.5px)" }} />
                </div>
              </div>
              {/* Gradient title */}
              <div style={{ textAlign:"left", lineHeight:0.9 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, letterSpacing:"-0.02em",
                  background:"linear-gradient(120deg,var(--c-blue) 0%,#ddeeff 45%,var(--c-purple) 100%)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>MY HUMANITY</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, letterSpacing:"-0.015em",
                  background:"linear-gradient(120deg,var(--c-purple) 0%,#ddeeff 45%,var(--c-blue) 100%)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>LAB</div>
              </div>
            </div>
          <div style={{ fontSize:10, color:T.txt2, marginTop:8, letterSpacing:"0.14em", textAlign:"center" }}>WORLD POPULATION SIMULATOR</div>
        </div>
        <div style={{ background:T.bg1, border:"1px solid " + T.border, borderRadius:16, padding:28 }}>
          <div style={{ display:"flex", gap:0, marginBottom:22, background:T.bg0, borderRadius:10, padding:4 }}>
            {[["login","Sign In"],["signup","Create Account"]].map(function(item) {
              return (
                <button key={item[0]} onClick={function(){ setMode(item[0]); setError(""); }} style={{ flex:1, padding:"8px", background:mode===item[0]?T.blue + "22":"transparent", border:"1px solid " + (mode===item[0]?T.blue:"transparent"), borderRadius:7, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:mode===item[0]?600:400, color:mode===item[0]?T.blue:T.txt1, transition:"all 0.15s" }}>
                  {item[1]}
                </button>
              );
            })}
          </div>
          {mode === "signup" && (
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", color:T.txt2, marginBottom:6 }}>Display Name</div>
              <input value={name} onChange={function(e){ setName(e.target.value); }} placeholder="Your name (optional)" style={inputStyle} onKeyDown={function(e){ if (e.key==="Enter") handleSubmit(); }} />
            </div>
          )}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", color:T.txt2, marginBottom:6 }}>Email Address</div>
            <input type="email" value={email} onChange={function(e){ setEmail(e.target.value); setError(""); }} placeholder="you@example.com" style={inputStyle} onKeyDown={function(e){ if (e.key==="Enter") handleSubmit(); }} />
          </div>
          {error && (
            <div style={{ fontSize:11, color:T.red, background:T.red + "10", border:"1px solid " + T.red + "33", borderRadius:8, padding:"8px 12px", marginBottom:12 }}>
              {error}
            </div>
          )}
          {/* Remember me */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, cursor:"pointer" }} onClick={function(){ setRememberMe(!rememberMe); }}>
            <div style={{ width:16, height:16, borderRadius:4, border:"1.5px solid " + (rememberMe ? T.blue : T.border), background:rememberMe ? T.blue + "22" : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>
              {rememberMe && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: T.blue }}/></svg>}
            </div>
            <span style={{ fontSize:12, color:T.txt1 }}>Stay signed in on this device</span>
          </div>

          <button onClick={handleSubmit} disabled={loading || !email.trim()} style={{ width:"100%", padding:"13px", borderRadius:10, fontFamily:"inherit", fontSize:13, fontWeight:600, cursor:loading||!email.trim()?"not-allowed":"pointer", background:loading||!email.trim()?T.bg2:"linear-gradient(135deg," + T.blue + "22," + T.blue + "11)", border:"1px solid " + (loading||!email.trim()?T.border:T.blue), color:loading||!email.trim()?T.txt2:T.blue, transition:"all 0.2s" }}>
            {loading ? "Loading..." : mode==="login" ? "→ Sign In" : "→ Create Account"}
          </button>
          {mode === "login" && knownUsers.length > 0 && (
            <div style={{ marginTop:16, paddingTop:14, borderTop:"1px solid " + T.border }}>
              <div style={{ fontSize:10, color:T.txt2, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em" }}>Recent accounts</div>
              {knownUsers.slice(0,4).map(function(u) {
                return (
                  <button key={u} onClick={function(){ setEmail(u); }} style={{ display:"block", width:"100%", padding:"7px 10px", background:T.bg0, border:"1px solid " + T.border, borderRadius:7, cursor:"pointer", fontFamily:"inherit", fontSize:11, color:T.txt1, textAlign:"left", marginBottom:5 }}>
                    {u}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div style={{ textAlign:"center", marginTop:16, fontSize:11, color:T.txt2, lineHeight:1.7 }}>
          Your world is saved to your account. Sign in from any device.
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function HumanityLabs() {
  const [themeKey, setThemeKey] = useState("abyss");
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [personas, setPersonas] = useState(function(){ return DEFAULTS.map(function(p){ return Object.assign({}, p); }); });
  const [rounds, setRounds] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [tab, setTab] = useState("world");
  const [showWizard, setShowWizard] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");
  const saveTimer = useRef(null);

  useEffect(function() { applyTheme(themeKey); }, [themeKey]);

  useEffect(function() {
    (async function() {
      try {
        const r = await window.storage.get(SESSION_KEY);
        if (r) {
          const session = JSON.parse(r.value);
          const email = session.email;
          const theme = session.theme;
          if (theme && THEMES[theme]) setThemeKey(theme);
          const data = await loadUserData(email);
          if (data) {
            setUser({ email:email, displayName:data.displayName || email.split("@")[0] });
            if (data.personas && data.personas.length) {
            setPersonas(data.personas);
            setSelectedIds(data.personas.map(function(p){ return p.id; }));
          }
            if (data.rounds && data.rounds.length) setRounds(data.rounds);
          }
        }
      } catch(e) {}
      setAuthLoading(false);
    })();
  }, []);

  useEffect(function() {
    if (!user) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    saveTimer.current = setTimeout(async function() {
      try {
        await saveUserData(user.email, personas, rounds);
        try { await window.storage.set(SESSION_KEY, JSON.stringify({ email:user.email, theme:themeKey })); } catch(e) {}
        setSaveStatus("saved");
        setTimeout(function(){ setSaveStatus(""); }, 2000);
      } catch(e) { setSaveStatus("error"); }
    }, 2000);
    return function(){ clearTimeout(saveTimer.current); };
  }, [personas, rounds, user]);

  const handleLogin = useCallback(async function(email, loadedPersonas, loadedRounds, displayName) {
    setUser({ email:email, displayName:displayName });
    const ps = loadedPersonas && loadedPersonas.length ? loadedPersonas : DEFAULTS.map(function(p){ return Object.assign({}, p); });
    setPersonas(ps);
    setSelectedIds(ps.map(function(p){ return p.id; }));
    setRounds(loadedRounds || []);
    try { await window.storage.set(SESSION_KEY, JSON.stringify({ email:email, theme:themeKey })); } catch(e) {}
    if (!loadedPersonas || !loadedPersonas.length) setShowOnboarding(true);
  }, [themeKey]);

  const handleLogout = useCallback(async function() {
    try { await window.storage.delete(SESSION_KEY); } catch(e) {}
    setUser(null);
    setPersonas(DEFAULTS.map(function(p){ return Object.assign({}, p); }));
    setRounds([]);
    setTab("world");
  }, []);

  const handleClearData = useCallback(async function() {
    if (!user) return;
    try {
      await saveUserData(user.email, [], []);
    } catch(e) {}
    setPersonas([]);
    setRounds([]);
    setTab("world");
  }, [user]);

  const addPersonas = useCallback(function(newPs) {
    setPersonas(function(prev) {
      const map = new Map(prev.map(function(p){ return [p.id, p]; }));
      newPs.forEach(function(p) { const id = p.id || uid(); map.set(id, Object.assign({}, p, { id:id })); });
      return [...map.values()];
    });
    // Auto-select newly added personas for simulation
    setSelectedIds(function(prev) {
      const newIds = newPs.map(function(p){ return p.id || ""; }).filter(Boolean);
      return Array.from(new Set(prev.concat(newIds)));
    });
  }, []);

  const savePersona = useCallback(function(p) {
    setPersonas(function(prev) {
      const exists = prev.find(function(x){ return x.id===p.id; });
      return exists ? prev.map(function(x){ return x.id===p.id ? p : x; }) : prev.concat([p]);
    });
    setShowWizard(false);
    setEditTarget(null);
  }, []);

  const openEdit = useCallback(function(p) { setEditTarget(p); setShowWizard(true); }, []);
  const deletePersona = useCallback(function(id) { setPersonas(function(prev){ return prev.filter(function(p){ return p.id!==id; }); }); }, []);
  const TABS = [["world","◎ World"],["library","⬡ Library"],["timeline","◈ Timeline"]];

  if (showSplash) {
    return (
      <div style={{ fontFamily:"Inter,sans-serif" }}>
        <style>{buildCss(themeKey)}</style>
        <SplashScreen onDone={function(){ setShowSplash(false); }} theme={themeKey} />
      </div>
    );
  }

  if (authLoading) {
    return (
      <div style={{ fontFamily:"Inter,sans-serif", background:"var(--c-bg0)", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <style>{buildCss(themeKey)}</style>
        <div style={{ textAlign:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center", marginBottom:14 }}>
            <div style={{ position:"relative", width:36, height:36, flexShrink:0 }}>
              <img src={EARTH_IMG} style={{ width:36, height:36, borderRadius:"50%", objectFit:"cover",
                WebkitMaskImage:"radial-gradient(circle at center,black 50%,rgba(0,0,0,0.5) 68%,transparent 80%)",
                maskImage:"radial-gradient(circle at center,black 50%,rgba(0,0,0,0.5) 68%,transparent 80%)",
                filter:"brightness(1.05) saturate(1.1)", display:"block" }} />
              <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"radial-gradient(circle,transparent 52%,rgba(40,140,255,0.2) 66%,transparent 76%)" }} />
              <div style={{ position:"absolute", top:"50%", left:"50%", width:0, height:0, animation:"orbitSmall 8s linear infinite" }}>
                <div style={{ position:"absolute", width:6, height:6, borderRadius:"50%", background:"linear-gradient(145deg,#ccc8c0,#8a8880)", transform:"translate(-3px,-3px)" }} />
              </div>
            </div>
            <div style={{ lineHeight:0.9 }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, letterSpacing:"-0.02em",
                background:"linear-gradient(120deg,var(--c-blue) 0%,#ddeeff 45%,var(--c-purple) 100%)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>MY HUMANITY</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, letterSpacing:"-0.015em",
                background:"linear-gradient(120deg,var(--c-purple) 0%,#ddeeff 45%,var(--c-blue) 100%)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>LAB</div>
            </div>
          </div>
          <div style={{ fontSize:11, color:T.txt2, animation:"pulse 1.2s ease infinite", letterSpacing:"0.1em" }}>LOADING YOUR WORLD...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} themeKey={themeKey} />;
  }

  if (showWizard) {
    return (
      <div style={{ fontFamily:"Inter,sans-serif", background:"var(--c-bg0)", height:"100vh", color:T.txt0 }}>
        <style>{buildCss(themeKey)}</style>
        <PersonaWizard allPersonas={personas} onSave={savePersona} onCancel={function(){ setShowWizard(false); setEditTarget(null); }} editTarget={editTarget} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily:"Inter,sans-serif", background:"var(--c-bg0)", minHeight:"100vh", color:T.txt0, display:"flex", flexDirection:"column" }}>
      <style>{buildCss(themeKey)}</style>

      {/* ── HEADER ── */}
      <div style={{ background:"linear-gradient(180deg," + T.bg1 + " 0%," + T.bg1 + "f8 100%)", borderBottom:"1px solid " + T.border, flexShrink:0, position:"sticky", top:0, zIndex:10, backdropFilter:"blur(20px)" }}>
        <div style={{ padding:"0 14px", display:"flex", alignItems:"center", height:52, gap:10 }}>
          {/* Logo — Earth + moon orbit + gradient title */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              {/* Mini Earth with orbiting moon */}
              <div style={{ position:"relative", width:32, height:32, flexShrink:0 }}>
                <img src={EARTH_IMG}
                  style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover", objectPosition:"center",
                    WebkitMaskImage:"radial-gradient(circle at center,black 50%,rgba(0,0,0,0.6) 68%,transparent 80%)",
                    maskImage:"radial-gradient(circle at center,black 50%,rgba(0,0,0,0.6) 68%,transparent 80%)",
                    filter:"brightness(1.05) saturate(1.1)", display:"block" }}
                />
                {/* Atmosphere */}
                <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"radial-gradient(circle,transparent 52%,rgba(40,140,255,0.22) 66%,transparent 76%)" }} />
                {/* Orbiting moon */}
                <div style={{ position:"absolute", top:"50%", left:"50%", width:0, height:0, animation:"orbitSmall 8s linear infinite" }}>
                  <div style={{ position:"absolute", width:7, height:7, borderRadius:"50%",
                    background:"linear-gradient(145deg,#ccc8c0,#8a8880)",
                    boxShadow:"inset -1px -1px 3px rgba(0,0,0,0.55),inset 0.5px 0.5px 2px rgba(255,255,255,0.18)",
                    transform:"translate(-3.5px,-3.5px)" }} />
                </div>
              </div>
              {/* Gradient title — same palette as splash */}
              <div style={{ lineHeight:0.9 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:800, letterSpacing:"-0.02em",
                  background:"linear-gradient(120deg,var(--c-blue) 0%,#ddeeff 45%,var(--c-purple) 100%)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>MY HUMANITY</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:800, letterSpacing:"-0.015em",
                  background:"linear-gradient(120deg,var(--c-purple) 0%,#ddeeff 45%,var(--c-blue) 100%)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>LAB</div>
              </div>
            </div>
            <div style={{ fontSize:9, color:T.txt2, letterSpacing:"0.06em", marginTop:3, fontFamily:"'DM Sans',sans-serif" }}>{personas.length} agents · {rounds.length} rounds</div>
          </div>

          {/* Icon action bar */}
          <div style={{ display:"flex", gap:4, alignItems:"center" }}>
            {/* Save indicator */}
            {saveStatus === "saving" && <div style={{ width:6, height:6, borderRadius:"50%", background:T.amber, animation:"pulse 1s ease infinite" }} />}
            {saveStatus === "saved" && <div style={{ width:6, height:6, borderRadius:"50%", background:T.green }} />}

            {/* Download — only when there's data */}
            {rounds.length > 0 && (
              <div style={{ display:"flex", gap:3 }}>
                <IconBtn onClick={function(){ exportReport(personas, rounds); }} title="Download Report" icon={
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                } />
              </div>
            )}

            {/* Add persona */}
            <button onClick={function(){ setEditTarget(null); setShowWizard(true); }} title="Add Persona" style={{ display:"flex", alignItems:"center", gap:5, padding:"0 12px", height:32, background:"linear-gradient(135deg," + T.green + "18," + T.green + "0c)", border:"1px solid " + T.green + "55", borderRadius:99, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, color:T.green, letterSpacing:"0.01em", transition:"all 0.2s", flexShrink:0 }}>
              <span style={{ fontSize:14, lineHeight:1 }}>+</span>
              <span>Add</span>
            </button>

            {/* Theme picker */}
            <ThemePicker current={themeKey} onChange={function(k){ setThemeKey(k); applyTheme(k); }} />

            {/* Help */}
            <IconBtn onClick={function(){ setShowOnboarding(true); }} title="Tour" icon={
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/><path d="M7 6.5v3M7 4.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            } />

            {/* User avatar + logout */}
            <div style={{ position:"relative" }}>
              <UserMenu user={user} onLogout={handleLogout} onClearData={handleClearData} personaCount={personas.length} roundCount={rounds.length} />
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ flex:1, overflowY:"auto", padding:"14px 14px 80px" }}>
        {tab === "world" && <WorldView personas={personas} setPersonas={setPersonas} selectedIds={selectedIds} setSelectedIds={setSelectedIds} rounds={rounds} setRounds={setRounds} onEdit={openEdit} onDelete={deletePersona} onNavigate={setTab} />}
        {tab === "library" && <LibraryView onAddPersonas={addPersonas} existingPersonas={personas} onNavigate={setTab} />}
        
        {tab === "timeline" && <TimelineView personas={personas} rounds={rounds} />}
      </div>

      {/* ── BOTTOM NAV (mobile-first) ── */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:20, background:T.bg1 + "f0", borderTop:"1px solid " + T.border, backdropFilter:"blur(20px)", display:"flex", padding:"6px 0 max(6px,env(safe-area-inset-bottom))" }}>
        {TABS.map(function(item) {
          const id = item[0];
          const tabIcons = { world:"◎", library:"⬡", timeline:"◈" };
          const tabLabels = { world:"World", library:"Library", timeline:"Timeline" };
          const isActive = tab === id;
          return (
            <button key={id} onClick={function(){ setTab(id); }} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"6px 4px", background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", color: isActive ? T.blue : T.txt2, transition:"all 0.2s" }}>
              <div style={{ fontSize:18, lineHeight:1, transition:"transform 0.2s", transform: isActive ? "scale(1.15)" : "scale(1)" }}>{tabIcons[id]}</div>
              <div style={{ fontSize:9, fontWeight: isActive ? 700 : 400, letterSpacing:"0.04em", textTransform:"uppercase" }}>{tabLabels[id]}</div>
              {isActive && <div style={{ width:16, height:2, background:T.blue, borderRadius:99, boxShadow:"0 0 6px " + T.blue + "88" }} />}
            </button>
          );
        })}
      </div>

      {showOnboarding && <OnboardingOverlay onClose={function(){ setShowOnboarding(false); }} />}
    </div>
  );
}
