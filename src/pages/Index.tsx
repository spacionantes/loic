import { useEffect, useState, type ComponentType, Component, type ReactNode } from "react";
import { ClipboardCheck, Lightbulb, Handshake, ArrowRight, Building2, Heart, ChevronDown, CheckCircle } from "lucide-react";
import { Typewriter } from "@/components/ui/typewriter-text";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { useListings } from "@/hooks/useListings";

class SplineErrorBoundary extends Component<{ children: ReactNode; onError?: () => void }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; onError?: () => void }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    this.props.onError?.();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const SplineScene = () => {
  const [SplineComponent, setSplineComponent] = useState<ComponentType<{ scene: string }> | null>(null);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Delay loading to let the rest of the page render first and free up GPU resources
    const timer = setTimeout(() => {
      let mounted = true;
      import("@splinetool/react-spline")
        .then((mod) => {
          if (mounted) {
            setSplineComponent(() => mod.default as ComponentType<{ scene: string }>);
            // Give the component a moment before making it visible
            setTimeout(() => mounted && setVisible(true), 100);
          }
        })
        .catch(() => {
          if (mounted) setFailed(true);
        });

      return () => { mounted = false; };
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (failed || !SplineComponent) return null;

  return (
    <SplineErrorBoundary onError={() => setFailed(true)}>
      <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease" }} className="w-full h-full">
        <SplineComponent scene="https://prod.spline.design/P521XWBOsGLegwiX/scene.splinecode" />
      </div>
    </SplineErrorBoundary>
  );
};

const steps = [
  {
    icon: ClipboardCheck,
    title: "Explorez les espaces",
    description: "Parcourez nos offres. Un espace vous plaît ? Envoyer une demande, nous vous recontacterons dans les 24h.",
    color: "bg-pastel-blue",
    number: "01"
  },
  {
    icon: Lightbulb,
    title: "Faites vous conseiller",
    description: "Spacio prend le relais : nous vérifions la compatibilité d'usage, et nous nous occupons de tous les détails.",
    color: "bg-pastel-orange",
    number: "02"
  },
  {
    icon: Handshake,
    title: "Rencontrez vous ! ",
    description: "Nous organisons la mise en relation avec le propriétaire de l'espace. Une fois la rencontre validée, tout est prêt pour accueillir vos activités !",
    color: "bg-pastel-green",
    number: "03"
  }
];




const Index = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: spaces = [] } = useListings();

  const spaceTypes = [
    { label: "Tout voir", value: "" },
    ...[...new Set(spaces.map((s) => s.type))].sort().map((t) => ({ label: t, value: t })),
  ];

  return (
    <Layout>
    {/* Hero */}
    <section className="relative z-10 bg-[rgb(10,10,40)] py-20 border-0 mx-0 lg:py-0">
      <div className="container">
        <div className="relative">
          {/* Spline 3D — full background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -right-[5%] top-1/2 -translate-y-1/2 w-[65%] h-[100%] lg:w-[55%] lg:h-[120%]">
              <SplineScene />
            </div>
          </div>

          {/* Text + dropdown — foreground */}
          <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative z-10 text-left py-16 lg:py-24 max-w-2xl ml-4 lg:ml-16">
              
            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Trouvez l'espace{" "}
              <span className="inline-block whitespace-nowrap align-bottom" style={{ minWidth: "4.5em" }}>
                <Typewriter
                  text={["parfait", "idéal", "adapté"]}
                  speed={120}
                  deleteSpeed={60}
                  delay={2000}
                  loop={true}
                  cursor="|"
                  className="text-gradient-primary italic font-serif"
                />
              </span>
              <br className="hidden lg:block" />
              pour votre association
            </h1>
            <p className="mb-10 max-w-xl text-lg text-justify font-light text-indigo-50">
              Spacio est un service clé en main qui met à disposition les locaux inutilisés de propriétaires d'espaces à destination des structures qui œuvrent pour le bien commun.
            </p>

            {/* Space type selector */}
            <div className="relative max-w-md">
              <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md px-6 py-4 text-left text-white shadow-lg transition-colors hover:bg-white/15">
                  
                <span className="text-base font-medium text-white/80">Quel type d'espace cherchez-vous ?</span>
                <ChevronDown className={`h-5 w-5 text-white/60 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen &&
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-white/15 bg-[hsl(230,50%,8%)]/95 shadow-2xl scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
                  
                  {spaceTypes.map((type) =>
                  <button
                    key={type.value}
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate(type.value ? `/explorer?type=${encodeURIComponent(type.value)}` : "/explorer");
                    }}
                    className="flex w-full items-center gap-3 px-6 py-3.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white">
                    
                      <Building2 className="h-4 w-4 text-primary/80" />
                      {type.label}
                    </button>
                  )}
                </motion.div>
                }
            </div>

            {/* Hero stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/55"
            >
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {spaces.length > 0 ? spaces.length : 14} espaces disponibles
              </span>
              <span className="hidden text-white/25 sm:inline">•</span>
              <span>Gratuit pour les associations</span>
              <span className="hidden text-white/25 sm:inline">•</span>
              <span>Réponse sous 24h</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* How it works */}
    <section id="how-it-works" className="bg-surface-alt py-20 lg:py-28">
      <div className="container">
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center">
            
          <h2 className="mb-3 text-3xl font-bold sm:text-4xl">Comment ça marche ?</h2>
          <p className="text-muted-foreground">Un accompagnement en 3 étapes clés</p>
        </motion.div>

        <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:items-stretch lg:gap-0">
          {steps.map((step, i) =>
            <div key={step.title} className="relative flex flex-1 flex-col items-center lg:flex-row">
              {/* Card */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.12 }}
                className="group relative w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 lg:max-w-none">
                
                {/* Step number */}
                <span className="absolute -top-4 left-6 inline-flex h-8 items-center rounded-full bg-gradient-to-r from-primary to-[hsl(270,60%,60%)] px-3 text-xs font-bold text-primary-foreground shadow-sm">
                  {step.number}
                </span>

                <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${step.color}`}>
                  <step.icon className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground text-left">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground text-justify">{step.description}</p>
              </motion.div>

              {/* Arrow connector */}
              {i < steps.length - 1 &&
              <>
                  {/* Desktop arrow */}
                  <div className="hidden lg:flex items-center justify-center px-4 shrink-0">
                    <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.2 + i * 0.12 }}
                    className="flex items-center gap-1">
                    
