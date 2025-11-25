import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, hsl(var(--background) / 0.9), hsl(var(--background) / 0.95)), url(${'/hero-seminar.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}   
      />
      
      <div className="container relative z-10 px-4 py-16 mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 backdrop-blur-sm">
            <Calendar className="w-5 h-5 text-accent-foreground" />
            <span className="text-sm font-medium text-accent-foreground">Streamline Your Seminar Management</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-primary via-accent-foreground to-primary bg-clip-text text-transparent">
              Effortless Seminar
            </span>
            <br />
            <span className="text-foreground">Booking & Approval</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive platform for teachers to book seminars, HODs to approve requests, and tech staff to provide seamless support—all with instant notifications.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="text-lg px-8 py-6 rounded-xl" onClick={()=> router.push('/auth/sign-in ')}>
              Get Started
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground mt-1">Seminar Halls</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground mt-1">Teachers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground mt-1">Tech Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;