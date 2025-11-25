import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

const features = [
  {
    title: "Easy Booking",
    description: "Teachers can quickly browse available seminar halls and book slots with just a few clicks. Real-time availability ensures no conflicts.",
    icon: "/booking-icon.jpg",
  },
  {
    title: "HOD Approval",
    description: "Department heads receive instant notifications for new requests and can approve or reject with detailed feedback and scheduling notes.",
    icon: "/approval-icon.jpg",
  },
  {
    title: "Tech Support",
    description: "Dedicated technical staff assigned to each hall ensures all equipment is ready. Request support directly through the platform.",
    icon: "/support-icon.jpg",
  },
  {
    title: "Smart Notifications",
    description: "Stay updated with email and in-app notifications for bookings, approvals, and upcoming seminars. Never miss an important update.",
    icon: "/notification-icon.jpg",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-card">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need in
            <span className="bg-linear-to-r from-primary to-accent-foreground bg-clip-text text-transparent"> One Platform</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            From booking to approval to technical support, we've got every aspect of seminar management covered.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg group">
              <CardContent className="p-6 space-y-4">
                <div
                  className="w-16 h-16 rounded-2xl overflow-hidden group-hover:scale-110 transition-transform duration-300 relative"
                >
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <h3 className="text-xl font-bold text-card-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;