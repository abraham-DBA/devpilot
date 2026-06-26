import { AlertCircle, CheckCircle2, Clock, MessageSquare } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Activity = {
  id: string;
  project_id: string | null;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
};

type Props = {
  activities: Activity[];
};

export function ActivityFeed({ activities }: Props) {
  const getIcon = (message: string) => {
    const msg = message.toLowerCase();
    if (msg.includes("block")) {
      return (
        <div className="h-7 w-7 rounded-full bg-error-light text-error flex items-center justify-center border border-error-light shrink-0">
          <AlertCircle className="h-4 w-4" />
        </div>
      );
    }
    if (msg.includes("complete")) {
      return (
        <div className="h-7 w-7 rounded-full bg-success-lightest text-success flex items-center justify-center border border-success-light shrink-0">
          <CheckCircle2 className="h-4 w-4" />
        </div>
      );
    }
    return (
      <div className="h-7 w-7 rounded-full bg-info-light text-info flex items-center justify-center border border-info-light shrink-0">
        <Clock className="h-4 w-4" />
      </div>
    );
  };

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    
    // Format as: "Month Day, Year at Hours:Minutes"
    const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${formatDate(dateStr)} at ${time}`;
  };

  return (
    <div className="flex flex-col gap-4">
      {activities.length > 0 ? (
        <div className="relative border-l border-border pl-6 ml-3 flex flex-col gap-6">
          {activities.map((activity) => (
            <div key={activity.id} className="relative flex gap-3.5 items-start group">
              {/* Chronological node icon overlay */}
              <div className="absolute -left-[38px] top-0.5 bg-background transition-transform group-hover:scale-105">
                {getIcon(activity.message)}
              </div>

              {/* Event Content */}
              <div className="flex flex-col gap-0.5">
                <span className="text-sm text-text-primary font-medium leading-snug">
                  {activity.message}
                </span>
                <span className="text-[11px] text-text-secondary">
                  By <span className="font-semibold text-text-primary">{activity.user_name}</span> • {formatTimestamp(activity.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="border border-border border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center bg-surface-secondary gap-3">
          <div className="h-10 w-10 rounded-full bg-surface text-text-muted flex items-center justify-center border border-border">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="max-w-xs flex flex-col gap-0.5">
            <h4 className="text-xs font-bold text-text-primary">No Activity Logged</h4>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Major scope modifications, status completions, and blocker flags will display here chronologically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
