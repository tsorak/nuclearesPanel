export default function PollerActiveControls(props) {
  const pollers = props.pollerStore;

  let lastActive = [];
  let lastAllMode = "off";

  const toggleActive = () => {
    const currentActives = Object.entries(pollers).filter((
      [_varName, poller],
    ) => poller.interval.active());

    // if anything is on
    if (currentActives.length > 0) {
      // if (lastActive.length === 0) {
      lastActive = currentActives;
      // }
      for (const [_, poller] of lastActive) {
        poller.interval.stop();
      }
    } else {
      if (lastActive.length === 0) return;

      for (const [_, poller] of lastActive) {
        poller.interval.restart();
      }
    }
  };
  const toggleAll = () => {
    const pollersIter = Object.entries(pollers);

    if (lastAllMode === "off") {
      pollersIter.filter(([_, poller]) => !poller.interval.active()).forEach(
        ([_, poller]) => {
          poller.interval.restart();
        },
      );
      lastAllMode = "on";
    } else {
      pollersIter.filter(([_, poller]) => poller.interval.active()).forEach(
        ([_, poller]) => {
          poller.interval.stop();
        },
      );
      lastAllMode = "off";
    }
  };

  return (
    <>
      <button
        type="button"
        class="bg-gray-600 text-white py-1 px-2 cursor-pointer"
        onclick={toggleActive}
      >
        Toggle Active
      </button>
      <button
        type="button"
        class="bg-gray-600 text-white py-1 px-2 cursor-pointer"
        onclick={toggleAll}
      >
        Toggle All
      </button>
    </>
  );
}
