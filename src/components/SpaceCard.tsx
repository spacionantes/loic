import { MapPin, Star, Users, User } from "lucide-react";
import type { Space } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";

const SpaceCard = ({ space }: { space: Space }) => (
  <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
    <div className="relative aspect-[4/3] overflow-hidden">
      <img
        src={space.image_url}
        alt={space.title}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      {/* Subtle bottom gradient for text legibility */}
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
      <h3 className="mb-1 font-semibold leading-snug text-foreground">{space.title}</h3>
      <div className="mb-1.5 flex items-center gap-1 text-sm text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{space.address}, {space.city}</span>
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
          <span className="text-xs text-muted-foreground">({space.reviews_count})</span>
        </div>
      </div>
    </div>
  </div>
);

export default SpaceCard;
