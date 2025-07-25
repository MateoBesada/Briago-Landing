import Descuentoss from "/img/Otros/BannerFotos3-2.png";
import DescuentosTablet from "/img/Otros/BannerFotos3-1.png";
import DescuentosCelu from "../img/Probarbannercelu.png";

const BannerPrincipal = () => {
  return (
    <div className="w-full overflow-hidden shadow-xl">
      {/* Celular */}
      <img
        src={DescuentosCelu}
        alt="Banner celular"
        className="block sm:hidden w-full object-cover"
      />

      {/* Tablet */}
      <img
        src={DescuentosTablet}
        alt="Banner tablet"
        className="hidden sm:block lg:hidden w-full object-cover"
      />

      {/* Desktop */}
      <div className="hidden lg:block relative bg-white">

        {/* Imagen principal desktop */}
        <div className="w-full flex justify-center items-center">
          <img
            src={Descuentoss}
            alt="Banner desktop"
            className="w-full object-cover border-black"
          />
        </div>
      </div>
    </div>
  );
};

export default BannerPrincipal;
