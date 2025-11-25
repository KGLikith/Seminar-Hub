import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, CheckCircle } from "lucide-react";

const upcomingSeminars = [
  {
    title: "Advanced Machine Learning Workshop",
    date: "Dec 15, 2025",
    time: "10:00 AM - 2:00 PM",
    hall: "Seminar Hall A",
    capacity: 100,
    status: "Approved",
    speaker: "Dr. Sarah Johnson",
  },
  {
    title: "Web Development Best Practices",
    date: "Dec 18, 2025",
    time: "2:00 PM - 5:00 PM",
    hall: "Seminar Hall B",
    capacity: 75,
    status: "Approved",
    speaker: "Prof. Michael Chen",
  },
  {
    title: "Data Science & Analytics Seminar",
    date: "Dec 20, 2025",
    time: "9:00 AM - 12:00 PM",
    hall: "Seminar Hall C",
    capacity: 120,
    status: "Pending",
    speaker: "Dr. Emily Roberts",
  },
];

const SeminarPreview = () => {
  return (
    <section id="seminars" className="py-24 bg-card">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Upcoming <span className="bg-linear-to-r from-primary to-accent-foreground bg-clip-text text-transparent">Seminars</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Preview scheduled seminars and their approval status
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {upcomingSeminars.map((seminar, index) => (
            <Card key={index} className="border-2 hover:border-primary transition-all duration-300 hover:shadow-xl">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge 
                    variant={seminar.status === "Approved" ? "default" : "secondary"}
                    className="mb-2"
                  >
                    {seminar.status === "Approved" && <CheckCircle className="w-3 h-3 mr-1" />}
                    {seminar.status}
                  </Badge>
                </div>
                <CardTitle className="text-xl leading-tight">
                  {seminar.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{seminar.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{seminar.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{seminar.hall}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Capacity: {seminar.capacity}</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium">Speaker: {seminar.speaker}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SeminarPreview;