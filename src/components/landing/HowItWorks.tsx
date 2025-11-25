import { CheckCircle2, UserCheck, Bell, Presentation } from "lucide-react";

const steps = [
  {
    icon: CheckCircle2,
    title: "Submit Request",
    description: "Teachers select a seminar hall, date, and time, then submit their booking request with seminar details.",
    color: "text-blue-500",
  },
  {
    icon: UserCheck,
    title: "HOD Review",
    description: "Department heads receive instant notifications and review requests with full context and scheduling information.",
    color: "text-green-500",
  },
  {
    icon: Bell,
    title: "Get Notified",
    description: "All parties receive email and in-app notifications about approval status and any updates or changes.",
    color: "text-purple-500",
  },
  {
    icon: Presentation,
    title: "Tech Support Ready",
    description: "Technical staff is automatically assigned and prepares the hall with required equipment before the seminar.",
    color: "text-orange-500",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How It <span className="bg-linear-to-r from-primary to-accent-foreground bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            A simple, streamlined process from booking to seminar day
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`w-20 h-20 rounded-2xl bg-card border-2 border-border flex items-center justify-center ${step.color}`}>
                    <Icon className="w-10 h-10" />
                  </div>
                  <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;