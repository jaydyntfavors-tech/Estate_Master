import { CareerField, CareerWorkEvent, JobPosition } from '../types/game';

export const UNEMPLOYED_JOB: JobPosition = {
  id: 'job_unemployed',
  title: 'Unemployed (Job Hunting)',
  field: 'entry',
  tier: 0,
  monthlySalary: 0,
  requiredDegreeId: null,
  experienceMonthsRequired: 0,
  description: 'Currently without employment. Apply for a position in the Career & Life tab to rebuild your income stream!',
  stressRating: 35,
};

export const RETIRED_JOB: JobPosition = {
  id: 'job_retired',
  title: 'Retired Real Estate Tycoon',
  field: 'entry',
  tier: 5,
  monthlySalary: 2400, // Pension / Social Security
  requiredDegreeId: null,
  experienceMonthsRequired: 0,
  description: 'Officially retired from standard wage labor. Collecting $2,400/mo pension plus 100% passive cashflow from real estate and equities.',
  stressRating: 0,
};

export const CAREER_WORK_EVENTS_POOL: CareerWorkEvent[] = [
  {
    id: 'event_crunch_time',
    title: 'Critical Project Crunch & Overtime Call',
    scenario: 'Your division is facing an aggressive quarterly deadline. Senior leadership is calling for volunteers to pull overtime over the weekend to finish the client deliverables.',
    field: 'any',
    options: [
      {
        id: 'opt_crunch_lead',
        label: 'Lead the overtime push and rally your colleagues',
        description: 'Work grueling weekend hours to ensure the product ships flawlessly ahead of schedule.',
        outcomeText: 'Executive leadership noticed your exceptional dedication! The client was thrilled, and management rewarded you with an immediate cash bonus and a permanent salary raise.',
        bonusCash: 1200,
        monthlySalaryBonus: 250,
        stressChange: 15,
      },
      {
        id: 'opt_crunch_clockout',
        label: 'Clock out strictly at 5:00 PM to maintain work-life balance',
        description: 'Protect your peace of mind and spend the weekend scouting real estate deals instead.',
        outcomeText: 'You preserved your sanity and found some great property comps online. The team finished on time without drama.',
        stressChange: -10,
      },
      {
        id: 'opt_crunch_protest',
        label: 'Complain loudly on team channels and refuse to assist',
        description: 'Vocalize your frustration about poor management planning in front of the entire division.',
        outcomeText: 'HR and department heads flagged your conduct as insubordination. Your monthly paycheck has been docked for missed deliverables!',
        dockPayThisMonth: true,
        stressChange: 20,
      },
    ],
  },
  {
    id: 'event_client_presentation',
    title: 'High-Stakes Client Proposal',
    scenario: 'The lead presenter unexpectedly called in sick 20 minutes before a high-profile multi-million dollar client pitch. The director urgently asks who is ready to step up and present.',
    field: 'any',
    options: [
      {
        id: 'opt_pitch_hero',
        label: 'Seize the stage and pitch with confidence',
        description: 'Deliver the client pitch yourself, fielding tough questions with poise and commercial acumen.',
        outcomeText: 'You knocked it out of the park! The client signed an exclusive multi-year contract on the spot. You received an executive promotion and permanent raise!',
        bonusCash: 2000,
        monthlySalaryBonus: 450,
        stressChange: 10,
      },
      {
        id: 'opt_pitch_deck',
        label: 'Suggest emailing a written executive summary instead',
        description: 'Avoid the high-stakes presentation risk and propose sending documentation.',
        outcomeText: 'The client accepted the deck with lukewarm interest. Standard baseline operations continue without incident.',
        stressChange: 0,
      },
      {
        id: 'opt_pitch_botch',
        label: 'Winging it completely unprepared with fake metrics',
        description: 'Attempt the pitch without knowing the facts, bluffing the numbers as you go.',
        outcomeText: 'The client caught multiple false figures and walked out in fury. Leadership was humiliated: due to severe poor performance, you were fired from your job on the spot!',
        loseJob: true,
        stressChange: 35,
      },
    ],
  },
  {
    id: 'event_workplace_audit',
    title: 'Financial & Operational Compliance Audit',
    scenario: 'During a routine review of account ledgers, you uncover a suspicious accounting discrepancy where recurring billing errors were overcharging corporate accounts.',
    field: 'any',
    options: [
      {
        id: 'opt_audit_report',
        label: 'Draft a compliance brief and report it to the ethics board',
        description: 'Submit detailed documentation ensuring the company corrects the accounting error legally.',
        outcomeText: 'Your remarkable integrity saved the enterprise from millions in regulatory fines! The board awarded you a formal corporate ethics cash reward and a credit boost.',
        bonusCash: 2500,
        creditChange: 15,
        stressChange: -5,
      },
      {
        id: 'opt_audit_supervisor',
        label: 'Quietly hand the findings over to your direct supervisor',
        description: 'Let your manager take credit while keeping yourself out of the crossfire.',
        outcomeText: 'Your manager quietly resolved the ledger. You received a warm appreciation raise on your monthly paycheck.',
        monthlySalaryBonus: 150,
        stressChange: 0,
      },
      {
        id: 'opt_audit_skim',
        label: 'Attempt to exploit the loophole for personal reimbursement',
        description: 'Try to sneak through an unauthorized personal expense claim.',
        outcomeText: 'Internal forensic auditors caught your fraudulent claim within 48 hours. You were terminated immediately for gross misconduct and breach of trust!',
        loseJob: true,
        creditChange: -25,
        stressChange: 40,
      },
    ],
  },
  {
    id: 'event_boss_dispute',
    title: 'Strategic Clash With Management',
    scenario: 'Your direct manager proposes an outdated, inefficient operational workflow that will cause heavy delays. In an all-hands meeting, the team is asked for candid thoughts.',
    field: 'any',
    options: [
      {
        id: 'opt_dispute_solution',
        label: 'Present a modern, data-backed operational workflow',
        description: 'Politely demonstrate how modern automation and clear delegation can save 30% in operational costs.',
        outcomeText: 'The regional director was blown away by your strategic thinking! Your workflow was implemented company-wide, earning you a promotion and permanent pay raise.',
        bonusCash: 1500,
        monthlySalaryBonus: 350,
        stressChange: -5,
      },
      {
        id: 'opt_dispute_silent',
        label: 'Keep your head down and nod along with the manager',
        description: 'Avoid rocking the boat; do only what you are explicitly told.',
        outcomeText: 'Operations became clunky, but your manager appreciates your easy-going compliance. Standard work routine continues.',
        stressChange: 5,
      },
      {
        id: 'opt_dispute_shout',
        label: 'Publicly mock the manager\'s competence in front of everyone',
        description: 'Unleash your unfiltered frustration and call the proposed plan completely foolish.',
        outcomeText: 'Your outburst created a toxic scene. HR escorted you out of the building: you were terminated for insubordination and unprofessional conduct!',
        loseJob: true,
        stressChange: 30,
      },
    ],
  },
  {
    id: 'event_holiday_bonus_review',
    title: 'Annual Performance Appraisal',
    scenario: 'It is annual compensation review season. Your manager invites you into the office to discuss your achievements, compensation, and future with the company.',
    field: 'any',
    options: [
      {
        id: 'opt_review_bold',
        label: 'Present a portfolio of accomplishments and ask for a raise',
        description: 'Clearly document how your work contributed to revenue growth and operational reliability.',
        outcomeText: 'Your manager agreed with your strong case! You were granted an immediate year-end cash bonus plus a permanent monthly raise.',
        bonusCash: 1800,
        monthlySalaryBonus: 380,
        stressChange: -10,
      },
      {
        id: 'opt_review_modest',
        label: 'Politely accept the standard cost-of-living increment',
        description: 'Thank the company for steady employment without aggressive negotiations.',
        outcomeText: 'You received a steady cost-of-living bonus of $500. Consistent, drama-free progress.',
        bonusCash: 500,
        monthlySalaryBonus: 100,
        stressChange: 0,
      },
      {
        id: 'opt_review_slacker',
        label: 'Admit you have been distracted and doing the bare minimum',
        description: 'Show up late to the review with no notes or accomplishments to share.',
        outcomeText: 'Your manager was disappointed by your lack of engagement. Due to poor performance, your bonus was canceled and this month\'s paycheck docked!',
        dockPayThisMonth: true,
        stressChange: 20,
      },
    ],
  },
  {
    id: 'event_ai_automation',
    title: 'AI Automation & Technological Disruption',
    scenario: 'Corporate headquarters introduces a cutting-edge automation system and challenges employees to integrate it into daily operations to modernize efficiency.',
    field: 'any',
    options: [
      {
        id: 'opt_ai_champion',
        label: 'Master the tools and train colleagues to multiply output',
        description: 'Spend evenings mastering the technology and design automated scripts that save 20 hours a week.',
        outcomeText: 'You became the departmental efficiency superstar! Management awarded you a large innovation bonus and accelerated your promotion track.',
        bonusCash: 2200,
        monthlySalaryBonus: 500,
        stressChange: -5,
      },
      {
        id: 'opt_ai_adopt',
        label: 'Incorporate the new software into standard daily tasks',
        description: 'Use the technology as specified in corporate guidelines without extra fanfare.',
        outcomeText: 'You integrated the tools smoothly. Baseline productivity remains steady.',
        stressChange: 0,
      },
      {
        id: 'opt_ai_sabotage',
        label: 'Refuse to adapt and boycott the technological transition',
        description: 'Insist that the old manual ways are superior and refuse to complete mandatory training.',
        outcomeText: 'Management phased out redundant manual roles. Because of severe underperformance and resistance to change, you were laid off!',
        loseJob: true,
        stressChange: 25,
      },
    ],
  },
  {
    id: 'event_customer_dispute',
    title: 'High-Tension Customer Escalation',
    scenario: 'An aggressive, furious client storms in, shouting and threatening lawsuits over a damaged delivery. Nearby staff are freezing in panic.',
    field: 'any',
    options: [
      {
        id: 'opt_cust_deescalate',
        label: 'Step in with calm empathy and resolve the issue fairly',
        description: 'Diffuse the tension with active listening and offer an expedited resolution that protects company profits.',
        outcomeText: 'The client calmed down, thanked you sincerely, and commended your poise directly to the CEO! You received an employee excellence award.',
        bonusCash: 900,
        monthlySalaryBonus: 150,
        stressChange: -5,
      },
      {
        id: 'opt_cust_handover',
        label: 'Escalate the ticket to the corporate customer service helpline',
        description: 'Provide the helpline phone number and step away to avoid controversy.',
        outcomeText: 'Corporate handled the dispute. You returned to your regular duties without issue.',
        stressChange: 0,
      },
      {
        id: 'opt_cust_screamback',
        label: 'Lose your temper and scream back at the customer',
        description: 'Argue back aggressively and order them to get out of the premises.',
        outcomeText: 'The shouting match went viral on local social media. Corporate terminated your employment immediately to safeguard the brand reputation!',
        loseJob: true,
        stressChange: 35,
      },
    ],
  },
  {
    id: 'event_headhunter_poach',
    title: 'Surprise Executive Headhunter Inquiry',
    scenario: 'A top executive recruiter contacts you on LinkedIn offering a lucrative rival position with attractive sign-on compensation and benefits.',
    field: 'any',
    options: [
      {
        id: 'opt_poach_counter',
        label: 'Use the external offer to negotiate a counter-offer raise',
        description: 'Respectfully show your manager that your market value has increased and ask for a retention package.',
        outcomeText: 'Your company was eager to keep your talent! They matched the market rate, granting you a major permanent monthly raise and retention bonus.',
        bonusCash: 1500,
        monthlySalaryBonus: 600,
        stressChange: 5,
      },
      {
        id: 'opt_poach_decline',
        label: 'Politely decline the recruiter to maintain team stability',
        description: 'Reaffirm your commitment to your current company and projects.',
        outcomeText: 'Your director praised your loyalty and awarded you a spot loyalty bonus.',
        bonusCash: 600,
        stressChange: -5,
      },
      {
        id: 'opt_poach_leak',
        label: 'Accidentally reply-all including your boss with confidential terms',
        description: 'A clumsy email blunder forwards the rival offer to your whole management chain.',
        outcomeText: 'Your boss felt disrespected by the messy handling. Your year-end bonus was rescinded and your paycheck was docked for the distraction!',
        dockPayThisMonth: true,
        stressChange: 25,
      },
    ],
  },
];

/**
 * Returns a random career work event appropriate for the player's current status
 */
export function getRandomCareerEvent(): CareerWorkEvent {
  const randIndex = Math.floor(Math.random() * CAREER_WORK_EVENTS_POOL.length);
  return CAREER_WORK_EVENTS_POOL[randIndex];
}
