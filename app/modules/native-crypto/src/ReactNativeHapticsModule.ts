import { Vibration } from 'react-native';

// O app é só web: vibração pela Vibration API do navegador, quando existir.
const module = {
  triggerClickHaptic() {
    try {
      Vibration.vibrate(50);
    } catch {}
  },
  triggerSlowRiseHaptic() {},
  cancelHaptic() {},
};

export const triggerSlowRiseHaptic = () => {
  module.triggerSlowRiseHaptic();
};

export const triggerClickHaptic = () => {
  module.triggerClickHaptic();
};

export const cancelHaptic = () => {
  module.cancelHaptic();
};

export default module;
