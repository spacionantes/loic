import { useState } from "react";
import { CheckCircle2, Building2, TrendingUp, Users, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";

const spaceTypes = [
  { value: "salle-reunion", label: "Salle de réunion" },
  { value: "atelier", label: "Atelier" },
  { value: "salle-evenementielle", label: "Salle événementielle" },
  { value: "coworking", label: "Coworking" },
  { value: "studio", label: "Studio" },
  { value: "autre", label: "Autre" },
];

const benefits = [
  {
    icon: TrendingUp,
    title: "Rentabilisez vos espaces vacants",
    description: "Générez des revenus complémentaires en louant vos surfaces inutilisées à des associations et organismes locaux.",
  },
  {
    icon: Users,
    title: "Renforcez votre impact local",
    description: "Contribuez à la vie associative de votre territoire en ouvrant vos portes à des projets à impact positif.",
  },
  {
    icon: Shield,
    title: "Un accompagnement sur mesure",
    description: "Nous gérons la mise en relation, la qualification des demandes et le suivi. Vous gardez le contrôle.",
  },
];

const DevenirHote = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    organization_name: "",
    space_type: "",
    city: "",
    email: "",
    phone: "",
    message: "",
  });

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const canSubmit = !!formData.email && !!formData.organization_name && !!formData.city;

  const handleSubmit = async () => {
    const { error } = await supabase.from("leads").insert({
      user_type: "owner",
      organization_name: formData.organization_name,
      space_type: formData.space_type || null,
      city: formData.city,
      email: formData.email,
      phone: formData.phone || null,
    });

    if (error) {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
      console.error("Lead insert error:", error);
      return;
    }

    supabase.functions.invoke("send-email", {
      body: {
        type: "space_confirmation",
        to: formData.email,
        data: { organization_name: formData.organization_name },
      },
    }).catch((err) => console.error("Email send error:", err));

    setSubmitted(true);
  };

  return (
    <Layout>
      <section className="py-16 lg:py-24">
        <div className="container">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start"
              >
                {/* Left – Pitch */}
                <div className="space-y-8">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
                      Pourquoi nous confier votre surface ?
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                      Vous disposez d'un espace sous-utilisé — salle de réunion, local, atelier ?
                      Spacio vous aide à le valoriser en le rendant accessible aux associations et organismes de votre territoire.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {benefits.map((benefit, i) => (
                      <motion.div
                        key={benefit.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i, duration: 0.4 }}
                        className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <benefit.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{benefit.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Right – Form */}
                <Card className="rounded-2xl shadow-md ring-1 ring-border/60">
                  <CardContent className="space-y-5 p-6 lg:p-8">
                    <div>
                      <h2 className="text-xl font-bold">Parlez-nous de votre espace</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Remplissez ce formulaire et nous vous recontacterons sous 24h.</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Nom / Société *</Label>
                      <Input
                        value={formData.organization_name}
                        onChange={(e) => update("organization_name", e.target.value)}
                        placeholder="Ex : SCI Martin"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Type d'espace</Label>
                      <Select value={formData.space_type} onValueChange={(v) => update("space_type", v)}>
                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>
                          {spaceTypes.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Ville *</Label>
                      <Input value={formData.city} onChange={(e) => update("city", e.target.value)} placeholder="Ex : Lyon" />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Email *</Label>
                      <Input type="email" value={formData.email} onChange={(e) => update("email", e.target.value)} placeholder="vous@exemple.com" />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Téléphone <span className="text-muted-foreground">(optionnel)</span></Label>
                      <Input type="tel" value={formData.phone} onChange={(e) => update("phone", e.target.value)} placeholder="06 00 00 00 00" />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Message <span className="text-muted-foreground">(optionnel)</span></Label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => update("message", e.target.value)}
                        placeholder="Décrivez brièvement votre espace, sa localisation, sa superficie…"
                        rows={3}
                      />
                    </div>

                    <Button
                      className="w-full rounded-2xl py-6 text-base font-semibold bg-gradient-to-r from-primary to-[hsl(270,60%,60%)] hover:opacity-90 transition-opacity border-0 shadow-lg shadow-primary/20"
                      disabled={!canSubmit}
                      onClick={handleSubmit}
                    >
                      Envoyer ma demande
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Vos données ne sont utilisées que pour vous recontacter.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="mx-auto max-w-md text-center py-16"
              >
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </div>
                <h2 className="mb-2 text-2xl font-bold">Merci !</h2>
                <p className="text-muted-foreground">
                  Nous avons bien reçu votre demande.<br />Notre équipe vous recontactera sous 24h pour échanger sur votre espace.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </Layout>
  );
};

export default DevenirHote;
