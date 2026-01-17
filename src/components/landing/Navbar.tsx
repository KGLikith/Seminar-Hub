import { Button } from "@/components/ui/button";
import { Calendar, Menu } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";


const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isSignedIn } = useAuth();
    const router = useRouter();


    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold text-foreground">SeminarBook</span>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        <a href="#features" className="text-foreground hover:text-primary transition-colors">
                            Features
                        </a>
                        <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors">
                            How It Works
                        </a>
                        <a href="#seminars" className="text-foreground hover:text-primary transition-colors">
                            Seminars
                        </a>
                    </div>

                    {!isSignedIn ?
                        <div className="hidden md:flex items-center gap-3">
                            <Button variant="ghost" onClick={() => router.push('/auth/sign-in')}>
                                Sign In
                            </Button>
                            <Button onClick={() => router.push('/auth/sign-up')}>
                                Sign Up
                            </Button>
                        </div> :
                        <>
                            <div className="hidden md:flex items-center gap-3">
                                <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                                    Dashboard
                                </Button>
                            </div>
                        </>
                    }

                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <Menu className="w-6 h-6 text-foreground" />
                    </button>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-border">
                        <div className="flex flex-col gap-4">
                            <a href="#features" className="text-foreground hover:text-primary transition-colors">
                                Features
                            </a>
                            <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors">
                                How It Works
                            </a>
                            <a href="#seminars" className="text-foreground hover:text-primary transition-colors">
                                Seminars
                            </a>
                            <div className="flex flex-col gap-2 pt-4 border-t border-border">
                                <Button variant="ghost" className="w-full">
                                    Sign In
                                </Button>
                                <Button className="w-full">
                                    Sign Up
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;