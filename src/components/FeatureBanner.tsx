import { useEffect, useState } from "react";
import { FaLock, FaHandshake } from "react-icons/fa";

const features = [
  {
    icon: <FaLock className="text-yellow-300 text-lg" />,
    text: "Pagos 100% seguros",
  },
  {
    icon: <FaHandshake className="text-yellow-300 text-2xl" />,
    text: "Atención personalizada",
  },
];

const FeatureBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-black border-y border-neutral-700 py-1 shadow-md w-full">
      <div className="max-w-7xl mx-auto px-4 text-sm text-white font-medium">
        {/* Desktop */}
        <div className="hidden sm:flex justify-around items-center gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 transition-transform duration-300 hover:translate-y-[2px]"
            >
              {feature.icon}
              <span>{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Mobile */}
        <div className="flex sm:hidden justify-center items-center gap-2 transition-all duration-500">
          {features[currentIndex].icon}
          <span>{features[currentIndex].text}</span>
        </div>
      </div>
    </section>
  );
};

export default FeatureBanner;
