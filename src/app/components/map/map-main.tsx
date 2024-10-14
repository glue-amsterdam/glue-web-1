"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MenuIcon, MapPin, LockIcon, UnlockIcon } from "lucide-react";
import { LocationGroup } from "@/utils/map-types";
import { motion } from "framer-motion";

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);

  return matches;
}

export default function MapMain({
  locationGroups,
}: {
  locationGroups: LocationGroup[];
}) {
  const getUser = () => {
    const user =
      Math.random() > 0.5 ? { id: 1, name: "Usuario Ejemplo" } : null;
    return user;
  };

  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [user, setUser] = useState<{ id: number; name: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Simular la verificación del usuario al cargar el componente
    setUser(getUser());
  }, []);

  const handleGroupSelect = (group) => {
    if (group.protected && !user) {
      setIsDialogOpen(true);
    }
  };

  const handleLocationSelect = (location, group) => {
    if (group.protected && !user) {
      setIsDialogOpen(true);
    } else {
      setSelectedLocation(location.id);
    }
  };

  const InfoPanel = ({ className = "" }: { className?: string }) => (
    <ScrollArea className={`h-full text-uiblack ${className}`}>
      <div className="p-4">
        {user && (
          <div className="mb-4 flex items-center justify-between">
            <Button variant="outline" onClick={() => setUser(null)}>
              Cerrar sesión
            </Button>
          </div>
        )}
        <Accordion type="single" collapsible className="w-full">
          {locationGroups.map((group) => (
            <AccordionItem key={group.id} value={group.id}>
              <AccordionTrigger onClick={() => handleGroupSelect(group)}>
                {group.title}
                {group.protected &&
                  (user ? (
                    <UnlockIcon className="ml-2 h-4 w-4 text-uigreen" />
                  ) : (
                    <LockIcon className="ml-2 h-4 w-4 text-uired" />
                  ))}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {group.locations.map((location) => (
                    <Button
                      key={location.id}
                      variant="outline"
                      className={`w-full justify-start ${
                        selectedLocation === location.id
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                      onClick={() => handleLocationSelect(location, group)}
                    >
                      <MapPin className="mr-2 h-4 w-4" aria-hidden="true" />
                      <span>{location.title}</span>
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </ScrollArea>
  );

  const MapPanel = () => (
    <div className="relative h-full">
      <Image
        src="/placeholders/google-placeholder.png"
        alt="Interactive world map showing various locations"
        fill
        className="rounded-lg object-cover"
        priority
      />

      {selectedLocation && (
        <div
          className="absolute w-6 h-6 bg-primary rounded-full"
          style={{
            left: `${
              locationGroups
                .flatMap((g) => g.locations)
                .find((l) => l.id === selectedLocation)?.coordinates.x
            }%`,
            top: `${
              locationGroups
                .flatMap((g) => g.locations)
                .find((l) => l.id === selectedLocation)?.coordinates.y
            }%`,
            transform: "translate(-50%, -50%)",
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );

  const LocationInfo = () => {
    const location = locationGroups
      .flatMap((g) => g.locations)
      .find((l) => l.id === selectedLocation);
    return location ? (
      <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg">
        <h2 className="text-lg font-semibold">{location.title}</h2>
        <p className="text-sm text-muted-foreground">{location.content}</p>
      </div>
    ) : null;
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 120 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="fixed inset-0 mt-[15vh]"
    >
      <h1 className="sr-only">GLUE MAP</h1>
      {isLargeScreen ? (
        <div className="flex h-full p-4 gap-4">
          <aside
            className="w-1/3 bg-card rounded-lg shadow-lg"
            aria-label="Location categories"
          >
            <InfoPanel />
          </aside>
          <section
            className="w-2/3 relative"
            aria-label="Map and location details"
          >
            <MapPanel />
            <LocationInfo />
          </section>
        </div>
      ) : (
        <>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-4 left-4 z-50 text-uiblack"
                aria-label="Open location menu"
              >
                <MenuIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav aria-label="Location categories">
                <InfoPanel className="mt-8" />
              </nav>
            </SheetContent>
          </Sheet>
          <section
            className="h-full relative"
            aria-label="Map and location details"
          >
            <MapPanel />
            <LocationInfo />
          </section>
        </>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="text-uiblack">
          <DialogHeader>
            <DialogTitle>Acceso restringido</DialogTitle>
            <DialogDescription>
              Necesitas iniciar sesión para acceder a este contenido.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setUser(getUser());
                setIsDialogOpen(false);
              }}
            >
              Iniciar sesión
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.main>
  );
}
