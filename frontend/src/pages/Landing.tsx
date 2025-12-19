import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Database,
  BarChart3,
  ArrowRight,
  Play,
  Check,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Globe,
  FileText,
  ChevronRight,
  Menu,
  X,
  Brain,
  Rocket,
  Lock,
  Building2,
  ShoppingCart,
  Stethoscope,
  GraduationCap,
  DollarSign,
  Code2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Newspaper,
  Video,
  Star,
  Quote,
  ChevronDown,
  Search,
  Mail,
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const cursorGlowRef = useRef<HTMLDivElement>(null);

  // Mouse tracking effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.left = `${e.clientX}px`;
        cursorGlowRef.current.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Features data
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Intelligence',
      description: 'Advanced GPT-4 integration understands context and generates precise insights',
      color: 'from-purple-500/20 to-cyan-500/20',
      iconColor: 'text-purple-400',
      delay: '0ms',
    },
    {
      icon: Zap,
      title: 'Lightning Performance',
      description: 'Redis-cached queries deliver results in under 2 seconds consistently',
      color: 'from-cyan-500/20 to-blue-500/20',
      iconColor: 'text-cyan-400',
      delay: '100ms',
    },
    {
      icon: Database,
      title: 'Universal Connectivity',
      description: 'Connect CSV, Excel, databases, APIs, and 15+ data source types seamlessly',
      color: 'from-blue-500/20 to-indigo-500/20',
      iconColor: 'text-blue-400',
      delay: '200ms',
    },
    {
      icon: BarChart3,
      title: 'Smart Visualizations',
      description: 'AI auto-generates the perfect chart type for your data every time',
      color: 'from-indigo-500/20 to-violet-500/20',
      iconColor: 'text-indigo-400',
      delay: '300ms',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption, SOC 2 compliance, and role-based access control',
      color: 'from-violet-500/20 to-purple-500/20',
      iconColor: 'text-violet-400',
      delay: '400ms',
    },
    {
      icon: Rocket,
      title: 'Scale Infinitely',
      description: 'Handle millions of rows with distributed processing and cloud scaling',
      color: 'from-emerald-500/20 to-cyan-500/20',
      iconColor: 'text-emerald-400',
      delay: '500ms',
    },
  ];

  // Stats data
  const stats = [
    { value: '2.5M+', label: 'Queries Processed', icon: BarChart3 },
    { value: '15K+', label: 'Active Users', icon: Users },
    { value: '99.99%', label: 'Uptime SLA', icon: Zap },
    { value: '<1.5s', label: 'Avg Response', icon: TrendingUp },
  ];

  // Use cases / Industries
  const useCases = [
    {
      icon: ShoppingCart,
      title: 'E-Commerce',
      description: 'Analyze sales trends, customer behavior, and inventory optimization in real-time',
      stats: '45% faster insights',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Stethoscope,
      title: 'Healthcare',
      description: 'Patient data analysis, treatment outcomes, and operational efficiency tracking',
      stats: '60% cost reduction',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: DollarSign,
      title: 'Finance',
      description: 'Risk analysis, portfolio performance, fraud detection, and compliance reporting',
      stats: '99.9% accuracy',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      icon: GraduationCap,
      title: 'Education',
      description: 'Student performance tracking, enrollment analytics, and resource allocation',
      stats: '30% efficiency gain',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Building2,
      title: 'Manufacturing',
      description: 'Supply chain optimization, quality control, and production analytics',
      stats: '40% waste reduction',
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Users,
      title: 'Marketing',
      description: 'Campaign ROI, customer segmentation, and conversion funnel analysis',
      stats: '3x ROI improvement',
      gradient: 'from-pink-500 to-rose-500',
    },
  ];

  // Integration partners
  const integrations = [
    { name: 'PostgreSQL', logo: Database, color: 'text-blue-400' },
    { name: 'MySQL', logo: Database, color: 'text-orange-400' },
    { name: 'Excel', logo: FileText, color: 'text-green-400' },
    { name: 'Google Sheets', logo: Globe, color: 'text-yellow-400' },
    { name: 'AWS S3', logo: Database, color: 'text-orange-500' },
    { name: 'MongoDB', logo: Database, color: 'text-emerald-400' },
    { name: 'REST APIs', logo: Code2, color: 'text-purple-400' },
    { name: 'Salesforce', logo: Building2, color: 'text-cyan-400' },
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Data Director at TechCorp',
      company: 'TechCorp',
      image: '👩‍💼',
      quote: 'InsightIQ reduced our data analysis time from hours to minutes. The AI-powered queries are incredibly accurate and save our team countless hours every week.',
      rating: 5,
    },
    {
      name: 'Michael Rodriguez',
      role: 'CEO at GrowthLabs',
      company: 'GrowthLabs',
      image: '👨‍💼',
      quote: 'We switched from Tableau and never looked back. InsightIQ is more intuitive, faster, and the natural language queries are a game-changer for our non-technical team.',
      rating: 5,
    },
    {
      name: 'Emily Thompson',
      role: 'Analytics Manager',
      company: 'RetailPro',
      image: '👩‍💻',
      quote: 'The real-time dashboard capabilities transformed how we make decisions. We can now respond to market changes within minutes instead of days.',
      rating: 5,
    },
  ];

  // Security features
  const securityFeatures = [
    { icon: Lock, title: 'End-to-End Encryption', description: 'AES-256 encryption for data at rest and in transit' },
    { icon: Shield, title: 'SOC 2 Type II Certified', description: 'Annual third-party security audits' },
    { icon: CheckCircle2, title: 'GDPR & CCPA Compliant', description: 'Full compliance with global data regulations' },
    { icon: Users, title: 'Role-Based Access', description: 'Granular permissions and access control' },
    { icon: AlertCircle, title: 'Automated Backups', description: 'Daily backups with point-in-time recovery' },
    { icon: Zap, title: 'Rate Limiting', description: 'Protection against abuse and DDoS attacks' },
  ];

  // FAQs
  const faqs = [
    {
      question: 'How does the AI-powered query system work?',
      answer: 'Our system uses GPT-4 to interpret your natural language questions. You simply type what you want to know, and our AI converts it into optimized database queries or pandas operations. The AI understands context, column relationships, and even suggests follow-up questions.',
    },
    {
      question: 'What data sources can I connect?',
      answer: 'InsightIQ supports 15+ data sources including CSV files, Excel spreadsheets, PostgreSQL, MySQL, MongoDB, SQLite, Google Sheets, REST APIs, and more. You can also connect to cloud storage like AWS S3 and Azure Blob.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use AES-256 encryption for data at rest and TLS 1.3 for data in transit. We\'re SOC 2 Type II certified, GDPR and CCPA compliant, and conduct regular security audits. Your data is never shared with third parties.',
    },
    {
      question: 'Do I need coding skills to use InsightIQ?',
      answer: 'No coding required! That\'s the beauty of InsightIQ. You can ask questions in plain English like "What was revenue last quarter?" and get instant visualizations. However, power users can also write custom SQL or Python queries if they prefer.',
    },
    {
      question: 'How fast are query results?',
      answer: 'Most queries return results in under 2 seconds thanks to our Redis caching layer and optimized query engine. Complex queries on large datasets typically complete in 5-10 seconds. We also support pagination for massive result sets.',
    },
    {
      question: 'Can I export my visualizations and reports?',
      answer: 'Yes! You can export dashboards and visualizations as PDF, PNG, or interactive HTML. Data can be exported as CSV, Excel, or JSON. You can also schedule automated reports to be emailed to your team.',
    },
    {
      question: 'What happens if I exceed my query limit?',
      answer: 'We never block your access. If you approach your monthly query limit, we\'ll send you a notification. You can always upgrade your plan or purchase additional query credits. There\'s no hard cutoff that stops your work.',
    },
    {
      question: 'Do you offer team collaboration features?',
      answer: 'Yes! Teams can share dashboards, queries, and data sources. You can add comments, create shared workspaces, and set granular permissions. Real-time collaboration features are coming soon.',
    },
  ];

  // Blog posts
  const blogPosts = [
    {
      title: '10 Ways AI is Transforming Data Analytics in 2024',
      excerpt: 'Discover how artificial intelligence is revolutionizing the way businesses analyze and interpret data...',
      category: 'AI & ML',
      readTime: '5 min read',
      image: '📊',
    },
    {
      title: 'Getting Started with Natural Language Queries',
      excerpt: 'Learn how to ask the right questions and get accurate insights from your data using plain English...',
      category: 'Tutorial',
      readTime: '8 min read',
      image: '🎓',
    },
    {
      title: 'Case Study: How TechCorp Increased Revenue by 45%',
      excerpt: 'A deep dive into how one company used InsightIQ to identify untapped revenue opportunities...',
      category: 'Case Study',
      readTime: '10 min read',
      image: '📈',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent" />
      </div>

      {/* Mouse Cursor Glow Effect */}
      <div
        ref={cursorGlowRef}
        className="fixed z-30 transition-opacity duration-300 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Floating Orbs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 blur-3xl animate-float" />
        <div className="absolute rounded-full top-1/3 right-1/4 w-96 h-96 bg-blue-500/20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute rounded-full bottom-1/4 left-1/3 w-96 h-96 bg-purple-500/20 blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <header
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled
              ? 'backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/50 shadow-lg shadow-cyan-500/5'
              : 'bg-transparent'
          }`}
        >
          <div className="px-6 py-4 mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div
                className="flex items-center space-x-3 cursor-pointer group"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <div className="relative flex items-center justify-center w-10 h-10 transition-all shadow-lg bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-cyan-500/30 group-hover:shadow-cyan-500/50 group-hover:scale-110">
                  <Sparkles className="w-6 h-6 text-white" />
                  <div className="absolute inset-0 transition-opacity opacity-50 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl blur group-hover:opacity-75" />
                </div>
                <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text">
                  InsightIQ
                </span>
              </div>

              {/* Desktop Navigation */}
              <nav className="items-center hidden space-x-8 md:flex">
                {['Features', 'Use Cases', 'Security', 'Resources'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    className="relative transition-colors text-slate-300 hover:text-white group"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 group-hover:w-full transition-all duration-300" />
                  </a>
                ))}
                <button
                  onClick={() => navigate('/login')}
                  className="transition-colors text-slate-300 hover:text-white"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="relative group bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2.5 rounded-xl font-medium overflow-hidden transition-all hover:scale-105"
                >
                  <div className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:opacity-100" />
                  <span className="relative z-10">Get Started Free</span>
                </button>
              </nav>

              {/* Mobile Menu Button */}
              <button
                className="p-2 transition-colors md:hidden text-slate-300 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="py-4 mt-4 border-t md:hidden border-slate-800/50 backdrop-blur-xl animate-slide-down">
                <nav className="flex flex-col space-y-4">
                  {['Features', 'Use Cases', 'Security', 'Resources'].map((item) => (
                    <a
                      key={item}
                      href={`#${item.toLowerCase().replace(' ', '-')}`}
                      className="transition-colors text-slate-300 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item}
                    </a>
                  ))}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-left transition-colors text-slate-300 hover:text-white"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2.5 rounded-xl font-medium text-center"
                  >
                    Get Started Free
                  </button>
                </nav>
              </div>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative px-6 pt-32 pb-20 overflow-hidden">
          <div className="mx-auto max-w-7xl">
            <div className="relative z-10 text-center">
              {/* Animated Badge */}
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/20 rounded-full px-5 py-2.5 mb-8 backdrop-blur-sm animate-fade-in hover:scale-105 transition-transform cursor-pointer group">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-sm font-medium text-cyan-300">
                  Powered by GPT-4 & Advanced AI
                </span>
                <ChevronRight className="w-4 h-4 transition-transform text-cyan-400 group-hover:translate-x-1" />
              </div>

              {/* Main Heading with Gradient Animation */}
              <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl lg:text-8xl animate-slide-up">
                <span className="text-white">Transform Data into</span>
                <br />
                <span className="inline-block text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text animate-gradient">
                  Actionable Insights
                </span>
              </h1>

              {/* Subheading */}
              <p className="max-w-4xl mx-auto mb-10 text-xl leading-relaxed md:text-2xl text-slate-300 animate-slide-up" style={{ animationDelay: '100ms' }}>
                Ask questions in natural language. Get instant AI-powered visualizations.
                <span className="block mt-2 font-semibold text-cyan-400">No coding required. No learning curve.</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col justify-center gap-4 mb-12 sm:flex-row animate-slide-up" style={{ animationDelay: '200ms' }}>
                <button
                  onClick={() => navigate('/signup')}
                  className="relative px-8 py-4 overflow-hidden text-lg font-semibold text-white transition-all group bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50"
                >
                  <div className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:opacity-100" />
                  <span className="relative z-10 flex items-center justify-center">
                    Start Free - No Credit Card
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
                <button 
                  onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                  className="relative flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all border group bg-slate-800/50 backdrop-blur-sm border-slate-700/50 rounded-xl hover:bg-slate-800 hover:border-cyan-500/50 hover:scale-105"
                >
                  <Play className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" />
                  Try Live Demo
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400 animate-fade-in" style={{ animationDelay: '300ms' }}>
                {[
                  { icon: Check, text: 'Free forever plan' },
                  { icon: Lock, text: 'No credit card required' },
                  { icon: Zap, text: 'Setup in 60 seconds' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 cursor-pointer group">
                    <div className="p-1 transition-colors rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20">
                      <item.icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="transition-colors group-hover:text-slate-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Dashboard Preview */}
            <div className="relative mt-20 animate-slide-up" style={{ animationDelay: '400ms' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-3xl" />
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl opacity-30 group-hover:opacity-50 blur transition-opacity" />
                <div className="relative p-8 border shadow-2xl bg-slate-900/90 backdrop-blur-2xl border-slate-700/50 rounded-3xl">
                  <div className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl h-96 backdrop-blur-xl">
                    <div className="grid w-full h-full grid-cols-3 gap-4">
                      <div className="relative col-span-2 group/card">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl opacity-0 group-hover/card:opacity-30 blur transition-opacity" />
                        <div className="relative flex flex-col justify-between h-full p-6 transition-all border bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20 rounded-xl backdrop-blur-sm hover:border-cyan-500/40">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex-1 space-y-2">
                              <div className="w-1/4 h-3 rounded bg-cyan-500/30 animate-pulse" />
                              <div className="w-1/3 h-2 rounded bg-slate-600/40" />
                            </div>
                            <TrendingUp className="w-8 h-8 text-cyan-400/60 animate-pulse" />
                          </div>
                          <div className="space-y-2">
                            {[60, 75, 50, 85, 70].map((width, i) => (
                              <div
                                key={i}
                                className="h-8 transition-all rounded bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-500/40 hover:to-blue-500/40"
                                style={{ width: `${width}%`, animationDelay: `${i * 100}ms` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {[
                          { icon: BarChart3, color: 'from-blue-500/10 to-indigo-500/10', border: 'border-blue-500/20' },
                          { icon: Zap, color: 'from-purple-500/10 to-pink-500/10', border: 'border-purple-500/20' },
                        ].map((card, i) => (
                          <div key={i} className="group/card relative h-[48%]">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl opacity-0 group-hover/card:opacity-30 blur transition-opacity" />
                            <div className={`relative bg-gradient-to-br ${card.color} border ${card.border} rounded-xl p-4 h-full flex flex-col justify-between backdrop-blur-sm hover:border-opacity-40 transition-all`}>
                              <card.icon className="w-6 h-6 text-cyan-400/60 animate-pulse" style={{ animationDelay: `${i * 500}ms` }} />
                              <div className="space-y-2">
                                <div className="w-2/3 h-2 rounded bg-slate-500/30 animate-pulse" />
                                <div className="w-1/2 h-4 rounded bg-slate-500/40" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative px-6 py-16">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 backdrop-blur-sm" />
          <div className="relative mx-auto max-w-7xl">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="relative group"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-50 blur transition-opacity" />
                  <div className="relative p-6 text-center transition-all border bg-slate-900/50 backdrop-blur-xl border-slate-800/50 rounded-2xl group-hover:border-cyan-500/50">
                    <stat.icon className="w-8 h-8 mx-auto mb-3 transition-transform text-cyan-400 group-hover:scale-110" />
                    <div className="mb-2 text-4xl font-bold text-transparent md:text-5xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <div className="inline-flex items-center px-5 py-2 mb-6 space-x-2 border rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-sm font-medium text-cyan-300">Features</span>
              </div>
              <h2 className="mb-4 text-4xl font-bold text-white md:text-6xl">
                Built for the <span className="text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">Modern Era</span>
              </h2>
              <p className="max-w-2xl mx-auto text-xl text-slate-400">
                Everything you need to turn data into decisions
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="relative group animate-slide-up"
                  style={{ animationDelay: feature.delay }}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-opacity" />
                  <div className="relative h-full p-8 transition-all border bg-slate-900/50 backdrop-blur-xl border-slate-800/50 rounded-2xl group-hover:border-cyan-500/50">
                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform backdrop-blur-sm`}>
                      <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-white transition-colors group-hover:text-cyan-400">
                      {feature.title}
                    </h3>
                    <p className="leading-relaxed text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="relative px-6 py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent" />
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <div className="inline-flex items-center px-5 py-2 mb-6 space-x-2 border rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/20 backdrop-blur-sm">
                <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-emerald-300">Simple Process</span>
              </div>
              <h2 className="mb-4 text-4xl font-bold text-white md:text-6xl">
                Get Started in <span className="text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text">60 Seconds</span>
              </h2>
              <p className="max-w-2xl mx-auto text-xl text-slate-400">
                From zero to insights faster than making coffee
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Connect Your Data',
                  description: 'Drop your CSV, Excel, or connect to any database. We handle the rest automatically.',
                  icon: Database,
                  color: 'from-cyan-500 to-blue-500',
                },
                {
                  step: '02',
                  title: 'Ask in Plain English',
                  description: '"What was revenue last quarter?" Our AI understands and generates the perfect query.',
                  icon: Sparkles,
                  color: 'from-blue-500 to-purple-500',
                },
                {
                  step: '03',
                  title: 'Get Visual Insights',
                  description: 'Beautiful charts appear instantly. Export, share, or dig deeper with one click.',
                  icon: BarChart3,
                  color: 'from-purple-500 to-pink-500',
                },
              ].map((step, i) => (
                <div key={i} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-opacity" />
                  <div className="relative h-full p-8 transition-all border bg-slate-900/50 backdrop-blur-xl border-slate-800/50 rounded-2xl group-hover:border-cyan-500/50">
                    <div className={`absolute -top-4 -left-4 w-14 h-14 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform`}>
                      {step.step}
                    </div>
                    <div className="mt-4 mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${step.color} opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:opacity-30 transition-opacity`}>
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-white transition-colors group-hover:text-cyan-400">
                      {step.title}
                    </h3>
                    <p className="leading-relaxed text-slate-400">
                      {step.description}
                    </p>
                    {i < 2 && (
                      <div className="absolute z-10 hidden transform -translate-y-1/2 md:block top-1/2 -right-4">
                        <ChevronRight className="w-8 h-8 transition-colors text-cyan-400/40 group-hover:text-cyan-400/80" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases / Industries Section */}
        <section id="use-cases" className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <div className="inline-flex items-center px-5 py-2 mb-6 space-x-2 border rounded-full bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-orange-500/20 backdrop-blur-sm">
                <Building2 className="w-4 h-4 text-orange-400 animate-pulse" />
                <span className="text-sm font-medium text-orange-300">Industries</span>
              </div>
              <h2 className="mb-4 text-4xl font-bold text-white md:text-6xl">
                Trusted Across <span className="text-transparent bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text">Every Industry</span>
              </h2>
              <p className="max-w-2xl mx-auto text-xl text-slate-400">
                Real results from companies just like yours
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {useCases.map((useCase, i) => (
                <div
                  key={i}
                  className="relative group"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${useCase.gradient} rounded-2xl opacity-0 group-hover:opacity-30 blur transition-opacity`} />
                  <div className="relative h-full p-8 transition-all border bg-slate-900/50 backdrop-blur-xl border-slate-800/50 rounded-2xl group-hover:border-slate-700/50">
                    <div className={`w-14 h-14 bg-gradient-to-br ${useCase.gradient} opacity-20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <useCase.icon className="text-white w-7 h-7" />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-white">
                      {useCase.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-slate-400">
                      {useCase.description}
                    </p>
                    <div className={`inline-flex items-center px-3 py-1.5 bg-gradient-to-r ${useCase.gradient} opacity-20 rounded-lg`}>
                      <TrendingUp className="w-4 h-4 mr-2 text-white" />
                      <span className="text-sm font-medium text-white">{useCase.stats}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Demo Section */}
        <section id="demo" className="relative px-6 py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent" />
          <div className="relative max-w-5xl mx-auto">
            <div className="mb-12 text-center">
              <div className="inline-flex items-center px-5 py-2 mb-6 space-x-2 border rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 backdrop-blur-sm">
                <Play className="w-4 h-4 text-green-400 animate-pulse" />
                <span className="text-sm font-medium text-green-300">Interactive Demo</span>
              </div>
              <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
                Try It <span className="text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text">Right Now</span>
              </h2>
              <p className="text-xl text-slate-400">
                No signup required. See the power of AI-powered analytics instantly.
              </p>
            </div>

            <div className="relative group">
              <div className="absolute transition-opacity -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 rounded-3xl opacity-30 group-hover:opacity-50 blur-xl" />
              <div className="relative p-8 border shadow-2xl bg-slate-900/90 backdrop-blur-2xl border-slate-700/50 rounded-3xl">
                {/* Demo Query Input */}
                <div className="mb-6">
                  <label className="block mb-3 text-sm font-medium text-slate-300">
                    Try asking a question:
                  </label>
                  <div className="relative">
                    <Search className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="What was the total revenue last quarter?"
                      className="w-full py-4 pl-12 pr-4 text-white transition border outline-none bg-slate-800/50 border-slate-700/50 rounded-xl placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                      defaultValue="What was the total revenue last quarter?"
                    />
                  </div>
                </div>

                {/* Sample Queries */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {[
                    'Show top 10 customers',
                    'Monthly revenue trend',
                    'Product category breakdown',
                  ].map((query) => (
                    <button
                      key={query}
                      className="px-4 py-2 text-sm transition border rounded-lg bg-cyan-500/10 border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20"
                    >
                      {query}
                    </button>
                  ))}
                </div>

                {/* Demo Result */}
                <div className="p-6 border bg-slate-800/50 border-slate-700/50 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Query Result</h3>
                    <span className="text-xs text-slate-400">Executed in 1.2s</span>
                  </div>
                  <div className="flex items-center justify-center h-48 p-6 border rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                    <div className="text-center">
                      <div className="mb-2 text-5xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                        $1,234,567
                      </div>
                      <div className="text-slate-400">Total Revenue Q4 2024</div>
                      <div className="flex items-center justify-center mt-3 text-emerald-400">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">+23% from Q3</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full py-3 mt-6 font-semibold text-white transition-all bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/30">
                  Sign Up to Unlock Full Access
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <div className="inline-flex items-center px-5 py-2 mb-6 space-x-2 border rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 backdrop-blur-sm">
                <Globe className="w-4 h-4 text-purple-400 animate-pulse" />
                <span className="text-sm font-medium text-purple-300">Integrations</span>
              </div>
              <h2 className="mb-4 text-4xl font-bold text-white md:text-6xl">
                Connect to <span className="text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text">Everything</span>
              </h2>
              <p className="max-w-2xl mx-auto text-xl text-slate-400">
                Seamlessly integrate with 15+ popular data sources
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {integrations.map((integration, i) => (
                <div
                  key={i}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-opacity" />
                  <div className="relative flex flex-col items-center justify-center h-32 p-6 text-center transition-all border bg-slate-900/50 backdrop-blur-xl border-slate-800/50 rounded-2xl group-hover:border-slate-700/50">
                    <integration.logo className={`w-10 h-10 ${integration.color} mb-3 group-hover:scale-110 transition-transform`} />
                    <span className="text-sm font-medium text-slate-300">{integration.name}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button className="inline-flex items-center transition-colors text-cyan-400 hover:text-cyan-300">
                View all 15+ integrations
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="relative px-6 py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/30 to-transparent" />
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <div className="inline-flex items-center px-5 py-2 mb-6 space-x-2 border rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20 backdrop-blur-sm">
                <Star className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-sm font-medium text-yellow-300">Customer Success</span>
              </div>
              <h2 className="mb-4 text-4xl font-bold text-white md:text-6xl">
                Loved by <span className="text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text">Data Teams</span>
              </h2>
              <p className="max-w-2xl mx-auto text-xl text-slate-400">
                See what our customers have to say
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {testimonials.map((testimonial, i) => (
                <div
                  key={i}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-opacity" />
                  <div className="relative h-full p-8 transition-all border bg-slate-900/50 backdrop-blur-xl border-slate-800/50 rounded-2xl group-hover:border-slate-700/50">
                    <Quote className="w-8 h-8 mb-4 text-cyan-400/30" />
                    <p className="mb-6 leading-relaxed text-slate-300">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center">
                      <div className="mr-4 text-4xl">{testimonial.image}</div>
                      <div>
                        <div className="font-semibold text-white">{testimonial.name}</div>
                        <div className="text-sm text-slate-400">{testimonial.role}</div>
                        <div className="flex mt-2">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <div className="inline-flex items-center px-5 py-2 mb-6 space-x-2 border rounded-full bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-500/20 backdrop-blur-sm">
                <Shield className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="text-sm font-medium text-red-300">Security & Compliance</span>
              </div>
              <h2 className="mb-4 text-4xl font-bold text-white md:text-6xl">
                <span className="text-transparent bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text">Enterprise-Grade</span> Security
              </h2>
              <p className="max-w-2xl mx-auto text-xl text-slate-400">
                Your data is protected with military-grade encryption
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {securityFeatures.map((feature, i) => (
                <div
                  key={i}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-opacity" />
                  <div className="relative p-6 transition-all border bg-slate-900/50 backdrop-blur-xl border-slate-800/50 rounded-2xl group-hover:border-slate-700/50">
                    <div className="flex items-center justify-center w-12 h-12 mb-4 transition-transform bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl group-hover:scale-110">
                      <feature.icon className="w-6 h-6 text-red-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <button className="inline-flex items-center transition-colors text-cyan-400 hover:text-cyan-300">
                Read our Security Whitepaper
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="mb-16 text-center">
              <div className="inline-flex items-center px-5 py-2 mb-6 space-x-2 border rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20 backdrop-blur-sm">
                <HelpCircle className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span className="text-sm font-medium text-indigo-300">FAQ</span>
              </div>
              <h2 className="mb-4 text-4xl font-bold text-white md:text-6xl">
                Frequently Asked <span className="text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text">Questions</span>
              </h2>
              <p className="text-xl text-slate-400">
                Everything you need to know about InsightIQ
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity" />
                  <div className="relative overflow-hidden border bg-slate-900/50 backdrop-blur-xl border-slate-800/50 rounded-2xl">
                    <button
                      onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                      className="flex items-center justify-between w-full p-6 text-left transition-colors hover:bg-slate-800/30"
                    >
                      <span className="pr-8 text-lg font-semibold text-white">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-cyan-400 flex-shrink-0 transition-transform ${
                          activeFaq === i ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {activeFaq === i && (
                      <div className="px-6 pb-6 leading-relaxed text-slate-400 animate-slide-down">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="mb-4 text-slate-400">Still have questions?</p>
              <button className="inline-flex items-center transition-colors text-cyan-400 hover:text-cyan-300">
                <Mail className="w-5 h-5 mr-2" />
                Contact Support
              </button>
            </div>
          </div>
        </section>

        {/* Resources / Blog Section */}
        <section id="resources" className="relative px-6 py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent" />
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <div className="inline-flex items-center px-5 py-2 mb-6 space-x-2 border rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20 backdrop-blur-sm">
                <BookOpen className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-sm font-medium text-blue-300">Resources</span>
              </div>
              <h2 className="mb-4 text-4xl font-bold text-white md:text-6xl">
                Learn & <span className="text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">Grow</span>
              </h2>
              <p className="max-w-2xl mx-auto text-xl text-slate-400">
                Guides, tutorials, and insights from our team
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {blogPosts.map((post, i) => (
                <div
                  key={i}
                  className="relative cursor-pointer group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-opacity" />
                  <div className="relative h-full overflow-hidden transition-all border bg-slate-900/50 backdrop-blur-xl border-slate-800/50 rounded-2xl group-hover:border-slate-700/50">
                    <div className="flex items-center justify-center h-48 text-6xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                      {post.image}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 text-xs font-medium border rounded-full bg-cyan-500/10 border-cyan-500/20 text-cyan-300">
                          {post.category}
                        </span>
                        <span className="text-xs text-slate-400">{post.readTime}</span>
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-white transition-colors group-hover:text-cyan-400">
                        {post.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-slate-400">
                        {post.excerpt}
                      </p>
                      <button className="inline-flex items-center mt-4 text-sm font-medium transition-colors text-cyan-400 hover:text-cyan-300">
                        Read More
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <button className="px-8 py-3 font-semibold text-white transition-all bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105">
                View All Articles
              </button>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="relative group">
              <div className="absolute transition-opacity opacity-50 -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl group-hover:opacity-75 blur-xl" />
              <div className="relative p-12 overflow-hidden text-center border bg-slate-900/90 backdrop-blur-2xl border-slate-700/50 rounded-3xl">
                <div className="absolute inset-0 opacity-50 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
                
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 mb-6 shadow-lg bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-cyan-500/50">
                    <Rocket className="w-10 h-10 text-white" />
                  </div>
                  
                  <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
                    Ready to Transform Your <span className="text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">Data Journey?</span>
                  </h2>
                  <p className="max-w-2xl mx-auto mb-8 text-xl text-slate-300">
                    Join 15,000+ users making data-driven decisions with AI-powered insights
                  </p>
                  
                  <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <button
                      onClick={() => navigate('/signup')}
                      className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all group/btn bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105"
                    >
                      Start Free - No Credit Card
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                    <button
                      onClick={() => navigate('/contact')}
                      className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all border bg-slate-800/50 backdrop-blur-sm border-slate-700/50 rounded-xl hover:bg-slate-800 hover:border-cyan-500/50"
                    >
                      Schedule Demo
                    </button>
                  </div>

                  <p className="mt-6 text-sm text-slate-400">
                    ✨ Free forever plan • ✨ Setup in 60 seconds • ✨ No credit card required
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative px-6 py-12 border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 mb-8 md:grid-cols-4">
              <div>
                <div className="flex items-center mb-4 space-x-3">
                  <div className="w-8 h-8 rounded-lg shadow-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-500/30" />
                  <span className="text-xl font-bold text-white">InsightIQ</span>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-slate-400">
                  AI-powered data analytics for modern teams. Transform your data into actionable insights.
                </p>
                <div className="flex space-x-4">
                  {[Globe, FileText, Video].map((Icon, i) => (
                    <a
                      key={i}
                      href="#"
                      className="flex items-center justify-center w-10 h-10 transition-all rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 hover:scale-110"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>

              {['Product', 'Company', 'Legal'].map((section, idx) => (
                <div key={section}>
                  <h4 className="mb-4 font-semibold text-white">{section}</h4>
                  <ul className="space-y-2">
                    {[
                      idx === 0 ? ['Features', 'Integrations', 'API', 'Changelog', 'Roadmap'] :
                      idx === 1 ? ['About', 'Blog', 'Careers', 'Contact', 'Press'] :
                      ['Privacy', 'Terms', 'Security', 'GDPR', 'Compliance']
                    ][0].map((item) => (
                      <li key={item}>
                        <a href="#" className="flex items-center text-sm transition-colors text-slate-400 hover:text-cyan-400 group">
                          <ChevronRight className="w-4 h-4 -ml-4 transition-all opacity-0 group-hover:opacity-100 group-hover:ml-0" />
                          <span className="transition-transform group-hover:translate-x-1">{item}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-between pt-8 border-t border-slate-800/50 md:flex-row">
              <div className="mb-4 text-sm text-slate-500 md:mb-0">
                © 2024 InsightIQ. Built with ❤️ for data teams worldwide.
              </div>
              <div className="flex items-center space-x-6 text-sm text-slate-400">
                <span className="flex items-center">
                  <div className="w-2 h-2 mr-2 rounded-full bg-emerald-400 animate-pulse" />
                  All systems operational
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;