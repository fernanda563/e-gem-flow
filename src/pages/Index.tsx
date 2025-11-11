import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gem, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted">
      <div className="text-center px-6 max-w-2xl">
        <div className="mb-8 flex justify-center">
          <div className="p-6 bg-accent/10 rounded-full">
            <Gem className="h-20 w-20 text-accent" />
          </div>
        </div>
        <h1 className="mb-4 text-5xl font-bold text-foreground">
          Joyería Relevée
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Sistema de Gestión Integral para Alta Joyería
        </p>
        <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
          Centraliza la gestión de clientes, pedidos y producción. 
          Control total desde la cotización hasta la entrega final.
        </p>
        <Button 
          onClick={() => navigate('/dashboard')}
          size="lg"
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold group"
        >
          Acceder al Sistema
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
