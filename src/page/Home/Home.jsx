import BackGround from "./BackGround";
import Footer from "./Footer";
import Header from "./Header";
import Introduction from "./Introduction ";
import MiddleSectionSlider from "./MiddleSectionSlider";
import SystemOverview from "./SystemOverview";

export default function Home() {
  return (
    <div>
      <Header />
      <BackGround />
      <Introduction />
      <MiddleSectionSlider />
      <SystemOverview />
      <Footer />
    </div>
  );
}
