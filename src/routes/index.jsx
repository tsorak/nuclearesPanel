import Poller from "../components/Poller.jsx";

export default function Home() {
  return (
    <main class="text-center mx-auto p-4 flex">
      <Poller
        varName="CORE_PRESSURE"
        title="Vessel Pressure"
        unit="bar"
        parse="1Decimal"
      />
      <Poller
        varName="CORE_TEMP"
        title="Internal Temperature"
        unit="°c"
        parse="Decimal"
      />
    </main>
  );
}