                      <div className="h-px w-8 bg-gradient-to-r from-border to-primary/40" />
                      <ArrowRight className="h-5 w-5 text-primary/60" />
                    </motion.div>
                  </div>
                  {/* Mobile arrow */}
                  <div className="flex lg:hidden items-center justify-center py-2">
                    <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.2 + i * 0.12 }}
                    className="flex flex-col items-center gap-1">
                    
                      <div className="w-px h-6 bg-gradient-to-b from-border to-primary/40" />
                      <ArrowRight className="h-5 w-5 text-primary/60 rotate-90" />
                    </motion.div>
                  </div>
                </>
              }
            </div>
            )}
        </div>
      </div>
    </section>

    {/* Solution for all */}
    <section className="py-20">
      <div className="container">
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center">

          <h2 className="mb-3 text-3xl font-bold sm:text-4xl">Une solution pour tous</h2>
          <p className="text-muted-foreground">Que vous soyez propriétaire ou association</p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Owners card */}
          <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm lg:p-10">

            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-pastel-orange">
              <Building2 className="h-6 w-6 text-foreground" />
            </div>
            <h3 className="mb-3 text-2xl font-bold">Propriétaires</h3>
            <p className="mb-6 leading-relaxed text-muted-foreground text-base text-justify">
              Valorisez vos espaces inutilisés en les mettant à disposition d'acteurs de l’ESS. Gérez vos réservations, fixez vos prix et contribuez à la vie locale.
            </p>
            <ul className="mb-6 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Renforcez concrètement vos engagements RSE</li>
              <li className="flex items-start gap-2"><CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Faites rayonner votre établissement</li>
              <li className="flex items-start gap-2"><CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Optimisez vos coûts en mutualisant vos charges</li>
              <li className="flex items-start gap-2"><CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Créez des synergies entre collaborateurs et bénéficiaires</li>
              <li className="flex items-start gap-2"><CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Donnez vie à vos espaces inoccupés</li>
            </ul>
            <Link
              to="/devenir-hote"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Proposer mon espace <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Associations card */}
          <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm lg:p-10">

            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-pastel-purple">
              <Heart className="h-6 w-6 text-foreground" />
            </div>
            <h3 className="mb-3 text-2xl font-bold">Associations</h3>
            <p className="mb-6 leading-relaxed text-muted-foreground text-base text-justify">Trouvez des espaces abordables et adaptés pour vos réunions, activités… Réservez en quelques clics et concentrez-vous sur l'essentiel.
              </p>
            <ul className="mb-6 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Trouvez rapidement un espace adapté à vos besoins</li>
              <li className="flex items-start gap-2"><CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Réservez simplement, en quelques clics</li>
              <li className="flex items-start gap-2"><CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Accédez à des tarifs solidaires et avantageux</li>
              <li className="flex items-start gap-2"><CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Créez des synergies entre bénéficiaires et acteurs locaux</li>
            </ul>
            <Link
              to="/explorer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Trouver un espace <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  </Layout>);

};


export default Index;