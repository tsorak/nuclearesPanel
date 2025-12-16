const makeController = () => ({
  state: null,
  sensors: {
    retentionTankVolume: null,
    retentionTankLevel: null,
  },
  intervalIds: {
    step: null,
  },
  toggle: function () {
    if (this.intervalIds.step !== null) {
      clearInterval(this.intervalIds.step);
      this.intervalIds.step = null;
    } else {
      this.intervalIds.step = setInterval(() => this.step(), 10000);
    }
  },
  stop: function () {
    if (this.intervalIds.step !== null) {
      clearInterval(this.intervalIds.step);
      this.intervalIds.step = null;
    }
  },

  step: function () {
    if (this.state === "WORKING") {
      //
    } else if (this.sensors.retentionTankLevel === null) {
      this.state = null;
    } else if (this.sensors.retentionTankLevel < 25) {
      this.state = "LOW";
    } else if (this.sensors.retentionTankLevel > 75) {
      this.state = "HIGH";
    } else {
      this.state = "NORMAL";
    }
  },
});
