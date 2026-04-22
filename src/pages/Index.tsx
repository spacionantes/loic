import { useState } from "react";
import {
  ClipboardCheck,
  Lightbulb,
  Handshake,
  ArrowRight,
  Building2,
  Heart,
  ChevronDown,
  CheckCircle,
} from "lucide-react";
import { Typewriter } from "@/components/ui/typewriter-text";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { useListings } from "@/hooks/useListings";
import { MutualizationCanvas } from "@/components/MutualizationCanvas";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Explorez les espaces",
    description:
      "Parcourez nos offres. Un espace vous plaît ? Envoyer une demande, nous vous recontacterons dans les 24h.",
    color: "bg-pastel-blue",
    number: "01",
  },
  {
    icon: Lightbulb,
    title: "Faites vous conseiller",
    description:
      "Spacio prend le relais : nous vérifions la compatibilité d'usage, et nous nous occupons de tous les détails.",
    color: "bg-pastel-orange",
    number: "02",
  },
  {
    icon: Handshake,
    title: "Rencontrez vous !",
    description:
      "Nous organisons la mise en relation avec le propriétaire de l'espace. Une fois la rencontre validée, tout est prêt pour accueillir vos activités !",
    color: "bg-pastel-green",
    number: "03",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: spaces = [] } = useListings();

  const spaceTypes = [
    { label: "Tout voir", value: "" },
    ...[...new Set(spaces.map((s) => s.type))]
      .sort()
      .map((t) => ({ label: t, value: t })),
  ];

  return (
    <Layout>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-[rgb(8,8,32)]">
        {/* Living mutualization network canvas */}
        <MutualizationCanvas className="absolute inset-0 h-full w-full" />

        {/* Left readability fade */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgb(8,8,32)] via-[rgb(8,8,32)]/80 to-[rgb(8,8,32)]/10" />
        {/* Bottom fade into next section */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[rgb(8,8,32)] to-transparent" />

        {/* Content */}
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl py-20 lg:py-28"
          >
            {/* Pill tag */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              La plateforme de mutualisation d'espaces
            </motion.div>

            <h1 className="mb-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Trouvez l'espace{" "}
              <span
                className="inline-block whitespace-nowrap align-bottom"
                style={{ minWidth: "4.5em" }}
              >
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

            <p className="mb-10 max-w-xl text-lg font-light leading-relaxed text-white/75">
              Spacio est un service clé en main qui met à disposition les locaux
              inutilisés de propriétaires d'espaces à destination des structures
              qui œuvrent pour le bien commun.
            </p>

            {/* Space type selector */}
            <div className="relative max-w-md">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-left text-white shadow-lg backdrop-blur-md transition-colors hover:bg-white/15"
              >
                <span className="text-base font-medium text-white/80">
                  Quel type d'espace cherchez-vous ?
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-white/60 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-white/15 bg-[hsl(230,50%,8%)]/95 shadow-2xl backdrop-blur-xl"
                >
                  {spaceTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate(
                          type.value
                            ? `/explorer?type=${encodeURIComponent(type.value)}`
                            : "/explorer"
                        );
                      }}
                      className="flex w-full items-center gap-3 px-6 py-3.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <Building2 className="h-4 w-4 text-primary/80" />
                      {type.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/45"
            >
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#34d399]" />
                {spaces.length > 0 ? spaces.length : 14} espaces disponibles
              </span>
              <span className="hidden text-white/20 sm:inline">•</span>
              <span>Gratuit pour les associations</span>
              <span className="hidden text-white/20 sm:inline">•</span>
              <span>Réponse sous 24h</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 text-white/30"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase">
            Découvrir
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.div>

        {/* Network legend — bottom right */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="absolute bottom-8 right-6 hidden flex-col items-end gap-1.5 text-[11px] text-white/35 lg:flex"
        >
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-[rgb(251,146,60)]/70" />
            Espace disponible
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[rgb(129,140,248)]/70" />
            Association
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-px w-5 bg-gradient-to-r from-[rgb(251,146,60)] to-[rgb(129,140,248)]" />
            Mise en relation
          </span>
        </motion.div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section id="how-it-works" className="bg-surface-alt py-20 lg:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-3 text-3xl font-bold sm:text-4xl">
              Comment ça marche ?
            </h2>
            <p className="text-muted-foreground">
              Un accompagnement en 3 étapes clés
            </p>
          </motion.div>

          <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:items-stretch lg:gap-0">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="relative flex flex-1 flex-col items-center lg:flex-row"
              >
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.12 }}
                  className="group relative w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 lg:max-w-none"
                >
                  <span className="absolute -top-4 left-6 inline-flex h-8 items-center rounded-full bg-gradient-to-r from-primary to-[hsl(270,60%,60%)] px-3 text-xs font-bold text-primary-foreground shadow-sm">
                    {step.number}
                  </span>
                  <div
                    className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${step.color}`}
                  >
                    <step.icon className="h-6 w-6 text-foreground" />
                  </div>
                  <h3 className="mb-2 text-left text-lg font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-justify text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </motion.div>

                {i < steps.length - 1 && (
                  <>
                    <div className="hidden items-center justify-center px-4 lg:flex">
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.2 + i * 0.12 }}
                        className="flex items-center gap-1"
                      >
                        <div className="h-px w-8 bg-gradient-to-r from-border to-primary/40" />
                        <ArrowRight className="h-5 w-5 text-primary/60" />
                      </motion.div>
                    </div>
                    <div className="flex items-center justify-center py-2 lg:hidden">
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.2 + i * 0.12 }}
                        className="flex flex-col items-center gap-1"
                      >
                        <div className="h-6 w-px bg-gradient-to-b from-border to-primary/40" />
                        <ArrowRight className="h-5 w-5 rotate-90 text-primary/60" />
                      </motion.div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solution for all ──────────────────────────────── */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h2 className="mb-3 text-3xl font-bold sm:text-4xl">
              Une solution pour tous
            </h2>
            <p className="text-muted-foreground">
              Que vous soyez propriétaire ou association
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm lg:p-10"
            >
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-pastel-orange">
                <Building2 className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">Propriétaires</h3>
              <p className="mb-6 text-justify text-base leading-relaxed text-muted-foreground">
                Valorisez vos espaces inutilisés en les mettant à disposition
                d'acteurs de l'ESS. Gérez vos réservations, fixez vos prix et
                contribuez à la vie locale.
              </p>
              <ul className="mb-6 space-y-2.5 text-sm text-muted-foreground">
                {[
                  "Renforcez concrètement vos engagements RSE",
                  "Faites rayonner votre établissement",
                  "Optimisez vos coûts en mutualisant vos charges",
                  "Créez des synergies entre collaborateurs et bénéficiaires",
                  "Donnez vie à vos espaces inoccupés",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/devenir-hote"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                Proposer mon espace <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm lg:p-10"
            >
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-pastel-purple">
                <Heart className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">Associations</h3>
              <p className="mb-6 text-justify text-base leading-relaxed text-muted-foreground">
                Trouvez des espaces abordables et adaptés pour vos réunions,
                activités… Réservez en quelques clics et concentrez-vous sur
                l'essentiel.
              </p>
              <ul className="mb-6 space-y-2.5 text-sm text-muted-foreground">
                {[
                  "Trouvez rapidement un espace adapté à vos besoins",
                  "Réservez simplement, en quelques clics",
                  "Accédez à des tarifs solidaires et avantageux",
                  "Créez des synergies entre bénéficiaires et acteurs locaux",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/explorer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                Trouver un espace <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
