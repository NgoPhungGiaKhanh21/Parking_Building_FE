import Header from "./Header";
import Introduction from "./Introduction ";
import MiddleSectionSlider from "./MiddleSectionSlider";

export default function Home() {
  return (
    <div className="text-amber-900">
      <Header />
      <Introduction />
      <MiddleSectionSlider />
    </div>
  );
}
