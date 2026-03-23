import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Lightbulb, ExternalLink, UtensilsCrossed } from "lucide-react";
import type { Activity } from "@/lib/types";

interface ActivityCardProps {
  activity: Activity;
  compact?: boolean;
}

export function ActivityCard({ activity, compact }: ActivityCardProps) {
  if (compact) {
    return (
      <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-sand/50 transition-colors">
        {/* Time */}
        {activity.time && (
          <div className="w-16 text-right">
            <span className="text-sm font-medium text-navy">{activity.time}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-navy">{activity.title}</p>
          {activity.location && (
            <p className="text-sm text-muted-foreground truncate">
              {activity.location}
            </p>
          )}
        </div>

        {/* Status Badge */}
        {activity.status === "TENTATIVE" && (
          <Badge variant="outline" className="text-xs">
            Tentative
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          {/* Time */}
          {activity.time && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {activity.time}
                {activity.end_time && ` - ${activity.end_time}`}
              </span>
            </div>
          )}

          {/* Title */}
          <h4 className="font-semibold text-navy text-lg">{activity.title}</h4>
        </div>

        {activity.status === "TENTATIVE" && (
          <Badge variant="outline">Tentative</Badge>
        )}
      </div>

      {/* Description */}
      {activity.description && (
        <p className="text-muted-foreground mb-3">{activity.description}</p>
      )}

      {/* Location */}
      {activity.location && (
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-teal" />
          <span className="text-sm text-navy">{activity.location}</span>
          {activity.location_url && (
            <a
              href={activity.location_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal hover:underline inline-flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="text-xs">Map</span>
            </a>
          )}
        </div>
      )}

      {/* Tags */}
      {activity.tags && activity.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {activity.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs bg-sand text-navy"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Tips */}
      {activity.tips && (
        <div className="p-3 bg-gold/10 rounded-lg flex items-start gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
          <p className="text-sm text-navy">{activity.tips}</p>
        </div>
      )}

      {/* Food Recommendations */}
      {activity.food_recommendations && (
        <div className="p-3 bg-coral/10 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <UtensilsCrossed className="w-4 h-4 text-coral" />
            <span className="font-medium text-navy text-sm">Food Tip</span>
          </div>
          <p className="text-sm text-navy">{activity.food_recommendations}</p>
        </div>
      )}

      {/* Restaurant Alternatives */}
      {activity.alternatives && activity.alternatives.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            Alternative options
          </p>
          <div className="space-y-2">
            {activity.alternatives.map((alt, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 bg-sand/50 rounded-lg"
              >
                <div>
                  <span className="font-medium text-navy text-sm">{alt.name}</span>
                  <span className="text-muted-foreground text-sm"> • {alt.cuisine}</span>
                </div>
                {alt.map_url && (
                  <a
                    href={alt.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal text-xs hover:underline"
                  >
                    Map
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
