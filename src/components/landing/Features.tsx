import { ClipboardList, Brain, MessageCircle } from "lucide-react";

const features = [
  {
    icon: ClipboardList,
    title: "Log Decisions",
    description: "Track every choice you make and its outcomes. Build a comprehensive history of your decision-making journey.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Brain,
    title: "Discover Patterns",
    description: "AI analyzes your decision-making style, revealing hidden patterns and tendencies you never knew existed.",
    gradient: "from-purple-500 to-blue-600",
  },
  {
    icon: MessageCircle,
    title: "Ask Your Twin",
    description: "Get personalized advice based on your history. Your digital twin knows how you think and what you'd choose.",
    gradient: "from-blue-500 to-cyan-600",
  },
];

const Features = () => {
  return (
    <section id="features" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="gradient-text">Powerful Features</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to understand yourself better and make decisions with confidence.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative glass-card rounded-2xl p-8 hover:scale-[1.02] transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 from-primary to-accent" />

              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
