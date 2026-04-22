import { useRef } from "react";
import { MapPin, Star, Users, User } from "lucide-react";
import type { Space } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import type { MouseEvent } from "react";

const SpaceCard = ({ space }: { space: Space }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transition = "box-shadow 0.2s";
    el.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) translateY(-3px)`;
    el.style.boxShadow =
      "0 20px 40px rgba(0,0,0,0.11), 0 0 0 1px rgba(99,102,241,0.12)";
  };

  const onMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = "transform 0.5s ease, box-shadow 0.5s ease";
    el.style.transform = "";
    el.style.boxShadow = "";
  };

  return (
    <div
      ref={cardRef}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={space.image_url}
          alt={space.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Bottom gradient for legibility */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
        {/* Price — top right */}
        <Badge className="absolute right-3 top-3 rounded-xl bg-primary font-semibold text-primary-foreground shadow-md">
          {space.price_per_hour}€/h
        </Badge>
        {/* Type — top left */}
        <Badge className="absolute left-3 top-3 rounded-xl border-0 bg-white/90 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
          {space.type}
        </Badge>
      </div>

      <div className="p-4">
        <h3 className="mb-1 font-semibold leading-snug text-foreground">
          {space.title}
        </h3>
        <div className="mb-1.5 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {space.address}, {space.city}
          </span>
        </div>
        {space.host_name && (
          <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span>Hôte : {space.host_name}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {space.capacity}
            </span>
            <span>{space.surface_m2}m²</span>
          </div>
          <div className="flex items-center gap-1 font-medium text-foreground">
            <Star className="h-3.5 w-3.5 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
            {space.rating}
            <span className="text-xs text-muted-foreground">
              ({space.reviews_count})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceCard;
