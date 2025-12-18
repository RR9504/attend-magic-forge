import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Users, BarChart3, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';

export default function Index() {
  const features = [
    {
      icon: Calendar,
      title: 'Skapa event enkelt',
      description: 'Sätt upp professionella bokningssidor på några minuter med anpassade fält och bilder.',
    },
    {
      icon: Users,
      title: 'Hantera anmälningar',
      description: 'Få full kontroll över deltagarlistor med sökfunktion, filtrering och enkel export.',
    },
    {
      icon: BarChart3,
      title: 'Automatiska begränsningar',
      description: 'Sätt maxantal deltagare och låt systemet automatiskt stänga anmälan när det är fullt.',
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Snabbt & effektivt',
      description: 'Skapa event och hantera anmälningar på rekordtid.',
    },
    {
      icon: Shield,
      title: 'Professionellt intryck',
      description: 'Snygga bokningssidor som inger förtroende.',
    },
    {
      icon: Sparkles,
      title: 'Flexibla formulär',
      description: 'Anpassa vilken information du vill samla in.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="container relative mx-auto px-4 py-12 md:py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-accent/10 text-accent text-xs md:text-sm font-medium mb-6 md:mb-8 animate-fade-in">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
              Eventhantering för moderna organisationer
            </div>

            {/* Headline */}
            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6 animate-fade-in stagger-1 leading-tight">
              Skapa event.{' '}
              <span className="text-accent">Samla anmälningar.</span>{' '}
              Enklare än någonsin.
            </h1>

            {/* Subheadline */}
            <p className="text-base md:text-xl text-muted-foreground mb-8 md:mb-10 max-w-2xl mx-auto animate-fade-in stagger-2">
              En komplett plattform för att skapa professionella event med bokningssidor, 
              hantera deltagarlistor och exportera all data.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center animate-fade-in stagger-3">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Logga in som admin
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 lg:py-32 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
              Allt du behöver för dina event
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
              Från att skapa event till att exportera deltagarlistor – vi har tänkt på allt.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-5 md:p-8 rounded-xl md:rounded-2xl bg-background border hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-accent/10 flex items-center justify-center mb-4 md:mb-6">
                  <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-accent" />
                </div>
                <h3 className="font-display text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm md:text-base">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 md:py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-4 md:mb-6">
                Designad för{' '}
                <span className="text-accent">enkelhet</span>
              </h2>
              <p className="text-muted-foreground text-sm md:text-lg mb-6 md:mb-8">
                Vi vet att du har viktigare saker att göra än att brottas med komplicerade verktyg. 
                Därför har vi byggt en plattform som är enkel att använda men kraftfull nog att 
                hantera alla dina behov.
              </p>

              <div className="space-y-4 md:space-y-6">
                {benefits.map((benefit, index) => (
                  <div
                    key={benefit.title}
                    className="flex gap-3 md:gap-4 animate-fade-in"
                    style={{ animationDelay: `${(index + 1) * 100}ms` }}
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-0.5 md:mb-1 text-sm md:text-base">{benefit.title}</h3>
                      <p className="text-muted-foreground text-xs md:text-sm">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl md:rounded-3xl blur-2xl" />
              <div className="relative bg-card rounded-xl md:rounded-2xl border shadow-xl p-4 md:p-8">
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary flex items-center justify-center">
                    <Calendar className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm md:text-base">EventFlow</h4>
                    <p className="text-xs text-muted-foreground">Eventhantering</p>
                  </div>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  <div className="p-3 md:p-4 rounded-lg bg-secondary">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs md:text-sm font-medium text-foreground">Investeringsfrukost</span>
                      <span className="text-xs text-accent font-medium">32/50</span>
                    </div>
                    <div className="h-1.5 md:h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-[64%] bg-success rounded-full" />
                    </div>
                  </div>
                  <div className="p-3 md:p-4 rounded-lg bg-secondary">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs md:text-sm font-medium text-foreground">Digital säkerhet</span>
                      <span className="text-xs text-warning font-medium">28/30</span>
                    </div>
                    <div className="h-1.5 md:h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-[93%] bg-warning rounded-full" />
                    </div>
                  </div>
                  <div className="p-3 md:p-4 rounded-lg bg-secondary">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs md:text-sm font-medium text-foreground">Pensionsplanering</span>
                      <span className="text-xs text-muted-foreground font-medium">45/100</span>
                    </div>
                    <div className="h-1.5 md:h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-[45%] bg-success rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 lg:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl md:text-4xl font-bold mb-4 md:mb-6">
            Redo att komma igång?
          </h2>
          <p className="text-primary-foreground/80 text-sm md:text-lg mb-8 md:mb-10 max-w-2xl mx-auto">
            Skapa ditt första event på några minuter och börja samla anmälningar direkt.
          </p>
          <Link to="/auth">
            <Button variant="accent" size="xl" className="shadow-glow w-full sm:w-auto">
              Logga in som admin
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 md:py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-xs md:text-sm">
          <p>© 2025 EventFlow. Byggd med kärlek för moderna organisationer.</p>
        </div>
      </footer>
    </div>
  );
}
